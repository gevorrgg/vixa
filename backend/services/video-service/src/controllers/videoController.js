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
                    content: content,
                    thumbnail: null
                })
            }

            const thumbnail = await VideoService.getThumbnailUploadUrl(
                userId,
                thumbnailType
            )

            return res.json({
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

    static async deleteVideo(req, res) { 
        const videoId = req.params.videoId
        const userId = req.params.userId 

        if (userId != req.user.id) {
            return res.status(403).json({ok: false, message: 'forbidden'})
        }

        if (!userId) {
            return res.status(401).json({ok: false, message: 'Unauthorized'})
        }

        const deleteResult = await VideoService.deleteVideo(videoId, userId)

        if (!deleteResult.ok) {
            return res.status(400).json({ok: false, message: 'Could not delete video'})
        }

        return res.json({ok: true})
    }

    static async videoLikeStatus(req, res) {
        const videoId = req.params.videoId
        const userId = req.params.userId

        if (userId != req.user.id) { 
            return res.status(403).json({ok: false, message: 'forbidden'})
        }

        const likeStatus = await VideoService.likeStatus(videoId, userId)

        if (!likeStatus.ok) { 
            return res.status(likeStatus.status).json({ok: false, message: likeStatus.message})
        }

        return res.json({ok: true, liked: likeStatus.isLiked})
    }

    static async likeVideo(req, res) { 
        const videoId = req.params.videoId
        const userId = req.params.userId

        const likeStatus = await VideoService.likeVideo(videoId, userId)

        if (!likeStatus.ok) { 
            return res.status(likeStatus.status).json({ok: false, message: likeStatus.message})
        }

        return res.json({ok: true})
    }

    static async removeLike(req, res) { 
        const videoId = req.params.videoId
        const userId = req.params.userId

        const likeStatus = await VideoService.removeLike(videoId, userId)

        if (!likeStatus.ok) { 
            return res.status(likeStatus.status).json({ok: false, message: likeStatus.message})
        }

        return res.json({ok: true})
    }

    static async getTotalViews(req, res) { 
        const userId = req.params.userId

        if (Number.isNaN(userId)) { 
            return res.status(400).json({ok: false, message: 'Invalid userId'})
        }

        const totalViews = VideoService.getTotalViews(userId)

        return res.json({ ok: true, totalViews: totalViews })
    }

    static async getVideoById(req, res) {
        const videoId = req.params.videoId

        if (!videoId) {
            return res.status(400).json({ ok: false, message: 'Invalid videoId' })
        }

        const video = await VideoService.getVideoById(videoId)

        if (!video) {
            return res.status(404).json({ ok: false, message: 'Video not found' })
        }

        return res.json({ video })
    }
}

module.exports = VideoController
