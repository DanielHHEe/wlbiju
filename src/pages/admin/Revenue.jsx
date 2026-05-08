import { useEffect, useState, useMemo } from 'react'
import api from '../../services/api'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const fmtLabel = month => {
  const [year, m] = month.split('-')
  return `${MONTHS_PT[parseInt(m) - 1]}/${year.slice(2)}`
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: '#0f172a', borderRadius: '10px',
      padding: '12px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      border: '1px solid #1e293b', minWidth: '160px',
    }}>
      <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 6px', letterSpacing: '0.5px' }}>{label}</p>
      <p style={{ fontSize: '18px', color: '#f8fafc', margin: '0 0 4px', fontWeight: 600 }}>
        R$ {Number(d.total).toFixed(2).replace('.', ',')}
      </p>
      <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
        {d.count} pedido{d.count !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

const CustomDot = ({ cx, cy, payload, data }) => {
  if (!data || data.length === 0) return null
  const maxVal = Math.max(...data.map(d => d.total))
  const minVal = Math.min(...data.map(d => d.total))
  const isMax = payload.total === maxVal
  const isMin = payload.total === minVal && data.length > 1
  if (!isMax && !isMin) return null
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill="#fff" stroke="#10b981" strokeWidth={2} />
      <rect x={cx - 18} y={cy - (isMax ? 28 : -14)} width={36} height={16} rx={4}
        fill="#ecfdf5" stroke="#6ee7b7" strokeWidth={1} />
      <text x={cx} y={cy - (isMax ? 16 : -22)} textAnchor="middle"
        fontSize="8.5" fill="#059669" fontWeight="700" letterSpacing="0.8">
        {isMax ? 'MÁX' : 'MÍN'}
      </text>
    </g>
  )
}

export default function Revenue() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    api.get('/orders/revenue')
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  const filteredOrders = useMemo(() => {
    if (!data) return []
    return data.orders.filter(order => {
      const orderDate = new Date(order.criadoEm).toISOString().slice(0, 10)
      if (dateFrom && orderDate < dateFrom) return false
      if (dateTo && orderDate > dateTo) return false
      return true
    })
  }, [data, dateFrom, dateTo])

  const filteredByMonth = useMemo(() => {
    const byMonth = {}
    filteredOrders.forEach(order => {
      const key = new Date(order.criadoEm).toISOString().slice(0, 7)
      if (!byMonth[key]) byMonth[key] = { month: key, total: 0, count: 0 }
      byMonth[key].total += order.total
      byMonth[key].count += 1
    })
    return Object.values(byMonth)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(d => ({ ...d, label: fmtLabel(d.month) }))
  }, [filteredOrders])

  const chartDataRaw = useMemo(() => {
    return (data?.byMonth || []).map(d => ({ ...d, label: fmtLabel(d.month) }))
  }, [data])

  const filteredTotal = filteredOrders.reduce((acc, o) => acc + o.total, 0)
  const filteredCount = filteredOrders.length
  const filteredTicket = filteredCount > 0 ? filteredTotal / filteredCount : 0
  const isFiltered = dateFrom || dateTo

  const metrics = data ? [
    {
      label: 'Faturamento total',
      value: `R$ ${(isFiltered ? filteredTotal : data.totalGeral).toFixed(2).replace('.', ',')}`,
      sub: isFiltered ? 'No período selecionado' : 'Todos os pedidos concluídos',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: '#10b981', bg: '#ecfdf5',
    },
    {
      label: 'Total de pedidos',
      value: isFiltered ? filteredCount : data.totalPedidos,
      sub: isFiltered ? 'No período selecionado' : 'Pedidos concluídos',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      color: '#6366f1', bg: '#eef2ff',
    },
    {
      label: 'Ticket médio',
      value: `R$ ${(isFiltered ? filteredTicket : data.ticketMedio).toFixed(2).replace('.', ',')}`,
      sub: isFiltered ? 'No período selecionado' : 'Valor médio por pedido',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      color: '#f59e0b', bg: '#fffbeb',
    },
  ] : []

  const displayedOrders = isFiltered ? filteredOrders : (data?.orders || [])
  const chartData = isFiltered ? filteredByMonth : chartDataRaw

  return (
    <div style={{ animation: 'fadeUp 0.4s ease both' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        .rev-card { background: #fff; border: 1px solid #f1f5f9; padding: 20px 24px; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
        .clear-btn { background: none; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 12px; font-size: 12px; color: #94a3b8; cursor: pointer; font-family: var(--font-body); transition: all 0.2s; }
        .clear-btn:hover { border-color: #f43f5e; color: #f43f5e; }
        @media (max-width: 640px) {
          .rev-metrics { grid-template-columns: 1fr !important; }
          .filter-row { flex-direction: column !important; align-items: flex-start !important; }
          .orders-table-header { display: none !important; }
        }
      `}</style>

      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', letterSpacing: '0.5px' }}>Financeiro</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2rem)', fontWeight: 300, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
          Faturamento
        </h1>
      </div>

      {loading ? (
        <div style={{ padding: '80px 0', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>Carregando dados...</div>
      ) : !data ? (
        <div style={{ padding: '80px 0', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>Erro ao carregar dados.</div>
      ) : (
        <>
          {/* Métricas */}
          <div className="rev-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
            {metrics.map(({ label, value, sub, icon, color, bg }) => (
              <div key={label} className="rev-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <span style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: 500 }}>{label}</span>
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" fill="none" stroke={color} strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                    </svg>
                  </div>
                </div>
                <p style={{ fontSize: '26px', fontWeight: 300, color: '#0f172a', fontFamily: 'var(--font-display)', letterSpacing: '-0.5px', margin: '0 0 4px' }}>{value}</p>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{sub}</p>
              </div>
            ))}
          </div>

          {/* Gráfico Recharts */}
          <div className="rev-card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 400, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
                  Faturamento por período
                </h2>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                  {isFiltered
                    ? `${filteredCount} pedido${filteredCount !== 1 ? 's' : ''} · R$ ${filteredTotal.toFixed(2).replace('.', ',')} no período`
                    : 'Receita mensal acumulada'}
                </p>
              </div>

              <div className="filter-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '7px 12px' }}>
                  <svg width="12" height="12" fill="none" stroke="#94a3b8" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', color: '#334155', fontFamily: 'var(--font-body)', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '10px', color: '#cbd5e1' }}>—</span>
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', color: '#334155', fontFamily: 'var(--font-body)', cursor: 'pointer' }}
                  />
                </div>
                {isFiltered && (
                  <button className="clear-btn" onClick={() => { setDateFrom(''); setDateTo('') }}>✕ Limpar</button>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', background: '#ecfdf5', borderRadius: '6px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ fontSize: '11px', color: '#059669', fontWeight: 500 }}>Concluído</span>
                </div>
              </div>
            </div>

            {chartData.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '260px', gap: '10px' }}>
                <svg width="36" height="36" fill="none" stroke="#e2e8f0" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                <span style={{ fontSize: '13px', color: '#cbd5e1' }}>Nenhum dado no período</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData} margin={{ top: 32, right: 16, left: 8, bottom: 8 }}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="60%" stopColor="#10b981" stopOpacity={0.04} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 6" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'monospace' }}
                    axisLine={false}
                    tickLine={false}
                    dy={8}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'monospace' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => v >= 1000 ? `R$${(v / 1000).toFixed(1)}k` : `R$${v}`}
                    width={56}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#areaGradient)"
                    dot={props => <CustomDot {...props} data={chartData} />}
                    activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                    isAnimationActive={true}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Tabela */}
          <div className="rev-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 400, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
                {isFiltered ? 'Pedidos no período' : 'Últimos pedidos'}
              </h2>
              {isFiltered && (
                <span style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px' }}>
                  {filteredCount} resultado{filteredCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {displayedOrders.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#cbd5e1', fontSize: '13px' }}>
                Nenhum pedido no período selecionado
              </div>
            ) : (
              <>
                <div className="orders-table-header" style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 120px', gap: '16px', padding: '8px 0', borderBottom: '1px solid #f1f5f9', marginBottom: '4px' }}>
                  {['Pedido', 'Data', 'Itens', 'Total'].map(h => (
                    <span key={h} style={{ fontSize: '9.5px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>{h}</span>
                  ))}
                </div>
                {displayedOrders.slice(0, 10).map((order, idx) => (
                  <div key={order.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 120px', gap: '16px', padding: '11px 0', borderBottom: '1px solid #f8fafc', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace', fontWeight: 500 }}>#{String(idx + 1).padStart(4, '0')}</span>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>{new Date(order.criadoEm).toLocaleDateString('pt-BR')}</span>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>{order.itemCount} {order.itemCount === 1 ? 'produto' : 'produtos'}</span>
                    <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 500 }}>
                      R$ {Number(order.total).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
                {displayedOrders.length > 10 && (
                  <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', marginTop: '16px' }}>
                    Mostrando 10 de {displayedOrders.length} pedidos
                  </p>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}