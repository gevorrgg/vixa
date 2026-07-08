const db = require("./db")

class VideoDao {
    static async getUserVideos (userId) {
        const result = await db.query(`SELECT * FROM videos WHERE user_id = $1`, [userId])

        const videos = result.rows

        if (!videos) return null

        return videos
    }

    static async createVideo (userId, video) {
        const { title, description, category, contentKey, thumbnailKey, duration } = video

        const result = await db.query(
            `INSERT INTO videos (user_id, title, category_id, description, content_key, thumbnail_key, duration) 
            VALUES ($1, $2, (SELECT id FROM categories WHERE name = $3), $4, $5, $6, $7) RETURNING *`,
            [userId, title, category, description, contentKey, thumbnailKey, duration],
        )
    }

    static async getVideosCount (userId) {
        const result = await db.query(`SELECT COUNT(*) AS count FROM videos WHERE user_id = $1`, [
            userId,
        ])

        return Number(result.rows[0].count)
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

        return {
            contentKey: deletedVideo.content_key,
            thumbnailKey: deletedVideo.thumbnail_key,
        }
    }

    static async isVideoLikedByUser (videoId, userId) {
        const sql = `
        SELECT EXISTS(
            SELECT 1
            FROM likes
            WHERE video_id = $1
            AND user_id = $2
        ) AS liked
    `

        const res = await db.query(sql, [videoId, userId])

        return res.rows[0].liked
    }
}

module.exports = VideoDao
