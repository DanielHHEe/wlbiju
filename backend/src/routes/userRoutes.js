const express = require('express')
const { register, login, me, updateAddress } = require('../controllers/userController')
const userAuthMiddleware = require('../middlewares/userAuthMiddleware')
const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', userAuthMiddleware, me)
router.patch('/address', userAuthMiddleware, updateAddress)

module.exports = router