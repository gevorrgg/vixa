const express = require('express')
const VideoController = require('../controllers/videoController')
const { authMiddleware } = require('./middleware')

const router = express.Router()

router.get('/:userId/videos', VideoController.getUserVideos)
router.post(
    '/:userId/videos/upload-url',
    authMiddleware,
    VideoController.getVideoUploadUrl
)
router.post(
    '/:userId/videos/:videoId/like',
    authMiddleware,
    VideoController.likeVideo
)
router.get('/:userId/videos/:videoId/like-status', authMiddleware, VideoController.videoLikeStatus)
router.get('/:userId/total-views', VideoController.getTotalViews)
router.post('/:userId/videos', authMiddleware, VideoController.createVideo)
router.delete('/:userId/videos/:videoId', authMiddleware, VideoController.deleteVideo)
router.delete('/:userId/videos/:videoId/like', authMiddleware, VideoController.removeLike)


module.exports = router
