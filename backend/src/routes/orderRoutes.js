const express = require('express')
const { getAll, create, updateStatus, clearAll } = require('../controllers/orderController')
const authMiddleware = require('../middlewares/authMiddleware')
const router = express.Router()

// Rota pública — loja do cliente finaliza compra
router.post('/public', create)

// Rotas protegidas — painel admin
router.use(authMiddleware)
router.get('/', getAll)
router.patch('/:id', updateStatus)
router.delete('/clear', clearAll)

module.exports = router