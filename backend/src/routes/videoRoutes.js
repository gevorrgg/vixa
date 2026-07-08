const express = require('express')
const VideoController = require('../controllers/videos')
const authMiddlewear = require('../middleware/middleware')

const router = express.Router()

router.get('/:userId/videos', VideoController.getUserVideos)
router.post(
    '/:userId/videos/upload-url',
    authMiddlewear,
    VideoController.getVideoUploadUrl
)
router.post('/:userId/videos', authMiddlewear, VideoController.createVideo)
router.delete('/:userId/videos/:videoId', authMiddlewear, VideoController.deleteVideo)

module.exports = router
