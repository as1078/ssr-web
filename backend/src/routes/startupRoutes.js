const express = require("express")
const auth = require("../middleware/authMiddleware")
const Clip = require("../models/ClipModel")
const User = require("../models/UserModel")
const { createObjectMap } = require("../utils/createObjectMap")
const {
	getRandomTranscript,
	getNTranscripts,
} = require("../utils/getTranscript")

const startupRoutes = express.Router()

startupRoutes.get("/", auth, async (req, res) => {
	const user = await User.findById(req.user._id).select("-password")
	const { transcriptMap, transcriptIds } = await getNTranscripts(5, user)
	const clips = await Clip.find({ user: req.user._id })
		.sort({ createdAt: -1 })
		.limit(20)
		.populate("transcript")
	const totalDuration = await Clip.aggregate([
		{ $match: { user: user._id } },
		{ $group: { _id: "$user", totalDuration: { $sum: "$duration" } } },
	])
	const numTotalClips = await Clip.countDocuments({ user: user._id })
	const [clipIds, clipMap] = createObjectMap(clips)
	res.send({
		user,
		transcriptIds,
		transcripts: transcriptMap,
		clipIds,
		clips: clipMap,
		totalDuration: totalDuration.length ? totalDuration[0].totalDuration : 0,
		numTotalClips,
	})
})

module.exports = startupRoutes
