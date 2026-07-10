const db = require("./db")

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
            [userId],
        )

        const row = result.rows[0]

        if (!row) return null

        return row
    }

    static async updateUsername (userId, newUsername) {
        const query = await db.query(`UPDATE users SET username = $1 WHERE id = $2`, [
            newUsername,
            userId,
        ])
    }

    static async getUserIdByEmail (email) {
        const queryResult = await db.query(
            `
            SELECT id FROM users WHERE email = $1`,
            [email],
        )

        if (queryResult.rows.length === 0) return null

        return queryResult.rows[0].id
    }

    static async getUserIdByUsername (username) {
        const queryResult = await db.query(`SELECT id AS id FROM users WHERE username = $1 `, [
            username,
        ])

        if (queryResult.rows.length === 0) return null

        return queryResult.rows[0].id
    }

    static async getFollowersCount (userId) {
        const result = await db.query(
            `SELECT COUNT(*) AS followersCount FROM followers WHERE following_id = $1`,
            [userId],
        )

        return Number(result.rows[0].followerscount)
    }

    static async getTotalViews (userId) {
        const result = await db.query(
            `SELECT COUNT(video_id) AS totalViews 
        FROM views 
        WHERE user_id = $1`,
            [userId],
        )

        return Number(result.rows[0].totalviews)
    }

    static async searchUsers (prefix, userId, limit) {
        if (userId == null) {
            const sql = `
            SELECT
                u.id,
                u.username,
                p.name,
                p.avatar_key,
                u.followers_count AS "followersCount",
                FALSE AS following
            FROM users u
            LEFT JOIN profiles p
                ON p.user_id = u.id
            WHERE u.username ILIKE $1
            ORDER BY u.followers_count DESC, u.username ASC
            LIMIT $2
        `

            const res = await db.query(sql, [`${prefix}%`, limit])

            return res.rows
        }

        const sql = `
        SELECT
            u.id,
            u.username,
            p.name,
            p.avatar_key,
            u.followers_count,
            EXISTS (
                SELECT 1
                FROM followers f
                WHERE f.follower_id = $2
                  AND f.following_id = u.id
            ) AS following
        FROM users u
        LEFT JOIN profiles p
            ON p.user_id = u.id
        WHERE u.username ILIKE $1
          AND u.id <> $2
        ORDER BY u.followers_count DESC, u.username ASC
        LIMIT $3
    `

        const res = await db.query(sql, [`${prefix}%`, userId, limit])

        return res.rows
    }

    static async follow(followingId, followerId) { 
        const sql = `
            WITH followed AS (
                INSERT INTO followers(following_id, follower_id)
                VALUES ($1, $2)
                ON CONFLICT DO NOTHING
                RETURNING following_id
            )
            UPDATE users
            SET followers_count = followers_count + 1
            WHERE id IN (SELECT following_id FROM followed)
            RETURNING id
        `

        const result = await db.query(sql, [followingId, followerId])

        return !!result.rows[0]
    }

    static async unfollow(followingId, followerId) { 
        const sql = `
            WITH deleted AS (
                DELETE FROM followers
                WHERE following_id = $1 AND follower_id = $2
                RETURNING following_id
            )
            UPDATE users
            SET followers_count = followers_count - 1
            WHERE id IN (SELECT following_id FROM deleted)
            RETURNING id
        `

        const result = await db.query(sql, [followingId, followerId])

        console.log(result.rows[0])

        return !!result.rows[0]
    }
}

module.exports = UserDao
