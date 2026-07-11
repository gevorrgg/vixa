const UserService = require('../services/userService')
const ProfileService = require('../services/profileService')

class ProfileController {
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

module.exports = ProfileController
