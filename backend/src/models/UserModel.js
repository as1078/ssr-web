const mongoose = require("mongoose")
const config = require("config")
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			maxlength: 100,
			unique: true,
		},
		password: {
			type: String,
			required: true,
			maxLength: 100,
		},
		stutterPattern: {
			type: String,
			required: true,
		},
		age: {
			type: Number,
			required: true,
		},
		gender: {
			type: String,
			required: true,
		},
		pitch: {
			type: String,
			required: true,
		},
		accent: {
			type: String,
			required: true,
		},
		otherCharacteristics: {
			type: String,
		},
		numRecordedClips: {
			type: Number,
			default: 0,
		},
		reRecordingSpeechPattern: {
			type: String,
		},
	},
	{ timestamps: true },
)

userSchema.methods.generateAuthToken = function generateAuthToken() {
	const token = jwt.sign(
		{
			_id: this._id,
			username: this.username,
		},
		config.get("jwtPrivateKey"),
	)
	return token
}

const User = mongoose.model("User", userSchema)

module.exports = User
