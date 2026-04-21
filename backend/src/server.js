require('dotenv').config()
const express = require('express')
const cors = require('cors')

const authRoutes    = require('./routes/authRoutes')
const productRoutes = require('./routes/productRoutes')
const orderRoutes   = require('./routes/orderRoutes')   // ← ADICIONE

const app = express()

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://wlbiju.vercel.app'
  ]
}))

app.use(express.json())

app.use('/api/auth',     authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders',   orderRoutes)   // ← ADICIONE

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))