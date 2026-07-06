const express = require('express')
const UserPageController = require('../controllers/userPage')

const router = express.Router()

router.get('/:username', UserPageController.getUser)

module.exports = router