const mongoose = require("mongoose")
const config = require("config")

function startDB() {
	const db = config.get("db")
	mongoose
		.connect(db)
		.then(() => console.log(`Connected to db ${db}...`))
		.catch((e) => console.log(`Failed to connect to db: ${e.message}`))
}

module.exports = startDB
