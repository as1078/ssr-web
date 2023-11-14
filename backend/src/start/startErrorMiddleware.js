const asyncErrorHandler = require("../middleware/errorMiddleware")

function startErrorMiddleware(app) {
	app.use(asyncErrorHandler)
}

module.exports = startErrorMiddleware
