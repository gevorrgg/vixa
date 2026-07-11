const express = require('express')
const UserController = require('../controllers/userController')
const { optionalMiddleware, authMiddleware } = require('./middleware')

const router = express.Router()

router.get('/:userId/stats', UserController.getUserStats)
router.get('/search', optionalMiddleware, UserController.searchUsers)
router.get('/:userId/follow-status', authMiddleware, UserController.followState)
router.post('/:userId/follow', authMiddleware, UserController.follow)
router.delete('/:userId/unfollow', authMiddleware, UserController.unfollow)
router.get('/:userId/profile', UserController.getProfile)
router.get('/:userId/profile/avatar-upload-url', UserController.getAvatarUploadUrl)
router.patch('/:userId/profile', UserController.updateProfile)

module.exports = router