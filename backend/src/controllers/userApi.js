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

        return res.status(result.status).json(result)
    }
}

module.exports = UserApiController
