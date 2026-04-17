const express = require('express')
const { getAll, create, update, remove, updateStock } = require('../controllers/productController')
const authMiddleware = require('../middlewares/authMiddleware')
const router = express.Router()

router.use(authMiddleware)

router.get('/', getAll)
router.post('/', create)
router.put('/:id', update)
router.delete('/:id', remove)
router.patch('/:id/stock', updateStock)

module.exports = router