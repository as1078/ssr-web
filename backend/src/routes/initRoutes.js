const express = require("express")
const { readFileSync, appendFileSync, unlinkSync, exists } = require("fs")

const Clip = require("../models/ClipModel")
const Transcript = require("../models/TranscriptModel")

const initRoutes = express.Router()

initRoutes.post("/transcripts", async (req, res) => {
	console.log("reading")
	const filename = "public/transcripts.txt"
	const contents = readFileSync(filename, "utf8")
	const arr = contents.split(/\n/).slice(0, 100000)
	console.log(arr[0])
	console.log(arr[1])
	console.log("arr.length", arr.length)
	await Transcript.deleteMany({})
	let i = 0
	console.log("starting")
	await Promise.all(
		arr.map(async (line) => {
			i++
			if (i % 1000 == 0) {
				console.log("starting", i)
			}
			const [fileName, transcript] = line.split("$")
			if (!fileName || !transcript) return
			const newTranscript = new Transcript({
				transcript,
				fileName,
			})
			await newTranscript.save()
			if (i % 1000 == 0) {
				console.log("ending", i)
			}
		}),
	)
	res.send({ nice: "nice" })
})

initRoutes.get("/data", async (req, res) => {
	const filename = "public/clipData.csv"
	exists(filename, function(exists) {
		if (exists) {
			unlinkSync(filename)
		}
	})
	const csvRows = []
	const clips = await Clip.find({})
		.populate("transcript")
		.sort({ createdAt: 1 })
	const columnNames = [
		"sentence",
		"url",
		"fileName",
		"commonVoiceFileName",
		"speechPatterns",
		"userId",
		"sentenceId",
		"date",
		"numberOfClipsWithSentence",
		"numberOfSkipsForSentence",
		"approximateDuration",
	]
	const csvColumnNameString = columnNames.join(",")
	csvRows.push(csvColumnNameString)
	clips.forEach((clip) => {
		const { user, speechPatterns, url, createdAt, duration, fileName } = clip
		const { transcript, numberOfClips, numberOfSkips } = clip.transcript
		const commonVoiceFileName = clip.transcript.fileName
		const csvRow = {
			sentence: transcript,
			url,
			fileName,
			commonVoiceFileName,
			speechPatterns: speechPatterns.join(","),
			userId: user.toString(),
			sentenceId: clip.transcript._id.toString(),
			date: createdAt,
			numberOfClipsWithSentence: numberOfClips,
			numberOfSkipsForSentence: numberOfSkips,
			approximateDuration: duration,
		}
		const csvValues = Object.values(csvRow).map((value) => {
			if (typeof value === "string") {
				return `"${value}"`
			}
			return value
		})
		const csvRowString = csvValues.join(",")
		csvRows.push(csvRowString)
	})
	const csvString = csvRows.join("\n")
	appendFileSync(filename, csvString)
	res.send({ nice: "nice" })
})

module.exports = initRoutes
