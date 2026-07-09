const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const pool = require("../dao/db")
const UserDao = require("../dao/userDao")

class UserService {
    static async getUserInfo (userId) {
        const userInfo = await UserDao.getUserInfo(userId)

        if (!userInfo) return null

        const avatarUrl = userInfo.avatar_key
            ? `https://${process.env.CLOUD_FRONT_DOMAIN}/${userInfo.avatar_key}`
            : null

        return {
            id: userInfo.id,
            email: userInfo.email,
            username: userInfo.username,
            age: userInfo.age ?? null,
            bio: userInfo.bio ?? null,
            gender: userInfo.gender ?? null,
            avatarUrl: avatarUrl,
            website: userInfo.website ?? null,
            location: userInfo.location ?? null,
            name: userInfo.name ?? null,
        }
    }

    static async updateUsername (userId, username) {
        try {
            await UserDao.updateUsername(userId, username)
        } catch (error) {
            const userAlreadyExists = error.code === "23505"

            if (userAlreadyExists)
                return {
                    status: 409,
                    ok: false,
                    message: "Username already taken",
                }

            return { status: 500, ok: false, message: "Server error" }
        }

        return {
            status: 200,
            ok: true,
            message: "Successfuly updated username",
        }
    }

    static async getUserId (username) {
        return await (username.includes("@")
            ? UserDao.getUserIdByEmail(username)
            : UserDao.getUserIdByUsername(username))
    }

    static async getFollowersCount (userId) {
        const followersCounut = await UserDao.getFollowersCount(userId)

        return followersCounut
    }

    static async getTotalViews (userId) {
        const views = await UserDao.getTotalViews(userId)

        return views
    }

    static async searchUsers (prefix, limit = 10) {
        try {
            if (!prefix || prefix.trim().length === 0) {
                return {
                    status: 400,
                    ok: false,
                    message: "Prefix is required",
                }
            }

            const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50)

            const users = await UserDao.searchUsers(prefix.trim(), safeLimit)

            return {
                status: 200,
                ok: true,
                users,
            }
        } catch (error) {
            console.error(error)

            return {
                status: 500,
                ok: false,
                message: "Server error",
            }
        }
    }
}

module.exports = UserService
