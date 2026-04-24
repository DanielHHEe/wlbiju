const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const register = async (req, res) => {
  try {
    const { name, email, password, telefone } = req.body

    if (!name || !email || !password || !telefone)
      return res.status(400).json({ error: 'Preencha todos os campos.' })

    if (password.length < 6)
      return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' })

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists)
      return res.status(400).json({ error: 'Este e-mail já está cadastrado.' })

    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, password: hash, telefone },
    })

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, telefone: user.telefone },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao cadastrar usuário.' })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password)
      return res.status(400).json({ error: 'Preencha todos os campos.' })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user)
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid)
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' })

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user.id, name: user.name, email: user.email, telefone: user.telefone,
        cep: user.cep, rua: user.rua, numero: user.numero,
        bairro: user.bairro, cidade: user.cidade, estado: user.estado,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao fazer login.' })
  }
}

const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true, name: true, email: true, telefone: true,
        cep: true, rua: true, numero: true,
        bairro: true, cidade: true, estado: true,
        createdAt: true,
      },
    })
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuário.' })
  }
}

const updateAddress = async (req, res) => {
  try {
    const { cep, rua, numero, bairro, cidade, estado } = req.body

    if (!cep || !rua || !numero || !bairro || !cidade || !estado)
      return res.status(400).json({ error: 'Preencha todos os campos do endereço.' })

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { cep, rua, numero, bairro, cidade, estado },
      select: {
        id: true, name: true, email: true, telefone: true,
        cep: true, rua: true, numero: true,
        bairro: true, cidade: true, estado: true,
      },
    })

    res.json({ user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao atualizar endereço.' })
  }
}

module.exports = { register, login, me, updateAddress }