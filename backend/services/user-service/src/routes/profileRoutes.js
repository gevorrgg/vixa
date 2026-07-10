const express = require('express')
const ProfileController = require('../controllers/profileController')
const { authMiddleware } = require('./middleware')

const router = express.Router()

router.get('/:userId/profile', ProfileController.getProfile)
router.get('/:userId/profile/avatar-upload-url', ProfileController.getAvatarUploadUrl)
router.patch('/:userId/profile', ProfileController.updateProfile)

module.exports = router