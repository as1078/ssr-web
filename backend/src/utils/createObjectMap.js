function createObjectMap(documents) {
	const map = {}
	const ids = []
	documents.forEach((doc) => {
		map[doc._id] = doc
		ids.push(doc._id)
	})
	return [ids, map]
}

module.exports = { createObjectMap }
