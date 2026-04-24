const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const DELIVERY_STATUS = ['dispatched', 'at_branch', 'out_for_delivery', 'delivered']

const getAll = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { arquivado: false },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true, telefone: true } },
      },
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
    const userId = req.userId || null

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Itens inválidos' })
    }

    const order = await prisma.order.create({
      data: {
        total,
        frete: frete ?? null,
        status: 'completed',
        deliveryStatus: 'dispatched',
        arquivado: false,
        userId,
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
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true, telefone: true } },
      },
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
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true, telefone: true } },
      },
    })

    res.json(order)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao atualizar status' })
  }
}

// Atualiza status de entrega (admin)
const updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { deliveryStatus } = req.body

    if (!DELIVERY_STATUS.includes(deliveryStatus)) {
      return res.status(400).json({ error: 'Status de entrega inválido' })
    }

    const order = await prisma.order.update({
      where: { id },
      data: { deliveryStatus },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true, telefone: true } },
      },
    })

    res.json(order)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao atualizar status de entrega' })
  }
}

// Busca pedidos do usuário logado
const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      include: { items: true },
      orderBy: { criadoEm: 'desc' },
    })
    res.json(orders)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar seus pedidos' })
  }
}

const arquivarOne = async (req, res) => {
  try {
    const { id } = req.params
    const order = await prisma.order.update({
      where: { id },
      data: { arquivado: true },
    })
    res.json(order)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao arquivar pedido' })
  }
}

const arquivarAll = async (req, res) => {
  try {
    await prisma.order.updateMany({
      where: { arquivado: false },
      data: { arquivado: true },
    })
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao arquivar pedidos' })
  }
}

const getRevenue = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: 'completed' },
      include: { items: true },
      orderBy: { criadoEm: 'asc' },
    })

    const byMonth = {}
    orders.forEach(order => {
      const date = new Date(order.criadoEm)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!byMonth[key]) byMonth[key] = { month: key, total: 0, count: 0 }
      byMonth[key].total += order.total
      byMonth[key].count += 1
    })

    const totalGeral = orders.reduce((acc, o) => acc + o.total, 0)
    const totalPedidos = orders.length
    const ticketMedio = totalPedidos > 0 ? totalGeral / totalPedidos : 0

    res.json({
      totalGeral,
      totalPedidos,
      ticketMedio,
      byMonth: Object.values(byMonth),
      orders: [...orders].reverse().slice(0, 10).map(o => ({
        id: o.id,
        total: o.total,
        criadoEm: o.criadoEm,
        itemCount: o.items.length,
        arquivado: o.arquivado,
      })),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar faturamento' })
  }
}

module.exports = {
  getAll, create, updateStatus, updateDeliveryStatus,
  getMyOrders, arquivarOne, arquivarAll, getRevenue
}