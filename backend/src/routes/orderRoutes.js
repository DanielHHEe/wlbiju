const express = require('express')
const { getAll, create, updateStatus, arquivarOne, arquivarAll, getRevenue } = require('../controllers/orderController')
const authMiddleware = require('../middlewares/authMiddleware')
const userAuthMiddleware = require('../middlewares/userAuthMiddleware')
const router = express.Router()

// Rota pública protegida por auth do usuário
router.post('/public', userAuthMiddleware, create)

// Rotas protegidas — painel admin
router.use(authMiddleware)
router.get('/revenue', getRevenue)
router.get('/', getAll)
router.patch('/:id', updateStatus)
router.patch('/:id/arquivar', arquivarOne)
router.post('/arquivar-todos', arquivarAll)

module.exports = router