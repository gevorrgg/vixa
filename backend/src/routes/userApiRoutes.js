const express = require('express')
const UserApiController = require('../controllers/userApi')
const { optionalMiddleware, authMiddleware } = require('../middleware/middleware')

const router = express.Router()

router.get('/:userId/stats', UserApiController.getUserStats)
router.get('/search', optionalMiddleware, UserApiController.searchUsers)
router.get('/:userId/follow-state')
router.post('/:userId/follow', authMiddleware, UserApiController.follow)
router.delete('/:userId/unfollow', authMiddleware, UserApiController.unfollow)

module.exports = router