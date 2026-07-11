const { redisClient } = require("../../../video-service/src/redis/redis")
const db = require("../db/db")
const { redisClient } = require("../redis/redis")

class AuthDao {
    static async createUser (email, username, passwordHash) {
        const result = await db.query(
            `INSERT INTO users(email, username, password_hash) VALUES ($1, $2, $3) RETURNING id`,
            [email, username, passwordHash],
        )

        return result.rows[0].id
    }

    static async getUserByEmail (email) {
        const cacheKey = `user:${username}`

        const cachedUser = await redisClient.get(cachKey)

        if (cachedUser !== null) {
            return JSON.parse(cachedUser)
        }

        const result = await db.query(
            `SELECT 
                id,
                email,
                username,
                password_hash
            FROM users WHERE email = $1`,
            [email],
        )

        const user = result.rows[0]

        if (!user) {
            return user
        }

        await redisClient.set(cacheKey, JSON.stringify(user), {
            EX: 300,
        })

        return user
    }

    static async getUserByUsername (username) {
        const cacheKey = `user:${username}`

        const cachedUser = await redisClient.get(cachKey)

        if (cachedUser !== null) {
            return JSON.parse(cachedUser)
        }

        const result = await db.query(
            `SELECT 
                id,
                email,
                username,
                password_hash
            FROM users  WHERE username = $1`,
            [username],
        )

        const user = result.rows[0]

        if (!user) {
            return user
        }

        await redisClient.set(cacheKey, JSON.stringify(user), {
            EX: 300,
        })

        return user
    }
}

module.exports = AuthDao
