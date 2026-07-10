const QueryBuilder = require('../db/queryBuilder')
const db = require('../db/db')

const fieldMap = {
    userId: 'user_id',
    username: 'username',
    avatarKey: 'avatar_key',
    name: 'name',
    location: 'location',
    bio: 'bio',
    website: 'website',
    gender: 'gender'
}

const queryBuilder = new QueryBuilder(fieldMap)

class ProfileDao {
    static async create (profile) {
        const sql = queryBuilder.insert('profiles', profile)
        const params = Object.entries(profile).map(([_, value]) => value)

        await db.query(sql, params)
    }

    static async update (profile, userId) {
        const sql = queryBuilder.update('profiles', userId, profile)

        const values = Object.entries(profile).map(element => element[1])
        values.push(userId)

        await db.query(sql, values)
    }

    static async hasUserProfile (userId) {
        const result = await db.query(
            `SELECT EXISTS (
            SELECT 1
            FROM profiles
            WHERE user_id = $1
        )`,
            [userId]
        )

        return result.rows[0].exists
    }

    static async getAvatarKey (userId) {
        const result = await db.query(
            `SELECT avatar_key
            FROM profiles
            WHERE user_id = $1`,
            [userId]
        )

        return result.rows[0]?.avatar_key || null
    }

    static async updateAvatarKey(userId, avatarKey) {
        const sql = queryBuilder.update('profiles', userId, { avatarKey })
        const values = [avatarKey, userId]

        await db.query(sql, values)
    }
}

module.exports = ProfileDao
