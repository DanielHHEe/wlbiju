import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
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
      const { data } = await axios.post('http://localhost:3001/api/auth/register', form)
      login(data.token, data.admin)
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar conta.')
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

  const fields = [
    { key: 'name', label: 'Nome completo', type: 'text', placeholder: 'Seu nome' },
    { key: 'email', label: 'E-mail', type: 'email', placeholder: 'seu@email.com' },
    { key: 'password', label: 'Senha', type: 'password', placeholder: 'Mínimo 6 caracteres' },
  ]

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
            Criar sua conta
          </h1>
          <p style={{ fontSize: '14px', color: '#888' }}>
            Cadastre-se como administrador
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {fields.map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '1.5px', color: '#888', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500 }}>
                {label}
              </label>
              <input
                type={type}
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                onFocus={() => setFocused(key)}
                onBlur={() => setFocused('')}
                placeholder={placeholder}
                required
                style={inputStyle(key)}
              />
            </div>
          ))}

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
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '13px', color: '#888' }}>
          Já tem conta?{' '}
          <Link to="/login" style={{ color: '#111', fontWeight: 500, textDecoration: 'none', borderBottom: '1px solid #111' }}>
            Entrar
          </Link>
        </p>
      </div>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  )
}