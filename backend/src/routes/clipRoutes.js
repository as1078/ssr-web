const express = require("express")
const multer = require("multer")
const AWS = require("aws-sdk")
const config = require("config")
const ffmpeg = require("fluent-ffmpeg")
const fs = require("fs")
const path = require("path")
const { v4: uuidv4 } = require("uuid")

const User = require("../models/UserModel")
const auth = require("../middleware/authMiddleware")
const Transcript = require("../models/TranscriptModel")
const {
	getRandomTranscript,
	getNTranscripts,
} = require("../utils/getTranscript")
const {
	validateUploadClip,
	validateReplaceTranscript,
} = require("../validation/validateClipRoutes")
const getError = require("../utils/getError")
const Clip = require("../models/ClipModel")

const rootDirName = __dirname.replace("src/routes", "")
const clipRoutes = express.Router()

const storage = multer.diskStorage({
	destination: "./uploads/",
	filename: function(req, file, cb) {
		cb(null, uuidv4() + path.parse(file.originalname).ext)
	},
})
const upload = multer({ storage }).any("clips")
const aws_id = config.get("aws_id")
const aws_secret = config.get("aws_secret")
const aws_bucket_name = config.get("aws_bucket_name")
const s3 = new AWS.S3({
	accessKeyId: aws_id,
	secretAccessKey: aws_secret,
	Bucket: aws_bucket_name,
})

// Define helper functions
function removeFile(absolutePath) {
	// Deletes a file at the specified absolute path
	fs.unlink(absolutePath, (err) => {
		if (err) throw err
	})
}

async function createClipDocument(clip, user, metadata, newFileName) {
	// Creates a new clip document in the database
	const { speechPattern, transcriptId, duration } = metadata

	// Set the URI for the clip file in S3
	const uri = `s3://ssr-data/${newFileName}`
	const url = `https://ssr-data.s3.amazonaws.com/${newFileName}`
	const speechPatternList = [speechPattern]

	// Update the new clip document
	clip.user = user._id
	clip.transcript = transcriptId
	clip.speechPatterns = speechPatternList
	clip.duration = duration
	clip.uri = uri
	clip.url = url
	clip.fileName = newFileName

	// Save the clip and transcript documents
	await clip.save()
}

function uploadFile(
	newAbsoluteFilePath,
	newFileName,
	oldAbsoluteFilePath,
	metadata,
	user,
	res,
) {
	// Uploads a file to S3 and creates a new clip document in the database

	// Create empty clip document to use for _id field of the file name
	const clip = new Clip({})
	const s3Key = `${clip._id}.wav`

	// Read the contents of the new file
	fs.readFile(newAbsoluteFilePath, function(err, data) {
		if (!err) {
			// Upload the file to S3
			const params = {
				Bucket: aws_bucket_name,
				Key: s3Key,
				Body: data,
			}
			s3.putObject(params, function(err, data) {
				if (!err) {
					// Create the new clip document
					createClipDocument(clip, user, metadata, s3Key)
				} else {
					console.error(err)
					res.status(400).send("Couldn't upload clip")
				}

				// Remove the old and new files from the server
				removeFile(newAbsoluteFilePath)
				removeFile(oldAbsoluteFilePath)
			})
		}
	})
}

async function handleClip(user, res, file, metadata) {
	// Set up the file paths and names for the original and converted files
	const oldFileName = file.filename
	const oldFilePath = file.path
	const oldAbsoluteFilePath = path.join(rootDirName, file.path)
	const newFileName = `${user._id}_${oldFileName.replace(".m4a", ".wav")}`
	const newAbsoluteFilePath = path.join(rootDirName, "converted/", newFileName)

	// Convert the file to WAV format and save it to disk
	ffmpeg(oldFilePath)
		.audioCodec("pcm_s16le")
		.audioFrequency(16000)
		.audioChannels(1)
		.format("wav")
		.on("error", function(err) {
			// Handle any errors that occur during conversion
			console.error("An error occurred: " + err.message)
			res.status(400).send("Couldn't convert file")
		})
		.on("end", function() {
			// After conversion is finished, upload the converted file to S3 and create a Clip document
			uploadFile(
				newAbsoluteFilePath,
				newFileName,
				oldAbsoluteFilePath,
				metadata,
				user,
				res,
			)
		})
		.save(newAbsoluteFilePath)
}

clipRoutes.post("/upload", auth, upload, async (req, res) => {
	// Validate the upload clip request query parameters
	const result = validateUploadClip(req.query)
	if (result.error) return res.status(400).send(getError(result))
	const { clipMetadata } = result.value

	// Get the user
	const user = await User.findById(req.user._id).select("-password")

	// Check if files were uploaded
	const { files } = req
	if (!files || files.length !== 5) {
		return res.status(400).send("Files failed to upload")
	}

	// Check if the file size is too large
	for (const file of files) {
		const fiveMB = 5 * 1024 * 1024
		if (file.size > fiveMB) {
			return res.status(400).send("File too large")
		}
	}

	// Update the number of clips for the associated transcript so that getting new transcripts will work
	const previousTranscriptIds = clipMetadata.map(
		(metadata) => metadata.transcriptId,
	)
	await Promise.all(
		previousTranscriptIds.map(async (transcriptId) => {
			const transcript = await Transcript.findById(transcriptId)
			transcript.numberOfClips += 1
			await transcript.save()
		}),
	)

	// Convert each file to .wav, upload to S3, and create a Clip document
	await Promise.all(
		files.map(async (file, i) => {
			const metadata = clipMetadata[i]
			await handleClip(user, res, file, metadata)
		}),
	)

	// Send back 5 new random transcripts to record
	const { transcriptMap, transcriptIds } = await getNTranscripts(5, user)
	res.send({
		transcriptMap,
		transcriptIds,
	})
})

clipRoutes.get("/replace", auth, async (req, res) => {
	const result = validateReplaceTranscript(req.query)
	if (result.error) return res.status(400).send(getError(result))
	const oldTranscriptId = result.value.transcriptId
	const oldTranscript = await Transcript.findById(oldTranscriptId)
	if (!oldTranscript) return res.status(400).send("Transcript not found")
	oldTranscript.numberOfSkips++
	await oldTranscript.save()
	const user = await User.findById(req.user._id)
	const { transcripts, transcriptId } = await getRandomTranscript(user)
	res.send({ transcriptMap: transcripts, newTranscriptId: transcriptId })
})

module.exports = clipRoutes
