import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

const quickActions = [
  { label: 'Adicionar produto', desc: 'Cadastrar novo item', to: '/admin/products', icon: 'M12 4v16m8-8H4' },
  { label: 'Ver pedidos', desc: 'Gerenciar pedidos', to: '/admin/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label: 'Estoque', desc: 'Atualizar quantidades', to: '/admin/stock', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
]

export default function Dashboard() {
  const { admin } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  useEffect(() => {
    api.get('/products')
      .then(({ data }) => setProducts(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalProdutos = products.length
  const estoquesBaixos = products.filter(p => p.stock < 5).length
  const receita = products.reduce((acc, p) => acc + (p.price * p.stock), 0)

  const metrics = [
    {
      label: 'Receita potencial',
      value: loading ? '...' : `R$ ${receita.toFixed(2)}`,
      sub: 'Valor total em estoque',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      label: 'Pedidos',
      value: '0',
      sub: 'Total realizados',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    },
    {
      label: 'Produtos',
      value: loading ? '...' : totalProdutos,
      sub: 'Cadastrados',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    },
    {
      label: 'Estoque crítico',
      value: loading ? '...' : estoquesBaixos,
      sub: 'Itens com menos de 5 un.',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      alert: estoquesBaixos > 0,
    },
  ]

  return (
    <div style={{ animation: 'fadeUp 0.4s ease both' }}>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }`}</style>

      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '4px' }}>{greeting},</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 300, color: '#111', letterSpacing: '-0.5px', margin: 0 }}>
          {admin?.name}
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {metrics.map(({ label, value, sub, icon, alert }) => (
          <div key={label} style={{ background: '#fff', border: `1px solid ${alert ? 'rgba(229,62,62,0.2)' : '#e8e8e8'}`, borderRadius: '8px', padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', color: '#aaa', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</span>
              <svg width="15" height="15" fill="none" stroke={alert ? '#e53e3e' : '#aaa'} strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
            </div>
            <p style={{ fontSize: '28px', fontWeight: 300, color: alert ? '#e53e3e' : '#111', fontFamily: 'var(--font-display)', letterSpacing: '-1px', margin: '0 0 4px' }}>{value}</p>
            <p style={{ fontSize: '12px', color: '#aaa' }}>{sub}</p>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 400, color: '#111', margin: '0 0 16px', letterSpacing: '-0.3px' }}>
          Ações rápidas
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          {quickActions.map(({ label, desc, to, icon }) => (
            <button key={to} onClick={() => navigate(to)} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '16px', background: '#fafafa',
              border: '1px solid #e8e8e8', borderRadius: '8px',
              cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
              fontFamily: 'var(--font-body)',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#111'; e.currentTarget.style.background = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e8e8'; e.currentTarget.style.background = '#fafafa' }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: '#f4f4f4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" fill="none" stroke="#111" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: '#111', margin: '0 0 2px' }}>{label}</p>
                <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '8px', padding: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 400, color: '#111', margin: '0 0 20px', letterSpacing: '-0.3px' }}>
          Produtos recentes
        </h2>
        {loading ? (
          <p style={{ fontSize: '14px', color: '#aaa', textAlign: 'center', padding: '32px 0' }}>Carregando...</p>
        ) : products.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', gap: '10px' }}>
            <svg width="36" height="36" fill="none" stroke="#ddd" strokeWidth="1" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p style={{ fontSize: '14px', color: '#aaa', margin: 0 }}>Nenhum produto ainda</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {products.slice(0, 5).map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f4f4f4' }}>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e8e8e8', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: '#f4f4f4', border: '1px solid #e8e8e8', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', color: '#111', margin: '0 0 2px', fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                  <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>{p.category}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: '14px', color: '#111', margin: '0 0 2px', fontWeight: 400 }}>R$ {parseFloat(p.price).toFixed(2)}</p>
                  <p style={{ fontSize: '12px', margin: 0, color: p.stock < 5 ? '#e53e3e' : p.stock < 10 ? '#f59e0b' : '#22c55e' }}>{p.stock} un.</p>
                </div>
              </div>
            ))}
            {products.length > 5 && (
              <button onClick={() => navigate('/admin/products')} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '13px', cursor: 'pointer', padding: '4px', fontFamily: 'var(--font-body)' }}>
                Ver todos os {products.length} produtos →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}