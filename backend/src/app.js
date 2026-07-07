const express = require('express')
const cors = require('cors')
require('dotenv').config()
const path = require("path");

const authRouter = require('./routes/authRoutes')
const profileRouter = require('./routes/profileRoutes')
const userApiRouter = require('./routes/userApiRoutes')
const videoRouter = require('./routes/videoRoutes')

const app = express()

app.use(express.json())
app.use(express.static(path.join(__dirname, "dist")));

// ===== API ROUTES =====
app.use('/api/auth', authRouter)
app.use('/api/users', userApiRouter)
app.use('/api/users', profileRouter)
app.use('/api/users', videoRouter)

// ===== health check =====
app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.use((req, res) => {
    res.sendFile(path.join(__dirname, "dist/index.html"));
})

// ===== start server =====
const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`)
})