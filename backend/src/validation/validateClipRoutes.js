const Joi = require("joi")

function validateUploadClip(clipInfo) {
	const schema = Joi.object({
		clipMetadata: Joi.array()
			.items(
				Joi.object({
					transcriptId: Joi.string()
						.max(100)
						.required(),
					duration: Joi.number().required(),
					speechPattern: Joi.string().required(),
				}),
			)
			.required(),
	}).required()
	return schema.validate(clipInfo)
}

function validateReplaceTranscript(replaceTranscriptInfo) {
	const schema = Joi.object({
		transcriptId: Joi.string()
			.max(100)
			.required(),
	}).required()
	return schema.validate(replaceTranscriptInfo)
}

module.exports = { validateUploadClip, validateReplaceTranscript }
