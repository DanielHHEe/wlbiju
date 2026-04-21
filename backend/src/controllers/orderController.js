const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// Listar pedidos NÃO arquivados (tela operacional)
const getAll = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { arquivado: false },
      include: { items: true },
      orderBy: { criadoEm: 'desc' },
    })
    res.json(orders)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar pedidos' })
  }
}

// Criar pedido (rota pública)
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
        status: 'completed',
        arquivado: false,
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

// Arquivar um pedido específico
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

// Arquivar todos os pedidos
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

// Faturamento — busca TODOS (arquivados ou não)
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
      orders: orders.reverse().map(o => ({
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

module.exports = { getAll, create, updateStatus, arquivarOne, arquivarAll, getRevenue }