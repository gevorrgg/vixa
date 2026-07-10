const db = require('../db/db')

class AuthDao {
    static async createUser(email, username, passwordHash) {

        const result = await db.query(
            `INSERT INTO users(email, username, password_hash) VALUES ($1, $2, $3) RETURNING id`,
            [email, username, passwordHash]
        )

        return result.rows[0].id
    }


    static async getUserByEmail (email) {
        const result = await db.query(
            `SELECT 
                id,
                email,
                username,
                password_hash
            FROM users WHERE email = $1`,
            [email]
        )

        return result.rows[0]
    }

    static async getUserByUsername (username) {
        const result = await db.query(
            `SELECT 
                id,
                email,
                username,
                password_hash
            FROM users  WHERE username = $1`,
            [username]
        )

        return result.rows[0]
    }
}

module.exports = AuthDao
