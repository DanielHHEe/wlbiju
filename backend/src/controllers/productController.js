const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const getAll = async (req, res) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
    return res.json(products)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Erro ao buscar produtos.' })
  }
}

const create = async (req, res) => {
  try {
    const { name, price, category, description, stock, imageUrl } = req.body
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Preencha os campos obrigatórios.' })
    }
    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        category,
        description: description || '',
        stock: parseInt(stock) || 0,
        imageUrl: imageUrl || null,
      }
    })
    return res.status(201).json(product)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Erro ao criar produto.' })
  }
}

const update = async (req, res) => {
  try {
    const { id } = req.params
    const { name, price, category, description, stock, imageUrl } = req.body
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        price: parseFloat(price),
        category,
        description: description || '',
        stock: parseInt(stock) || 0,
        imageUrl: imageUrl || null,
      }
    })
    return res.json(product)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Erro ao atualizar produto.' })
  }
}

const remove = async (req, res) => {
  try {
    const { id } = req.params
    await prisma.product.delete({ where: { id } })
    return res.json({ success: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Erro ao excluir produto.' })
  }
}

const updateStock = async (req, res) => {
  try {
    const { id } = req.params
    const { stock } = req.body
    const product = await prisma.product.update({
      where: { id },
      data: { stock: parseInt(stock) }
    })
    return res.json(product)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Erro ao atualizar estoque.' })
  }
}

module.exports = { getAll, create, update, remove, updateStock }