function omit(obj, omittedKeys) {
	obj = obj._doc
	const keys = Object.keys(obj).filter((key) => !omittedKeys.includes(key))
	const newObj = {}
	keys.forEach((key) => {
		newObj[key] = obj[key]
	})
	return newObj
}

module.exports = omit
