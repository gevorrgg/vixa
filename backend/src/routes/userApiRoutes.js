const express = require('express')
const UserApiController = require('../controllers/userApi')

const router = express.Router()

router.get('/:userId/stats', UserApiController.getUserStats)

module.exports = router