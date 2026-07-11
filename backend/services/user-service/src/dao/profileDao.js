const QueryBuilder = require("../db/queryBuilder")
const db = require("../db/db")
const { redisClient } = require("../redis/redis")

const fieldMap = {
    userId: "user_id",
    username: "username",
    avatarKey: "avatar_key",
    name: "name",
    location: "location",
    bio: "bio",
    website: "website",
    gender: "gender",
}

const queryBuilder = new QueryBuilder(fieldMap)

class ProfileDao {
    static async create (profile) {
        const sql = queryBuilder.insert("profiles", profile)
        const params = Object.entries(profile).map(([_, value]) => value)

        await db.query(sql, params)

        await Promise.all([
            redisClient.del(`user:${profile.userId}:hasProfile`),
            redisClient.del(`user:${profile.userId}:userInfo`),
        ])
    }

    static async update (profile, userId) {
        const sql = queryBuilder.update("profiles", userId, profile)

        const values = Object.entries(profile).map(element => element[1])
        values.push(userId)

        await db.query(sql, values)


        await Promise.all([
            redisClient.del(`user:${userId}:hasProfile`),
            redisClient.del(`user:${userId}:userInfo`),
        ])
    }

    static async hasUserProfile (userId) {
        const cacheKey = `user:${userId}:hasProfile`

        const cached = await redisClient.get(cacheKey)

        if (cached !== null) {
            return cached === "true"
        }

        const result = await db.query(
            `SELECT EXISTS (
            SELECT 1
            FROM profiles
            WHERE user_id = $1
        )`,
            [userId],
        )

        const hasProfile = result.rows[0].exists

        await redisClient.set(cacheKey, String(hasProfile), {
            EX: 300,
        })

        return hasProfile
    }

    static async getAvatarKey (userId) {
        const cacheKey = `user:${userId}:avatarKey`

        const cached = await redisClient.get(cacheKey)

        if (cached !== null) {
            return cached
        }

        const result = await db.query(
            `SELECT avatar_key
            FROM profiles
            WHERE user_id = $1`,
            [userId],
        )

        const avatarKey = result.rows[0]?.avatar_key || null

        if (!avatarKey) {
            return null
        }

        await redisClient.set(cacheKey, avatarKey, {
            EX: 300,
        })

        return avatarKey
    }

    static async updateAvatarKey (userId, avatarKey) {
        const sql = queryBuilder.update("profiles", userId, { avatarKey })
        const values = [avatarKey, userId]

        await db.query(sql, values)

        const cacheKey = `user:${userId}:avatarKey`
        await redisClient.set(cacheKey, avatarKey, {
            EX: 300,
        })
    }
}

module.exports = ProfileDao
