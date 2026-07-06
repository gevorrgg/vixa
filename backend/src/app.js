const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRouter = require('./routes/authRoutes')
const profileRouter = require('./routes/profileRoutes')
const userApiRouter = require('./routes/userApiRoutes')
const videoRouter = require('./routes/videoRoutes')

const app = express()

// ===== CORS =====
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())

// ===== API ROUTES =====
app.use('/api/auth', authRouter)
app.use('/api/users', userApiRouter)
app.use('/api/users', profileRouter)
app.use('/api/videos', videoRouter)

// ===== health check =====
app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

// ===== start server =====
const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`)
})