const express = require("express")
const cors = require('cors');
const bodyParser = require('body-parser');

function startMiddleware(app) {
	app.use(express.json())
	app.use(cors());
	app.use(bodyParser.json());
}

module.exports = startMiddleware
