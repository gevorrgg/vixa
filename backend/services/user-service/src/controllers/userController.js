const UserService = require("../services/userService")
const ProfileService = require("../services/profileService")

class UserController {
    static async getUserStats (req, res) {
        const userId = Number(req.params.userId)

        if (Number.isNaN(userId)) {
            return res.status(400).json({ ok: false, message: "Invalid userId" })
        }

        const result = await UserService.getUserStats(userId)

        if (!result.ok) { 
            return res.status(result.status).json({ok: false, message: result.message})
        }

        return res.json(result.stats)
    }

    static async searchUsers (req, res) {
        const { prefix, limit } = req.query
        const userId = req.user ? req.user.id : null

        const result = await UserService.searchUsers(prefix, userId, limit)

        const response = {
            users: result.users,
        }

        return res.status(result.status).json(response)
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

    static async followState (req, res) {
        const targetUserId =  req.params.userId
        const currentUserId = req.user.id

        if (Number.isNaN(targetUserId)) {
            return res.status(400).json({ ok: false, message: "Invalid id" })
        }

        const result = await UserService.followState(targetUserId, currentUserId)

        if (!result.ok) {
            return res.status(result.status).json({ ok: false, message: result.message })
        }

        return res.json({
            following: result.following,
        })
    }

      static async getProfile (req, res) {
        const userId = req.params.userId

        if (Number.isNaN(userId)) {
            return res
                .status(400)
                .json({ ok: false, message: 'Invalid userId' })
        }

        const userInfo = await UserService.getUserInfo(userId)

        if (userInfo === null)
            return res
                .status(404)
                .json({ ok: false, message: 'User not found' })

        const isOwner = true //req.user.userId === userId

        userInfo.isOwner = isOwner

        res.json(userInfo)
    }

    static async getAvatarUploadUrl (req, res) {
        const  userId  = Number(req.params.userId);
        const { type } = req.query;

        if (Number.isNaN(userId)) {
            return res
                .status(400)
                .json({ ok: false, message: 'Invalid userId' })
        }

        const { uploadUrl, key } = await ProfileService.getAvatarUploadUrl(userId, type)

        res.json({ok: true, uploadUrl, key })
    }

    static async updateProfile (req, res) {
        const userId = Number(req.params.userId)

        if (Number.isNaN(userId)) {
            return res
                .status(400)
                .json({ ok: false, message: 'Invalid userId' })
        }

        const result = await ProfileService.updateProfile(userId, req.body)

        if (!result.ok) {
            return res.status(result.status).josn({
                ok: false,
                message: result.message
            })
        }

        return res.json({ ok: true, message: 'Successfully updated profile' })
    }
}

module.exports = UserController
