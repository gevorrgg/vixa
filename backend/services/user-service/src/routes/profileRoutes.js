const express = require('express')
const ProfileController = require('../controllers/profileController')
const { authMiddleware } = require('./middleware')

const router = express.Router()

router.get('/', ProfileController.getProfile)
router.get('/avatar-upload-url', ProfileController.getAvatarUploadUrl)
router.patch('/', ProfileController.updateProfile)

module.exports = router