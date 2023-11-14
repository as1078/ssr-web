const Joi = require("joi")

function validateChangeReRecordPattern(reRecordInfo) {
	const schema = Joi.object({
		reRecordPattern: Joi.string()
			.required()
			.allow(""),
	})
	return schema.validate(reRecordInfo)
}

module.exports = { validateChangeReRecordPattern }
