const Clip = require("../models/ClipModel")
const Transcript = require("../models/TranscriptModel")

async function getRandomTranscript(user) {
	const speechPattern = user.reRecordingSpeechPattern
		? user.reRecordingSpeechPattern
		: ""
	if (speechPattern === "") {
		const count = await Transcript.count()
		const randomOffset = Math.floor(Math.random() * count)
		let minNumberOfClips = 0
		let randomTranscript = null
		while (!randomTranscript) {
			randomTranscript = await Transcript.findOne({
				numberOfClips: minNumberOfClips,
			}).skip(randomOffset)
			minNumberOfClips++
		}
		const transcriptId = randomTranscript._id
		const transcripts = { [transcriptId]: randomTranscript }
		return { transcripts, transcriptId }
	} else {
		// TODO this is going to be slow
		const allClips = await Clip.find({ user: user._id, speechPattern })
		const transcriptIds = allClips.map((clip) => clip.transcript)
		const randomOffset = Math.floor(Math.random() * transcriptIds.length)
		const transcript = await Transcript.findOne({
			_id: { $in: transcriptIds },
			numberOfClips: 1,
		}).skip(randomOffset)
		if (!transcript) {
			return { transcripts: {}, transcriptId: null }
		}
		const transcriptId = transcript._id
		const transcripts = { [transcriptId]: transcript }
		return { transcripts, transcriptId }
	}
}

async function getNTranscripts(n, user) {
	const speechPattern = user.reRecordingSpeechPattern
		? user.reRecordingSpeechPattern
		: ""
	if (speechPattern === "") {
		let transcriptMap = []
		let transcriptIds = []
		const indices = [...Array(n).keys()]
		await Promise.all(
			indices.map(async (_) => {
				const { transcripts, transcriptId } = await getRandomTranscript(user)
				transcriptMap = { ...transcriptMap, ...transcripts }
				transcriptIds.push(transcriptId)
			}),
		)
		return { transcriptMap, transcriptIds }
	} else {
		// TODO this is going to be slow
		const allClips = await Clip.find({ user: user._id, speechPattern })
		const transcriptIds = allClips.map((clip) => clip.transcript)
		const usedTranscripts = await Transcript.find({
			_id: { $in: transcriptIds },
			numberOfClips: 1,
		}).limit(n)
		if (usedTranscripts.empty) {
			return { transcriptMap: {}, transcriptIds: [] }
		}
		const transcriptMap = {}
		const usedTranscriptIds = []
		usedTranscripts.forEach((transcript) => {
			transcriptMap[transcript._id] = transcript
			usedTranscriptIds.push(transcript._id)
		})
		return { transcriptMap, transcriptIds: usedTranscriptIds }
	}
}

module.exports = { getRandomTranscript, getNTranscripts }
