const VideoService = require('../services/videoService')

class VideoController {
    static async getUserVideos (req, res) {
        const userId = Number(req.params.userId)

        if (Number.isNaN(userId)) {
            return res
                .status(400)
                .json({ ok: false, message: 'Invalid userId' })
        }

        const videos = await VideoService.getUserVideos(userId)

        return res.json({ videos })
    }

    static async getVideoUploadUrl (req, res) {
        const userId = Number(req.params.userId)
        const { contentType, thumbnailType } = req.body


        if (Number.isNaN(userId)) {
            return res
                .status(400)
                .json({ ok: false, message: 'Invalid userId' })
        }

        try {
            const content = await VideoService.getContentUploadUrl(
                userId,
                contentType
            )

            if (thumbnailType === null) {
                return res.json({
                    ok: true,
                    content: content
                })
            }

            const thumbnail = await VideoService.getThumbnailUploadUrl(
                userId,
                thumbnailType
            )

            return res.json({
                ok: true,
                content: content,
                thumbnail: thumbnail
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ ok: false, message: error.message })
        }
    }

    static async createVideo (req, res) {
        const video = req.body
        const userId = Number(req.params.userId)

        if (Number.isNaN(userId)) {
            return res
                .status(400)
                .json({ ok: false, message: 'Invalid userId' })
        }

        const createResult = await VideoService.createVideo(userId, video)

        if (!createResult.ok) {
            return res.status(500).json({ ok: false, message: 'Server error' })
        }

        return res.json({ ok: true })
    }
}

module.exports = VideoController
