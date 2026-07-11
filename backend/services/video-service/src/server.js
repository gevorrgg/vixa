const app = require('./app')
const { redisClient } = require('./redis/redis')

const PORT = process.env.PORT || 8080

async function startServer() {
    try {
        await redisClient.connect()

        app.listen(PORT, () => {
            console.log(`API running on port ${PORT}`)
        })
    } catch (error) {
        console.error('Failed to start server:', error)
        process.exit(1)
    }
}

startServer()