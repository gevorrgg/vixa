const express = require('express')
const VideoController = require('../controllers/videos')

const router = express.Router()

router.get('/:userId/videos', VideoController.getUserVideos)
router.post(
    '/:userId/videos/upload-url',
    VideoController.getVideoUploadUrl
)
router.post('/:userId/videos', VideoController.createVideo)

module.exports = router
