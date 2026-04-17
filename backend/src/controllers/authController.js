const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos.' })
    }

    const existing = await prisma.admin.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: 'E-mail já cadastrado.' })
    }

    const hashed = await bcrypt.hash(password, 12)

    const admin = await prisma.admin.create({
      data: { name, email, password: hashed },
    })

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.status(201).json({
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email },
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Erro interno no servidor.' })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos.' })
    }

    const admin = await prisma.admin.findUnique({ where: { email } })
    if (!admin) {
      return res.status(401).json({ error: 'Credenciais inválidas.' })
    }

    const valid = await bcrypt.compare(password, admin.password)
    if (!valid) {
      return res.status(401).json({ error: 'Credenciais inválidas.' })
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.json({
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email },
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Erro interno no servidor.' })
  }
}

module.exports = { register, login }