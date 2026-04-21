const express = require('express')
const { getAll, create, updateStatus, arquivarOne, arquivarAll, getRevenue } = require('../controllers/orderController')
const authMiddleware = require('../middlewares/authMiddleware')
const router = express.Router()

// Rota pública — loja do cliente finaliza compra
router.post('/public', create)

// Rotas protegidas — painel admin
router.use(authMiddleware)
router.get('/revenue', getRevenue)
router.get('/', getAll)
router.patch('/:id', updateStatus)
router.patch('/:id/arquivar', arquivarOne)
router.post('/arquivar-todos', arquivarAll)

module.exports = router