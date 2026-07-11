const express = require('express')
const VideoController = require('../controllers/videoController')
const { authMiddleware } = require('./middleware')

const router = express.Router()

// Get all videos by user
router.get('/:userId', VideoController.getUserVideos)
router.post(
    '/:userId/upload-url',
    authMiddleware,
    VideoController.getVideoUploadUrl
)
router.post(
    '/:userId/:videoId/like',
    authMiddleware,
    VideoController.likeVideo
)
router.get('/:userId/:videoId/like-status', authMiddleware, VideoController.videoLikeStatus)
router.get('/:userId/total-views', VideoController.getTotalViews)
router.get('/:userId/count', VideoController.getVideosCount)
router.post('/:userId', authMiddleware, VideoController.createVideo)
router.delete('/:userId/:videoId', authMiddleware, VideoController.deleteVideo)
router.delete('/:userId/:videoId/like', authMiddleware, VideoController.removeLike)



module.exports = router
