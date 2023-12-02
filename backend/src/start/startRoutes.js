const authRoutes = require("../routes/authRoutes")
const clipRoutes = require("../routes/clipRoutes")
const initRoutes = require("../routes/initRoutes")
const rootRoutes = require("../routes/rootRoutes")
const startupRoutes = require("../routes/StartupRoutes")
const { userRoutes } = require("../routes/userRoutes")

function startRoutes(app) {
	app.use("/", rootRoutes)
	app.use("/auth", authRoutes)
	app.use("/startup", startupRoutes)
	app.use("/clip", clipRoutes)
	app.use("/user", userRoutes)
	app.use("/init", initRoutes)
}

module.exports = startRoutes
