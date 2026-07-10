const UserService = require("../services/userService")
const VideoService = require("../services/videoService")

class UserApiController {
    static async getUserStats (req, res) {
        const userId = Number(req.params.userId)

        if (Number.isNaN(userId)) {
            return res.status(400).json({ ok: false, message: "Invalid userId" })
        }

        const videosCount = await VideoService.getVideosCount(userId)

        const followersCount = await UserService.getFollowersCount(userId)

        const totalViews = await UserService.getTotalViews(userId)

        return res.json({ videosCount, followersCount, totalViews })
    }

    static async searchUsers (req, res) {
        const { prefix, limit } = req.query
        const userId = req.user ? req.user.id : null

        const result = await UserService.searchUsers(prefix, userId, limit)

        return res.status(result.status).json({ users: result.users })
    }

    static async follow (req, res) {
        if (!req.user) {
            return res.status(401).json({ ok: false, message: "Unauthorized" })
        }

        const followingId = req.params.userId
        const followerId = req.user.id

        if (Number.isNaN(followingId)) {
            return res.status(400), json({ ok: false, message: "Invalid id" })
        }

        const result = await UserService.follow(followingId, followerId)

        if (!result.ok) {
            return res.status(result.status).json({ ok: false, message: result.status })
        }

        return res.json({ ok: true })
    }

    static async unfollow (req, res) {
        if (!req.user) {
            return res.status(401).json({ ok: false, message: "Unauthorized" })
        }

        const followingId = req.params.userId
        const followerId = req.user.id

        if (Number.isNaN(followingId)) {
            return res.status(400), json({ ok: false, message: "Invalid id" })
        }

        const result = await UserService.unfollow(followingId, followerId)

        if (!result.ok) {
            return res.status(result.status).json({ ok: false, message: result.status })
        }

        return res.json({ ok: true })
    }
}

module.exports = UserApiController
