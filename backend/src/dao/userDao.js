const db = require('./db')

class UserDao {
    static async getUserInfo (userId) {
        const result = await db.query(
            `SELECT 
            users.id,
            users.email,
            users.username,
            profiles.age,
            profiles.bio,
            profiles.gender,
            profiles.avatar_key,
            profiles.website,
            profiles.location,
            profiles.name
        FROM
            users
        LEFT JOIN
            profiles ON profiles.user_id = users.id
        WHERE
            users.id = $1`,
            [userId]
        )

        const row = result.rows[0]

        if (!row) return null

        return row
    }

    static async updateUsername (userId, newUsername) {
        const query = await db.query(
            `UPDATE users SET username = $1 WHERE id = $2`,
            [newUsername, userId]
        )
    }

    static async getUserIdByEmail (email) {
        const queryResult = await db.query(
            `
            SELECT id FROM users WHERE email = $1`,
            [email]
        )

        if (queryResult.rows.length === 0) return null

        return queryResult.rows[0].id
    }

    static async getUserIdByUsername (username) {
        const queryResult = await db.query(
            `SELECT id AS id FROM users WHERE username = $1 `,
            [username]
        )

        if (queryResult.rows.length === 0) return null

        return queryResult.rows[0].id
    }

    static async getFollowersCount (userId) {
        const result = await db.query(
            `SELECT COUNT(*) AS followersCount FROM followers WHERE following_id = $1`,
            [userId]
        )

        return Number(result.rows[0].followerscount)
    }

    static async getTotalViews (userId) {
        const result = await db.query(
            `SELECT COUNT(video_id) AS totalViews 
        FROM views 
        WHERE user_id = $1`,
            [userId]
        )

        return Number(result.rows[0].totalviews)
    }
}

module.exports = UserDao
