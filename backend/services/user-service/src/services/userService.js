const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const pool = require("../db/db")
const UserDao = require("../dao/userDao")
const VideoClient = require("../clients/videoServiceClient")

class UserService {
    static async getUserInfo (userId) {
        const userInfo = await UserDao.getUserInfo(userId)

        console.log(userId)

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

    static async getUserStats (userId) {
        const followersCount = await UserService.getFollowersCount(userId)

        if (followersCount === null) {
            return { status: 404, ok: false, message: "Could not find user" }
        }

        const totalViewsCount = await VideoClient.getTotalViews(userId)

        if (totalViewsCount === null) {
            return { status: 404, ok: false, message: "Could not find user" }
        }

        const videosCount = await VideoClient.getVideosCount(userId)

        if (videosCount === null) {
            return { status: 404, ok: false, message: "Could not find user" }
        }

        return {
            status: 200,
            ok: true,
            stats: {
                totalViews: totalViewsCount,
                videosCount: videosCount,
                followersCount: followersCount,
            },
        }
    }

    static async getFollowersCount (userId) {
        const followersCount = await UserDao.getFollowersCount(userId)

        return followersCount
    }

    static async getTotalViews (userId) {
        const views = await VideoClient.getTotalViews(userId)

        return views
    }

    static async searchUsers (prefix, userId, limit = 10) {
        try {
            if (!prefix || prefix.trim().length === 0) {
                return {
                    status: 400,
                    ok: false,
                    message: "Prefix is required",
                }
            }

            const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50)

            const users = await UserDao.searchUsers(prefix.trim(), userId, safeLimit)

            const result = users.map(user => ({
                id: user.id,
                username: user.username,
                name: user.name,
                avatarUrl: user.avatar_key
                    ? `https://${process.env.CLOUD_FRONT_DOMAIN}/${user.avatar_key}`
                    : null,
                followers: user.followers_count,
                following: user.following,
            }))

            return {
                status: 200,
                ok: true,
                users: result,
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

    static async follow (followingId, followerId) {
        try {
            const followed = await UserDao.follow(followingId, followerId)

            if (!followed) {
                return { status: 409, ok: false, message: "User already subscirbed" }
            }

            return { ok: true }
        } catch (error) {
            console.error(error)

            return { status: 500, ok: false, message: "Server error" }
        }
    }

    static async unfollow (followingId, followerId) {
        try {
            const unfollowed = await UserDao.unfollow(followingId, followerId)

            if (!unfollowed) {
                return { status: 404, ok: false, message: "Could not find user" }
            }

            return { ok: true }
        } catch (error) {
            console.error(error)

            return { status: 500, ok: false, message: "Server error" }
        }
    }

    static async followState (targetUserId, currentUserId) {
        try {
            const following = await UserDao.followState(targetUserId, currentUserId)

            return {
                status: 200,
                ok: true,
                following,
            }
        } catch (error) {
            console.error(error)

            return {
                status: 500,
                ok: false,
                message: error.message,
            }
        }
    }
}

module.exports = UserService
