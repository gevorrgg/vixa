const express = require('express')
const VideoController = require('../controllers/videos')
const { authMiddleware } = require('../middleware/middleware')

const router = express.Router()

router.get('/:userId/videos', VideoController.getUserVideos)
router.post(
    '/:userId/videos/upload-url',
    authMiddleware,
    VideoController.getVideoUploadUrl
)
router.post('/:userId/videos', authMiddleware, VideoController.createVideo)
router.delete('/:userId/videos/:videoId', authMiddleware, VideoController.deleteVideo)

module.exports = router
