import { useEffect, useState, useRef } from 'react'
import api from '../../services/api'

const DELIVERY_OPTIONS = [
  { value: 'in_preparation',   label: 'Em separação',          color: '#8b5cf6', bg: '#f5f3ff', dot: '#8b5cf6' },
  { value: 'dispatched',       label: 'Pedido despachado',     color: '#6366f1', bg: '#eef2ff', dot: '#6366f1' },
  { value: 'at_branch',        label: 'Chegou na filial final', color: '#f59e0b', bg: '#fffbeb', dot: '#f59e0b' },
  { value: 'out_for_delivery', label: 'Saiu para entrega',     color: '#3b82f6', bg: '#eff6ff', dot: '#3b82f6' },
  { value: 'delivered',        label: 'Pedido entregue',       color: '#10b981', bg: '#ecfdf5', dot: '#10b981' },
]

function DeliveryDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = DELIVERY_OPTIONS.find(o => o.value === value) || DELIVERY_OPTIONS[0]

  useEffect(() => {
    const handleClick = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }} onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(prev => !prev)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          padding: '8px 14px', border: `1.5px solid ${current.color}20`,
          borderRadius: '8px', background: current.bg,
          cursor: 'pointer', transition: 'all 0.2s',
          fontFamily: 'var(--font-body)',
        }}
      >
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: current.dot, flexShrink: 0 }} />
        <span style={{ fontSize: '13px', color: current.color, fontWeight: 500 }}>{current.label}</span>
        <svg
          width="14" height="14" fill="none" stroke={current.color} strokeWidth="2" viewBox="0 0 24 24"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0,
          background: '#fff', border: '1px solid #e4e4e7',
          borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          zIndex: 50, minWidth: '240px', overflow: 'hidden',
          animation: 'dropIn 0.15s ease both',
        }}>
          <style>{`@keyframes dropIn { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }`}</style>
          {DELIVERY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              style={{
                width: '100%', padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: '10px',
                background: opt.value === value ? opt.bg : 'none',
                border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                borderBottom: '1px solid #f4f4f5',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (opt.value !== value) e.currentTarget.style.background = '#fafafa' }}
              onMouseLeave={e => { if (opt.value !== value) e.currentTarget.style.background = 'none' }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: opt.dot, flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: opt.value === value ? opt.color : '#555', fontWeight: opt.value === value ? 600 : 400 }}>
                {opt.label}
              </span>
              {opt.value === value && (
                <svg width="13" height="13" fill="none" stroke={opt.color} strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginLeft: 'auto' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [confirming, setConfirming] = useState(false)
  const [arquivandoId, setArquivandoId] = useState(null)

  const fetchOrders = () => {
    setLoading(true)
    api.get('/orders')
      .then(res => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [])

  const handleArquivarOne = async (id, e) => {
    e.stopPropagation()
    setArquivandoId(id)
    try {
      await api.patch(`/orders/${id}/arquivar`)
      setOrders(prev => prev.filter(o => o.id !== id))
    } catch (err) {
      console.error('Erro ao arquivar pedido', err)
    } finally {
      setArquivandoId(null)
    }
  }

  const handleArquivarAll = async () => {
    try {
      await api.post('/orders/arquivar-todos')
      setOrders([])
      setConfirming(false)
    } catch (err) {
      console.error('Erro ao arquivar todos', err)
    }
  }

  const handleDeliveryStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/delivery-status`, { deliveryStatus: newStatus })
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, deliveryStatus: newStatus } : o))
    } catch (err) {
      console.error('Erro ao atualizar status de entrega', err)
    }
  }

  const ArchiveIcon = ({ size = 14 }) => (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  )

  return (
    <div style={{ animation: 'fadeUp 0.4s ease both' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        .order-row { border-bottom: 1px solid #f4f4f5; transition: background 0.15s; cursor: pointer; }
        .order-row:hover { background: #fafafa; }
        .order-row:last-child { border-bottom: none; }
        .archive-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: none; border: 1px solid #e4e4e7;
          border-radius: 6px; padding: 6px 12px;
          font-size: 12px; color: #71717a;
          cursor: pointer; transition: all 0.2s;
          font-family: var(--font-body); white-space: nowrap;
        }
        .archive-btn:hover { border-color: #111; color: #111; background: #fafafa; }
        .archive-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .archive-all-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: #111; color: #fff; border: none;
          padding: 10px 20px; border-radius: 8px;
          font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
          font-family: var(--font-body);
        }
        .archive-all-btn:hover { background: #333; }
        .confirm-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: #111; color: #fff; border: none;
          padding: 8px 16px; border-radius: 6px;
          font-size: 12px; font-weight: 500; cursor: pointer;
          font-family: var(--font-body);
        }
        .cancel-btn {
          background: #f4f4f5; color: #71717a; border: none;
          padding: 8px 16px; border-radius: 6px;
          font-size: 12px; cursor: pointer;
          font-family: var(--font-body);
        }
        .cancel-btn:hover { background: #e4e4e7; }
        @media (max-width: 640px) {
          .orders-table-header { display: none !important; }
          .order-card-mobile { display: flex !important; }
          .order-card-desktop { display: none !important; }
        }
        @media (min-width: 641px) {
          .order-card-mobile { display: none !important; }
          .order-card-desktop { display: grid !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '4px' }}>Gerenciamento</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 300, color: '#111', margin: 0, letterSpacing: '-0.5px' }}>
            Pedidos
          </h1>
          <p style={{ fontSize: '12px', color: '#aaa', marginTop: '6px' }}>
            Pedidos arquivados ficam salvos no <strong style={{ color: '#555' }}>Faturamento</strong>
          </p>
        </div>

        {!confirming ? (
          <button className="archive-all-btn" onClick={() => setConfirming(true)}>
            <ArchiveIcon size={15} />
            Arquivar todos
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e4e4e7', borderRadius: '10px', padding: '12px 16px', flexWrap: 'wrap', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <span style={{ fontSize: '13px', color: '#555', marginRight: '4px' }}>Arquivar todos os pedidos?</span>
            <button className="confirm-btn" onClick={handleArquivarAll}>
              <ArchiveIcon size={13} />
              Confirmar
            </button>
            <button className="cancel-btn" onClick={() => setConfirming(false)}>Cancelar</button>
          </div>
        )}
      </div>

      {/* Card de contagem */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div style={{
          background: '#fff', border: '1px solid #e4e4e7',
          borderRadius: '10px', padding: '16px 24px',
          display: 'flex', alignItems: 'center', gap: '12px',
          minWidth: '180px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" fill="none" stroke="#22c55e" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: '11px', color: '#aaa', margin: 0, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Concluídos</p>
            <p style={{ fontSize: '24px', fontFamily: 'var(--font-display)', fontWeight: 300, color: '#111', margin: '2px 0 0' }}>{orders.length}</p>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>
            Carregando pedidos...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" fill="none" stroke="#ccc" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p style={{ fontSize: '14px', color: '#aaa', margin: 0, fontWeight: 500 }}>Nenhum pedido pendente</p>
            <p style={{ fontSize: '12px', color: '#ccc', margin: 0 }}>Os novos pedidos aparecerão aqui</p>
          </div>
        ) : (
          <>
            <div className="orders-table-header" style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 130px 110px 120px', gap: '16px', padding: '12px 24px', background: '#fafafa', borderBottom: '1px solid #f4f4f5' }}>
              {['Pedido', 'Cliente', 'Itens', 'Total', 'Data', ''].map(h => (
                <span key={h} style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#a1a1aa', fontWeight: 600 }}>{h}</span>
              ))}
            </div>

            {orders.map((order, idx) => (
              <div key={order.id || idx}>

                {/* Desktop */}
                <div
                  className="order-row order-card-desktop"
                  onClick={() => setExpanded(expanded === idx ? null : idx)}
                  style={{ gridTemplateColumns: '80px 1fr 1fr 130px 110px 120px', gap: '16px', padding: '16px 24px', alignItems: 'center' }}
                >
                  <span style={{ fontSize: '12px', color: '#a1a1aa', fontFamily: 'monospace', fontWeight: 600 }}>
                    #{String(idx + 1).padStart(4, '0')}
                  </span>
                  <div>
                    <p style={{ fontSize: '13px', color: '#111', margin: 0, fontWeight: 500 }}>{order.user?.name || '—'}</p>
                    {order.user?.telefone && <p style={{ fontSize: '11px', color: '#a1a1aa', margin: '2px 0 0' }}>{order.user.telefone}</p>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#71717a' }}>{order.items.length}</span>
                    </div>
                    <span style={{ fontSize: '13px', color: '#71717a' }}>{order.items.length === 1 ? 'produto' : 'produtos'}</span>
                  </div>
                  <span style={{ fontSize: '14px', color: '#111', fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                    R$ {Number(order.total).toFixed(2).replace('.', ',')}
                  </span>
                  <span style={{ fontSize: '12px', color: '#a1a1aa' }}>
                    {new Date(order.criadoEm).toLocaleDateString('pt-BR')}
                  </span>
                  <div onClick={e => e.stopPropagation()}>
                    <button className="archive-btn" onClick={e => handleArquivarOne(order.id, e)} disabled={arquivandoId === order.id}>
                      <ArchiveIcon size={13} />
                      {arquivandoId === order.id ? 'Arquivando...' : 'Arquivar'}
                    </button>
                  </div>
                </div>

                {/* Mobile */}
                <div
                  className="order-row order-card-mobile"
                  onClick={() => setExpanded(expanded === idx ? null : idx)}
                  style={{ flexDirection: 'column', padding: '16px 20px', gap: '10px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#a1a1aa', fontFamily: 'monospace', fontWeight: 600 }}>#{String(idx + 1).padStart(4, '0')}</span>
                    <span style={{ fontSize: '12px', color: '#a1a1aa' }}>{new Date(order.criadoEm).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', color: '#111', margin: 0, fontWeight: 500 }}>{order.user?.name || '—'}</p>
                    {order.user?.telefone && <p style={{ fontSize: '11px', color: '#a1a1aa', margin: '2px 0 0' }}>{order.user.telefone}</p>}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#71717a' }}>{order.items.length} {order.items.length === 1 ? 'produto' : 'produtos'}</span>
                    <span style={{ fontSize: '15px', color: '#111', fontFamily: 'var(--font-display)', fontWeight: 500 }}>R$ {Number(order.total).toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                    <button className="archive-btn" onClick={e => handleArquivarOne(order.id, e)} disabled={arquivandoId === order.id}>
                      <ArchiveIcon size={13} />
                      {arquivandoId === order.id ? 'Arquivando...' : 'Arquivar'}
                    </button>
                  </div>
                </div>

                {/* Detalhes expandidos */}
                {expanded === idx && (
                  <div style={{ padding: '0 24px 24px', background: '#fafafa', borderBottom: '1px solid #f4f4f5' }}>

                    {/* Status de entrega */}
                    <div style={{ marginTop: '16px', marginBottom: '16px', padding: '16px', background: '#fff', border: '1px solid #e4e4e7', borderRadius: '10px' }}>
                      <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#a1a1aa', margin: '0 0 12px', fontWeight: 600 }}>
                        Status de entrega
                      </p>
                      <DeliveryDropdown
                        value={order.deliveryStatus || 'in_preparation'}
                        onChange={newStatus => handleDeliveryStatus(order.id, newStatus)}
                      />
                    </div>

                    {/* Dados do cliente */}
                    {order.user && (
                      <div style={{ marginBottom: '16px', padding: '16px', background: '#fff', border: '1px solid #e4e4e7', borderRadius: '10px' }}>
                        <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#a1a1aa', margin: '0 0 14px', fontWeight: 600 }}>
                          Dados do cliente
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="14" height="14" fill="none" stroke="#71717a" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                              </svg>
                            </div>
                            <span style={{ fontSize: '13px', color: '#111', fontWeight: 500 }}>{order.user.name}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="14" height="14" fill="none" stroke="#71717a" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                              </svg>
                            </div>
                            <span style={{ fontSize: '13px', color: '#555' }}>{order.user.email}</span>
                          </div>
                          {order.user.telefone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="14" height="14" fill="none" stroke="#71717a" strokeWidth="1.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                </svg>
                              </div>
                              <span style={{ fontSize: '13px', color: '#555' }}>{order.user.telefone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Itens */}
                    <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#a1a1aa', marginBottom: '12px', marginTop: '4px', fontWeight: 600 }}>
                      Itens do pedido
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: '#fff', border: '1px solid #e4e4e7', borderRadius: '8px' }}>
                          {item.imageUrl && (
                            <img src={item.imageUrl} alt={item.name} style={{ width: '40px', height: '50px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '13px', color: '#111', margin: 0, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                            <p style={{ fontSize: '11px', color: '#a1a1aa', margin: '3px 0 0' }}>{item.category} · Qtd: {item.qty}</p>
                          </div>
                          <p style={{ fontSize: '14px', color: '#111', margin: 0, fontFamily: 'var(--font-display)', fontWeight: 500, flexShrink: 0 }}>
                            R$ {Number(item.subtotal).toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #e4e4e7' }}>
                      <div>
                        <span style={{ fontSize: '15px', color: '#111', fontWeight: 600 }}>
                          Total: R$ {Number(order.total).toFixed(2).replace('.', ',')}
                        </span>
                        {order.frete === 0 && (
                          <span style={{ marginLeft: '10px', fontSize: '11px', color: '#22c55e', fontWeight: 500 }}>✓ Frete grátis</span>
                        )}
                      </div>
                      <button className="archive-btn" onClick={e => handleArquivarOne(order.id, e)} disabled={arquivandoId === order.id} style={{ padding: '8px 16px' }}>
                        <ArchiveIcon size={13} />
                        {arquivandoId === order.id ? 'Arquivando...' : 'Arquivar pedido'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}