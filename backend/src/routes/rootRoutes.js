const express = require("express")

const rootRoutes = express.Router()

rootRoutes.get("/", (req, res) => {
	res.send("Hello World!")
})

module.exports = rootRoutes
