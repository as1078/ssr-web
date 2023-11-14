function getError(result) {
	return result.error.details[0].message
}

module.exports = getError
