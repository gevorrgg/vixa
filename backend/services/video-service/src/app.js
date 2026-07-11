const express = require("express")
const cors = require("cors")
require("dotenv").config()
const path = require("path")

const videoRouter = require("./routes/videoRoutes")

const app = express()

app.use(express.json())

// ===== API ROUTES =====
app.use("/api/videos", videoRouter)

// ===== health check =====
app.get("/api/health", (req, res) => {
    res.json({ ok: true })
})

module.exports = app
