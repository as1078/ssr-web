const express = require("express")
const auth = require("../middleware/authMiddleware")
const User = require("../models/UserModel")
const getError = require("../utils/getError")
const {
	validateChangeReRecordPattern,
} = require("../validation/validateUserRoutes")

const userRoutes = express.Router()

userRoutes.put("/changeReRecordPattern", auth, async (req, res) => {
	const result = validateChangeReRecordPattern(req.body)
	if (result.error) return res.status(400).send(getError(result))
	const { reRecordPattern } = result.value
	const user = await User.findById(req.user._id).select("-password")
	user.reRecordingSpeechPattern = reRecordPattern
	await user.save()
	res.send({ user })
})

module.exports = { userRoutes }
