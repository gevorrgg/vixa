const express = require("express")
const cors = require("cors")
require("dotenv").config()
const path = require("path")

const videoRouter = require("./routes/videoRoutes")

const app = express()

app.use(express.json())
app.use(express.static(path.join(__dirname, "dist")))

// ===== API ROUTES =====
app.use("/api/users", videoRouter)

// ===== health check =====
app.get("/api/health", (req, res) => {
    res.json({ ok: true })
})

module.exports = app
