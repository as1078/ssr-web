const Joi = require("joi")

function validateNewUser(userInfo) {
	const schema = Joi.object({
		username: Joi.string()
			.max(100)
			.required(),
		password: Joi.string()
			.max(100)
			.required(),
		stutterPattern: Joi.string()
			.max(100)
			.required(),
		age: Joi.number().required(),
		gender: Joi.string()
			.max(100)
			.required(),
		accent: Joi.string()
			.max(100)
			.required(),
		pitch: Joi.string()
			.max(100)
			.required(),
		otherCharacteristics: Joi.string()
			.max(100)
			.allow(""),
	}).required()
	return schema.validate(userInfo)
}

function validateLogin(loginInfo) {
	const schema = Joi.object({
		username: Joi.string()
			.max(100)
			.required(),
		password: Joi.string()
			.max(100)
			.required(),
	}).required()
	return schema.validate(loginInfo)
}

module.exports = { validateNewUser, validateLogin }
