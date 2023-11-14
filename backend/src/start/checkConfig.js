const config = require("config")

function checkConfig() {
	if (!config.get("jwtPrivateKey")) {
		throw new Error("FATAL ERROR: jwtPrivateKey not provided")
	}
	if (!config.get("aws_id")) {
		throw new Error("FATAL ERROR: aws_id not provided")
	}
	if (!config.get("aws_secret")) {
		throw new Error("FATAL ERROR: aws_secret not provided")
	}
	if (!config.get("aws_bucket_name")) {
		throw new Error("FATAL ERROR: aws_bucket_name not provided")
	}
}

module.exports = checkConfig
