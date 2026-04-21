const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const getAll = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { criadoEm: 'desc' },
    })
    res.json(orders)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar pedidos' })
  }
}

const create = async (req, res) => {
  try {
    const { items, total, frete } = req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Itens inválidos' })
    }

    const order = await prisma.order.create({
      data: {
        total,
        frete: frete ?? null,
        status: 'completed', // já entra como Concluído
        items: {
          create: items.map(item => ({
            name: item.name,
            category: item.category || '',
            price: item.price,
            qty: item.qty,
            imageUrl: item.imageUrl || null,
            subtotal: item.subtotal,
          })),
        },
      },
      include: { items: true },
    })

    res.status(201).json(order)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao criar pedido' })
  }
}

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatus = ['completed']
    if (!validStatus.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' })
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    })

    res.json(order)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao atualizar status' })
  }
}

const clearAll = async (req, res) => {
  try {
    await prisma.orderItem.deleteMany({})
    await prisma.order.deleteMany({})
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao limpar pedidos' })
  }
}

module.exports = { getAll, create, updateStatus, clearAll }