const db = require("../db/db")
const { redisClient } = require("../redis/redis.js")

class VideoDao {
    static async getUserVideos (userId) {
        const cacheKey = `user:${userId}:videos`
        const cachedVideos = await redisClient.get(cacheKey)

        if (cachedVideos !== null) {
            return JSON.parse(cachedVideos)
        }

        const result = await db.query(`SELECT * FROM videos WHERE user_id = $1`, [userId])

        const videos = result.rows

        await redisClient.set(cacheKey, JSON.stringify(videos), {
            EX: 300,
        })

        return videos
    }

    static async createVideo (userId, video) {
        const { title, description, category, contentKey, thumbnailKey, duration } = video

        const result = await db.query(
            `INSERT INTO videos (user_id, title, category_id, description, content_key, thumbnail_key, duration) 
            VALUES ($1, $2, (SELECT id FROM categories WHERE name = $3), $4, $5, $6, $7) RETURNING *`,
            [userId, title, category, description, contentKey, thumbnailKey, duration],
        )

        await Promise.all([
            redisClient.del(`user:${userId}:videos`),
            redisClient.del(`user:${userId}:videoCount`),
        ])
    }

    static async getVideosCount (userId) {
        const cacheKey = `user:${userId}:videoCount`

        const cachedVideosCount = await redisClient.get(cacheKey)

        if (cachedVideosCount !== null) {
            return Number(cachedVideosCount)
        }

        const result = await db.query(`SELECT COUNT(*) AS count FROM videos WHERE user_id = $1`, [
            userId,
        ])

        const videosCount = Number(result.rows[0].count)

        await redisClient.set(cacheKey, videosCount, {
            EX: 300,
        })

        return videosCount
    }

    static async deleteVideoById (videoId, userId) {
        const sql = `
        DELETE FROM videos
        WHERE id = $1 AND user_id = $2
        RETURNING id, content_key, thumbnail_key
        `
        const result = await db.query(sql, [videoId, userId])
        const deletedVideo = result.rows[0]

        if (!deletedVideo) {
            return null
        }

        await Promise.all([
            redisClient.del(`user:${userId}:videos`),
            redisClient.del(`user:${userId}:videoCount`),
        ])

        return {
            contentKey: deletedVideo.content_key,
            thumbnailKey: deletedVideo.thumbnail_key,
        }
    }

    static async isVideoLikedByUser (videoId, userId) {
        const cacheKey = `user:${userId}:video:${videoId}:likes`

        const cached = await redisClient.get(cacheKey)

        if (cached !== null) {
            return cached === "true"
        }

        const sql = `
        SELECT EXISTS(
            SELECT 1
            FROM likes
            WHERE video_id = $1
            AND user_id = $2
        ) AS liked
    `

        const res = await db.query(sql, [videoId, userId])
        const liked = !!res.rows[0].liked

        await redisClient.set(cacheKey, String(liked), {
            EX: 300,
        })

        return liked
    }

    static async likeVideo (videoId, userId) {
        const sql = `
            WITH inserted AS (
                INSERT INTO likes(user_id, video_id)
                VALUES ($1, $2)
                ON CONFLICT DO NOTHING
                RETURNING video_id
            )
            UPDATE videos
            SET likes = likes + 1
            WHERE id IN (SELECT video_id FROM inserted)
            RETURNING id;
        `

        const res = await db.query(sql, [userId, videoId])
        const liked = res.rows.length > 0

        if (!liked) { 
            return false
        }

        const cacheKey = `user:${userId}:video:${videoId}:likes`
        await redisClient.set(cacheKey, 'true', {
            EX: 300,
        })
        
        return true
    }

    static async deleteLike (videoId, userId) {
        const sql = `
            WITH deleted AS (
                DELETE FROM likes
                WHERE user_id = $1 AND video_id = $2
                RETURNING video_id
            )
            UPDATE videos
            SET likes = likes - 1
            WHERE id IN (SELECT video_id FROM deleted)
            RETURNING id;
        `

        const res = await db.query(sql, [userId, videoId])
        const removedLike = res.rows.length > 0

        if (!removedLike) { 
            return false
        }

        const cacheKey = `user:${userId}:video:${videoId}:likes`

        await redisClient.del(cachKey)

        return true
    }

    static async getTotalViews(userId) {
        const cacheKey = `user:${userId}:totalViews`

        const cached = await redisClient.get(cacheKey)

        if (cached !== null) { 
            return Number(cached)
        }

        const result = await db.query(
            `SELECT COUNT(video_id) AS totalViews 
        FROM views 
        WHERE user_id = $1`,
            [userId],
        )

        const totalViews = Number(result.rows[0].totalviews)

        await redisClient.set(cacheKey, totalViews, {
            EX: 300
        })

        return totalViews
    }

    static async getVideoById(videoId) {
        const cacheKey = `video:${videoId}`

        const cached = await redisClient.get(cacheKey)

        if (cached !== null) { 
            return JSON.parse(cached)
        }

        const result = await db.query(`SELECT * FROM videos WHERE id = $1`, [videoId])

        const video = result.rows[0] || null

        if (!video) {
            return null
        }

        await redisClient.set(cacheKey, JSON.stringify(video), {
            EX: 300
        })

        return video
    }
}

module.exports = VideoDao
