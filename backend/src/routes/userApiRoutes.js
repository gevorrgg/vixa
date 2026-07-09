const express = require('express')
const UserApiController = require('../controllers/userApi')
const { optionalMiddleware } = require('../middleware/middleware')

const router = express.Router()

router.get('/:userId/stats', UserApiController.getUserStats)
router.get('/search', optionalMiddleware, UserApiController.searchUsers)

module.exports = router