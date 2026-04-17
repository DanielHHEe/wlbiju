import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.post('http://localhost:3001/api/auth/login', form)
      login(data.token, data.admin)
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao fazer login.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (name) => ({
    width: '100%',
    padding: '12px 14px',
    background: '#fff',
    border: `1px solid ${focused === name ? '#111' : '#e8e8e8'}`,
    borderRadius: 'var(--radius)',
    fontSize: '14px',
    color: '#111',
    outline: 'none',
    transition: 'border-color 0.2s',
    letterSpacing: '0.2px',
  })

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#f7f7f7',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: '#fff',
        border: '1px solid #e8e8e8',
        borderRadius: '12px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '420px',
        animation: 'fadeUp 0.5s ease both',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <div style={{ width: '24px', height: '1px', background: '#111' }} />
            <span style={{ fontSize: '11px', letterSpacing: '3px', color: '#111', textTransform: 'uppercase', fontWeight: 500 }}>
              Wlbiju
            </span>
            <div style={{ width: '24px', height: '1px', background: '#111' }} />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem', fontWeight: 300,
            color: '#111', letterSpacing: '-0.5px',
            lineHeight: 1.1, marginBottom: '0.5rem',
          }}>
            Bem-vindo de volta
          </h1>
          <p style={{ fontSize: '14px', color: '#888' }}>
            Acesse o painel administrativo
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', letterSpacing: '1.5px', color: '#888', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500 }}>
              E-mail
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused('')}
              placeholder="seu@email.com"
              required
              style={inputStyle('email')}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', letterSpacing: '1.5px', color: '#888', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500 }}>
              Senha
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused('')}
              placeholder="••••••••"
              required
              style={inputStyle('password')}
            />
          </div>

          {error && (
            <div style={{
              padding: '12px 14px',
              background: 'var(--danger-bg)',
              border: '1px solid rgba(229,62,62,0.2)',
              borderRadius: 'var(--radius)',
              fontSize: '13px',
              color: 'var(--danger)',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              width: '100%', padding: '13px',
              background: loading ? '#f4f4f4' : '#111',
              color: loading ? '#888' : '#fff',
              border: 'none', borderRadius: 'var(--radius)',
              fontSize: '12px', fontWeight: 500,
              letterSpacing: '2px', textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (!loading) e.target.style.background = '#333' }}
            onMouseLeave={e => { if (!loading) e.target.style.background = '#111' }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

       
      </div>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  )
}