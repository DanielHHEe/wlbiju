const express = require('express')
const { register, login, me } = require('../controllers/userController')
const userAuthMiddleware = require('../middlewares/userAuthMiddleware')
const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', userAuthMiddleware, me)

module.exports = router