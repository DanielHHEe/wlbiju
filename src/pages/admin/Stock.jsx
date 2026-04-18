import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function Stock() {
  const [products, setProducts] = useState([])
  const [fetching, setFetching] = useState(true)
  const [editing, setEditing] = useState(null)
  const [newStock, setNewStock] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products')
      setProducts(data)
    } catch {
      setError('Erro ao carregar estoque.')
    } finally {
      setFetching(false)
    }
  }

  const handleSaveStock = async (id) => {
    setSaving(true)
    try {
      const { data } = await api.patch(`/products/${id}/stock`, { stock: newStock })
      setProducts(products.map(p => p.id === id ? { ...p, stock: data.stock } : p))
      setEditing(null)
      setNewStock('')
    } catch {
      setError('Erro ao atualizar estoque.')
    } finally {
      setSaving(false)
    }
  }

  const low = products.filter(p => p.stock < 5).length
  const medium = products.filter(p => p.stock >= 5 && p.stock < 10).length
  const ok = products.filter(p => p.stock >= 10).length

  return (
    <div style={{ animation: 'fadeUp 0.4s ease both', padding: '0 0 32px' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        input[type="number"]:focus { border-color: #111 !important; }
        .stock-stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
        @media (min-width: 640px) { .stock-stats-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; } }
        .stock-table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .stock-table { width: 100%; border-collapse: collapse; font-size: 14px; min-width: 480px; }
        .stock-card-list { display: none; }
        @media (max-width: 540px) {
          .stock-table-wrapper { display: none; }
          .stock-card-list { display: flex; flex-direction: column; gap: 0; }
        }
        .stock-product-card { padding: 16px 20px; border-bottom: 1px solid #f4f4f4; display: flex; flex-direction: column; gap: 10px; }
        .stock-product-card:last-child { border-bottom: none; }
        .stock-product-card-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .stock-edit-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .stock-edit-row input { width: 80px; padding: 8px 10px; border: 1px solid #e8e8e8; border-radius: 4px; font-size: 16px; color: #111; outline: none; font-family: var(--font-body); }
        .btn-save { padding: 8px 14px; background: #111; color: #fff; border: none; border-radius: 4px; font-size: 12px; cursor: pointer; font-family: var(--font-body); }
        .btn-cancel { padding: 8px 14px; background: #fff; color: #888; border: 1px solid #e8e8e8; border-radius: 4px; font-size: 12px; cursor: pointer; font-family: var(--font-body); }
        .btn-ajustar { padding: 7px 14px; background: #fff; border: 1px solid #e8e8e8; border-radius: 4px; color: #555; font-size: 12px; cursor: pointer; font-family: var(--font-body); }
        .status-badge { font-size: 11px; padding: 3px 10px; border-radius: 20px; font-weight: 500; white-space: nowrap; }
        .category-badge { font-size: 11px; padding: 3px 10px; background: #f4f4f4; color: #555; border-radius: 20px; white-space: nowrap; }
      `}</style>

      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '4px' }}>Gerenciamento</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 300, color: '#111', margin: 0, letterSpacing: '-0.5px' }}>
          Estoque
        </h1>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(229,62,62,0.06)', border: '1px solid rgba(229,62,62,0.2)', borderRadius: '6px', fontSize: '13px', color: '#e53e3e', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div className="stock-stats-grid">
        {[
          { label: 'Estoque crítico', value: low, color: '#e53e3e', desc: 'Menos de 5 un.' },
          { label: 'Estoque baixo', value: medium, color: '#f59e0b', desc: 'Entre 5 e 9 un.' },
          { label: 'Estoque ok', value: ok, color: '#22c55e', desc: '10 ou mais un.' },
          { label: 'Total produtos', value: products.length, color: '#111', desc: 'Cadastrados' },
        ].map(({ label, value, color, desc }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ fontSize: '10px', color: '#aaa', letterSpacing: '0.5px', textTransform: 'uppercase', lineHeight: 1.3 }}>{label}</span>
            </div>
            <p style={{ fontSize: '26px', fontWeight: 300, color, fontFamily: 'var(--font-display)', letterSpacing: '-1px', margin: '0 0 2px' }}>{value}</p>
            <p style={{ fontSize: '11px', color: '#aaa', margin: 0 }}>{desc}</p>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '8px', overflow: 'hidden' }}>
        {fetching ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 0' }}>
            <p style={{ fontSize: '14px', color: '#aaa' }}>Carregando...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 0', gap: '10px' }}>
            <svg width="36" height="36" fill="none" stroke="#ddd" strokeWidth="1" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p style={{ fontSize: '14px', color: '#aaa', margin: 0 }}>Nenhum produto cadastrado</p>
            <p style={{ fontSize: '12px', color: '#ccc', margin: 0 }}>Cadastre produtos para ver o estoque aqui</p>
          </div>
        ) : (
          <>
            <div className="stock-table-wrapper">
              <table className="stock-table">
                <thead>
                  <tr style={{ borderBottom: '1px solid #e8e8e8', background: '#fafafa' }}>
                    {['Produto', 'Categoria', 'Estoque atual', 'Status', 'Ajustar'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', color: '#aaa', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => {
                    const statusColor = p.stock < 5 ? '#e53e3e' : p.stock < 10 ? '#f59e0b' : '#22c55e'
                    const statusBg = p.stock < 5 ? 'rgba(229,62,62,0.08)' : p.stock < 10 ? 'rgba(245,158,11,0.08)' : 'rgba(34,197,94,0.08)'
                    const statusLabel = p.stock < 5 ? 'Crítico' : p.stock < 10 ? 'Baixo' : 'Normal'
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f4f4f4' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px 20px', color: '#111', fontWeight: 400 }}>{p.name}</td>
                        <td style={{ padding: '14px 20px' }}><span className="category-badge">{p.category}</span></td>
                        <td style={{ padding: '14px 20px', fontSize: '16px', fontWeight: 300, fontFamily: 'var(--font-display)', color: '#111', whiteSpace: 'nowrap' }}>{p.stock} un.</td>
                        <td style={{ padding: '14px 20px' }}><span className="status-badge" style={{ background: statusBg, color: statusColor }}>{statusLabel}</span></td>
                        <td style={{ padding: '14px 20px' }}>
                          {editing === p.id ? (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input type="number" min="0" value={newStock} onChange={e => setNewStock(e.target.value)}
                                style={{ width: '80px', padding: '8px 10px', border: '1px solid #e8e8e8', borderRadius: '4px', fontSize: '16px', color: '#111', outline: 'none', fontFamily: 'var(--font-body)' }}
                                autoFocus />
                              <button className="btn-save" onClick={() => handleSaveStock(p.id)} disabled={saving}>{saving ? '...' : 'Salvar'}</button>
                              <button className="btn-cancel" onClick={() => { setEditing(null); setNewStock('') }}>Cancelar</button>
                            </div>
                          ) : (
                            <button className="btn-ajustar" onClick={() => { setEditing(p.id); setNewStock(p.stock) }}>Ajustar</button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="stock-card-list">
              {products.map(p => {
                const statusColor = p.stock < 5 ? '#e53e3e' : p.stock < 10 ? '#f59e0b' : '#22c55e'
                const statusBg = p.stock < 5 ? 'rgba(229,62,62,0.08)' : p.stock < 10 ? 'rgba(245,158,11,0.08)' : 'rgba(34,197,94,0.08)'
                const statusLabel = p.stock < 5 ? 'Crítico' : p.stock < 10 ? 'Baixo' : 'Normal'
                return (
                  <div key={p.id} className="stock-product-card">
                    <div className="stock-product-card-row">
                      <span style={{ fontSize: '14px', color: '#111', fontWeight: 400 }}>{p.name}</span>
                      <span className="status-badge" style={{ background: statusBg, color: statusColor }}>{statusLabel}</span>
                    </div>
                    <div className="stock-product-card-row">
                      <span className="category-badge">{p.category}</span>
                      <span style={{ fontSize: '15px', fontWeight: 300, fontFamily: 'var(--font-display)', color: '#111' }}>{p.stock} un.</span>
                    </div>
                    {editing === p.id ? (
                      <div className="stock-edit-row">
                        <input type="number" min="0" value={newStock} onChange={e => setNewStock(e.target.value)} autoFocus />
                        <button className="btn-save" onClick={() => handleSaveStock(p.id)} disabled={saving}>{saving ? '...' : 'Salvar'}</button>
                        <button className="btn-cancel" onClick={() => { setEditing(null); setNewStock('') }}>Cancelar</button>
                      </div>
                    ) : (
                      <button className="btn-ajustar" style={{ alignSelf: 'flex-start' }} onClick={() => { setEditing(p.id); setNewStock(p.stock) }}>Ajustar estoque</button>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}