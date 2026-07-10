const env = require('dotenv')
const app = require('./app')

// ===== start server =====
const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`)
})