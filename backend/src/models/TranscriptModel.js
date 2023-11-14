const mongoose = require("mongoose")

const transcriptSchema = new mongoose.Schema(
	{
		transcript: {
			type: String,
			required: true,
			max: 2000,
		},
		fileName: {
			type: String,
			required: true,
		},
		numberOfClips: {
			type: Number,
			default: 0,
		},
		numberOfSkips: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true },
)

const Transcript = mongoose.model("Transcript", transcriptSchema)

module.exports = Transcript
