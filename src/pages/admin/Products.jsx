import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import api from '../../services/api'
import { supabase } from '../../services/supabase'
import Toast from '../../components/Toast'

const empty = { name: '', price: '', category: '', description: '', stock: '', imageUrl: '' }
const categories = [
  'Colares',
  'Brincos',
  'Pulseiras',
  'Anéis',
  'Tornozeleiras',
  'Conjuntos',
  'Piercing Fake',
  'Relógios',
  'Bolsas',
  'Cintos',
  'Óculos',
  'Linha Masculina',
  'Perfumaria',
]

export default function Products() {
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [modalImg, setModalImg] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => setToast({ message, type })

  useEffect(() => { fetchProducts() }, [])

  useEffect(() => {
    if (modalImg) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [modalImg])

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products')
      setProducts(data)
    } catch {
      setError('Erro ao carregar produtos.')
    } finally {
      setFetching(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const uploadImage = async () => {
    if (!imageFile) return form.imageUrl || null
    setUploading(true)
    try {
      const ext = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}.${ext}`
      const { error } = await supabase.storage
        .from('Products')
        .upload(fileName, imageFile, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('Products').getPublicUrl(fileName)
      return data.publicUrl
    } catch (err) {
      console.error(err)
      setError('Erro ao fazer upload da imagem.')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const imageUrl = await uploadImage()
      const payload = { ...form, imageUrl }
      if (editId) {
        const { data } = await api.put(`/products/${editId}`, payload)
        setProducts(products.map(p => p.id === editId ? data : p))
        setEditId(null)
        showToast('Produto atualizado com sucesso!')
      } else {
        const { data } = await api.post('/products', payload)
        setProducts([data, ...products])
        showToast('Produto cadastrado com sucesso!')
      }
      setForm(empty)
      setImageFile(null)
      setImagePreview(null)
      setShowForm(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar produto.')
      showToast('Erro ao salvar produto.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (p) => {
    setForm({ name: p.name, price: p.price, category: p.category, description: p.description, stock: p.stock, imageUrl: p.imageUrl || '' })
    setImagePreview(p.imageUrl || null)
    setImageFile(null)
    setEditId(p.id)
    setShowForm(true)
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
  }

  const handleDelete = async (id) => {
    if (!confirm('Excluir este produto?')) return
    try {
      await api.delete(`/products/${id}`)
      setProducts(products.filter(p => p.id !== id))
      showToast('Produto excluído.', 'info')
    } catch {
      showToast('Erro ao excluir produto.', 'error')
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    background: '#fff',
    border: '1px solid #e8e8e8',
    borderRadius: '6px',
    fontSize: '16px',
    color: '#111',
    outline: 'none',
    fontFamily: 'var(--font-body)',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    WebkitAppearance: 'none',
  }

  return (
    <div style={{ animation: 'fadeUp 0.4s ease both' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        input:focus, select:focus, textarea:focus { border-color: #111 !important; outline: none; }
        select option { background: #fff; color: #111; }
        .upload-area { border: 2px dashed #e8e8e8; border-radius: 8px; padding: 24px; text-align: center; cursor: pointer; transition: border-color 0.2s; display: block; }
        .upload-area:hover { border-color: #111; }
        .product-card { display: none; background: #fff; border: 1px solid #f0f0f0; border-radius: 10px; padding: 14px; gap: 12px; }
        .product-table { display: block; }
        @media (max-width: 640px) {
          .product-table { display: none !important; }
          .product-card { display: flex !important; }
          .form-actions { flex-direction: column !important; }
          .form-actions button { width: 100% !important; justify-content: center !important; }
          .page-header { flex-direction: column !important; align-items: flex-start !important; gap: 14px !important; }
          .novo-btn { width: 100% !important; justify-content: center !important; }
        }
      `}</style>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {modalImg && createPortal(
        <div
          onClick={() => setModalImg(null)}
          style={{
            position: 'fixed', top: 0, left: 0,
            width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 99999, backdropFilter: 'blur(3px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative', background: '#fff', borderRadius: '16px',
              padding: '20px', width: '420px', maxWidth: '90vw',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            <button
              onClick={() => setModalImg(null)}
              style={{
                position: 'absolute', top: '12px', right: '12px',
                width: '28px', height: '28px', borderRadius: '50%',
                background: '#111', border: 'none', cursor: 'pointer',
                color: '#fff', fontSize: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >×</button>
            <img src={modalImg} alt="produto" style={{ width: '100%', maxHeight: '380px', objectFit: 'contain', borderRadius: '8px', display: 'block' }} />
          </div>
        </div>,
        document.body
      )}

      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '4px' }}>Gerenciamento</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 300, color: '#111', margin: 0, letterSpacing: '-0.5px' }}>
            Produtos
          </h1>
        </div>
        <button
          className="novo-btn"
          onClick={() => { setShowForm(!showForm); setForm(empty); setEditId(null); setImagePreview(null); setImageFile(null) }}
          style={{
            padding: '10px 20px', background: '#111', color: '#fff',
            border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 500,
            letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer',
            fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Novo produto
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(229,62,62,0.06)', border: '1px solid rgba(229,62,62,0.2)', borderRadius: '6px', fontSize: '13px', color: '#e53e3e', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 400, color: '#111', margin: '0 0 20px' }}>
            {editId ? 'Editar produto' : 'Novo produto'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '1px', color: '#aaa', textTransform: 'uppercase', marginBottom: '8px' }}>Nome</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Colar Dourado" required style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '1px', color: '#aaa', textTransform: 'uppercase', marginBottom: '8px' }}>Preço (R$)</label>
                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" required style={inputStyle} step="0.01" min="0" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '1px', color: '#aaa', textTransform: 'uppercase', marginBottom: '8px' }}>Estoque</label>
                <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="0" required style={inputStyle} step="1" min="0" />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '1px', color: '#aaa', textTransform: 'uppercase', marginBottom: '8px' }}>Categoria</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Selecionar categoria</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '1px', color: '#aaa', textTransform: 'uppercase', marginBottom: '8px' }}>Descrição</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descreva o produto..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '1px', color: '#aaa', textTransform: 'uppercase', marginBottom: '8px' }}>Imagem do produto</label>
              <label className="upload-area" htmlFor="image-upload">
                {imagePreview ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <img src={imagePreview} alt="preview" style={{ maxHeight: '140px', maxWidth: '100%', borderRadius: '6px', objectFit: 'cover' }} />
                    <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>Clique para trocar a imagem</p>
                  </div>
                ) : (
                  <div>
                    <svg width="32" height="32" fill="none" stroke="#ccc" strokeWidth="1" viewBox="0 0 24 24" style={{ margin: '0 auto 8px', display: 'block' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p style={{ fontSize: '13px', color: '#aaa', margin: 0 }}>Clique para selecionar uma imagem</p>
                    <p style={{ fontSize: '11px', color: '#ccc', margin: '4px 0 0' }}>PNG, JPG ou WEBP — máx. 5MB</p>
                  </div>
                )}
                <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </label>
            </div>

            <div className="form-actions" style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" disabled={loading || uploading} style={{ flex: 1, padding: '12px 24px', background: loading || uploading ? '#aaa' : '#111', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', cursor: loading || uploading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)' }}>
                {uploading ? 'Enviando imagem...' : loading ? 'Salvando...' : editId ? 'Salvar' : 'Adicionar'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm(empty); setEditId(null); setImagePreview(null); setImageFile(null) }} style={{ flex: 1, padding: '12px 24px', background: 'transparent', color: '#888', border: '1px solid #e8e8e8', borderRadius: '6px', fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '8px', overflow: 'hidden' }}>
        {fetching ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 0' }}>
            <p style={{ fontSize: '14px', color: '#aaa' }}>Carregando...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 0', gap: '10px' }}>
            <svg width="36" height="36" fill="none" stroke="#ddd" strokeWidth="1" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p style={{ fontSize: '14px', color: '#aaa', margin: 0 }}>Nenhum produto cadastrado</p>
            <p style={{ fontSize: '12px', color: '#ccc', margin: 0 }}>Clique em "Novo produto" para começar</p>
          </div>
        ) : (
          <>
            <div className="product-table" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e8e8e8', background: '#fafafa' }}>
                    {['', 'Produto', 'Categoria', 'Preço', 'Estoque', 'Ações'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', color: '#aaa', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f4f4f4' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 20px', width: '60px' }}>
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} onClick={() => setModalImg(p.imageUrl)}
                            style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e8e8e8', cursor: 'zoom-in' }} />
                        ) : (
                          <div style={{ width: '44px', height: '44px', borderRadius: '6px', background: '#f4f4f4', border: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="16" height="16" fill="none" stroke="#ccc" strokeWidth="1.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 20px', color: '#111', fontWeight: 400 }}>{p.name}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ fontSize: '11px', padding: '3px 10px', background: '#f4f4f4', color: '#555', borderRadius: '20px' }}>{p.category}</span>
                      </td>
                      <td style={{ padding: '12px 20px', color: '#111' }}>R$ {parseFloat(p.price).toFixed(2)}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ color: p.stock < 5 ? '#e53e3e' : p.stock < 10 ? '#f59e0b' : '#22c55e', fontWeight: 500 }}>
                          {p.stock} un.
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleEdit(p)} style={{ padding: '5px 14px', background: '#fff', border: '1px solid #e8e8e8', borderRadius: '4px', color: '#555', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Editar</button>
                          <button onClick={() => handleDelete(p.id)} style={{ padding: '5px 14px', background: '#fff', border: '1px solid rgba(229,62,62,0.3)', borderRadius: '4px', color: '#e53e3e', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Excluir</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {products.map((p, i) => (
                <div key={p.id} className="product-card" style={{ borderBottom: i < products.length - 1 ? '1px solid #f0f0f0' : 'none', borderRadius: 0, padding: '14px 16px' }}>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} onClick={() => setModalImg(p.imageUrl)}
                      style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e8e8e8', cursor: 'zoom-in', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '52px', height: '52px', borderRadius: '8px', background: '#f4f4f4', border: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="18" height="18" fill="none" stroke="#ccc" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: '#111', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                      <span style={{ fontSize: '14px', color: '#111', fontWeight: 400, flexShrink: 0 }}>R$ {parseFloat(p.price).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '11px', padding: '2px 8px', background: '#f4f4f4', color: '#555', borderRadius: '20px' }}>{p.category}</span>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: p.stock < 5 ? '#e53e3e' : p.stock < 10 ? '#f59e0b' : '#22c55e' }}>{p.stock} un.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleEdit(p)} style={{ flex: 1, padding: '7px', background: '#fff', border: '1px solid #e8e8e8', borderRadius: '6px', color: '#555', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Editar</button>
                      <button onClick={() => handleDelete(p.id)} style={{ flex: 1, padding: '7px', background: '#fff', border: '1px solid rgba(229,62,62,0.3)', borderRadius: '6px', color: '#e53e3e', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Excluir</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}