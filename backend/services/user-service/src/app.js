const express = require('express')
const cors = require('cors')
require('dotenv').config()
const path = require("path");

const authRouter = require('./routes/authRoutes')
const profileRouter = require('./routes/profileRoutes')
const userRouter = require('./routes/userRoutes')

const app = express()

app.use(express.json())

// ===== API ROUTES =====
app.use('/api/auth', authRouter)
app.use('/api/users/:userId/profile', profileRouter)
app.use('/api/users', userRouter)

// ===== health check =====
app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

module.exports = app