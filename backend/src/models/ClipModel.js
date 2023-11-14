const mongoose = require("mongoose")

/*
clips
	user_id-clip_id
transcripts
	user_id-clip_id
*/

/*
trancript selection algorithm
store a collection in the database of all the transcripts that have and haven't been recorded
select a random clip from the not recorded database, and then after it's done, transfer that clip the recorded database

*/

const clipSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		speechPatterns: {
			type: [String],
		},
		transcript: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Transcript",
		},
		duration: {
			type: Number,
		},
		uri: {
			type: String,
		},
		url: {
			type: String,
		},
		fileName: {
			type: String,
		},
	},
	{ timestamps: true },
)

const Clip = mongoose.model("Clip", clipSchema)

module.exports = Clip
