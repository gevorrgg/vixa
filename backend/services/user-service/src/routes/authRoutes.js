const express = require('express')
const AuthController = require('../controllers/authController')
const { authMiddleware } = require('./middleware')

const router = express.Router()

router.post('/login', AuthController.login)
router.post('/register', AuthController.register)
router.get('/me', authMiddleware, AuthController.getMe)

module.exports = router
