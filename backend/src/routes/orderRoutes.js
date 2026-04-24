const express = require('express')
const { getAll, create, updateStatus, updateDeliveryStatus, getMyOrders, arquivarOne, arquivarAll, getRevenue } = require('../controllers/orderController')
const authMiddleware = require('../middlewares/authMiddleware')
const userAuthMiddleware = require('../middlewares/userAuthMiddleware')
const router = express.Router()

// Rotas do usuário logado (cliente)
router.post('/public', userAuthMiddleware, create)
router.get('/my-orders', userAuthMiddleware, getMyOrders)

// Rotas protegidas — painel admin
router.use(authMiddleware)
router.get('/revenue', getRevenue)
router.get('/', getAll)
router.patch('/:id', updateStatus)
router.patch('/:id/delivery-status', updateDeliveryStatus)
router.patch('/:id/arquivar', arquivarOne)
router.post('/arquivar-todos', arquivarAll)

module.exports = router