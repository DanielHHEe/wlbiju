import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const nav = [
  { to: '/admin', label: 'Visão geral', end: true, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/admin/products', label: 'Produtos', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { to: '/admin/orders', label: 'Pedidos', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { to: '/admin/stock', label: 'Estoque', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
]

export default function AdminLayout({ children }) {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f7f7', fontFamily: 'var(--font-body)' }}>
      <style>{`
        @media (max-width: 768px) {
          .sidebar { transform: ${sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'}; }
          .main-content { margin-left: 0 !important; }
          .overlay { display: ${sidebarOpen ? 'block' : 'none'} !important; }
          .mobile-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .sidebar { transform: translateX(0) !important; }
          .mobile-btn { display: none !important; }
          .overlay { display: none !important; }
        }
        .nav-link {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 6px;
          text-decoration: none; font-size: 14px;
          color: #888; transition: all 0.15s; margin: 1px 0;
        }
        .nav-link:hover { background: #f4f4f4; color: #111; }
        .nav-link.active { background: #111; color: #fff; }
        .nav-link.active svg { opacity: 1; }
        .nav-link svg { opacity: 0.5; transition: opacity 0.15s; flex-shrink: 0; }
        .nav-link:hover svg { opacity: 0.8; }
        .nav-link.active svg { opacity: 1; }
      `}</style>

      <div className="overlay" onClick={() => setSidebarOpen(false)} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 99, display: 'none',
      }} />

      <aside className="sidebar" style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: '240px',
        background: '#fff', borderRight: '1px solid #e8e8e8',
        display: 'flex', flexDirection: 'column', zIndex: 100,
        transition: 'transform 0.3s ease',
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #e8e8e8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <div style={{ width: '18px', height: '1px', background: '#111' }} />
            <span style={{ fontSize: '12px', letterSpacing: '3px', color: '#111', textTransform: 'uppercase', fontWeight: 500 }}>
              Wlbiju
            </span>
            <div style={{ width: '18px', height: '1px', background: '#111' }} />
          </div>
          <p style={{ fontSize: '11px', color: '#aaa', marginTop: '4px', letterSpacing: '0.3px' }}>
            Painel administrativo
          </p>
        </div>

        <nav style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {nav.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '12px', borderTop: '1px solid #e8e8e8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', marginBottom: '8px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: '#f4f4f4', border: '1px solid #e8e8e8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 500, color: '#111', flexShrink: 0,
            }}>
              {admin?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#111', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{admin?.name}</p>
              <p style={{ fontSize: '11px', color: '#aaa', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{admin?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '9px',
            background: 'transparent', border: '1px solid #e8e8e8',
            borderRadius: '6px', fontSize: '12px', color: '#888',
            cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase',
            fontFamily: 'var(--font-body)', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.target.style.borderColor = '#e53e3e'; e.target.style.color = '#e53e3e' }}
            onMouseLeave={e => { e.target.style.borderColor = '#e8e8e8'; e.target.style.color = '#888' }}
          >
            Sair
          </button>
        </div>
      </aside>

      <div className="main-content" style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          height: '56px', background: '#fff', borderBottom: '1px solid #e8e8e8',
          display: 'flex', alignItems: 'center', padding: '0 24px',
          position: 'sticky', top: 0, zIndex: 50, justifyContent: 'space-between',
        }}>
          <button className="mobile-btn" onClick={() => setSidebarOpen(true)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#111', padding: '4px', display: 'none', alignItems: 'center',
          }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: '12px', color: '#aaa' }}>Sistema online</span>
          </div>
        </header>

        <main style={{ flex: 1, padding: '32px 24px', maxWidth: '1200px', width: '100%', margin: '0 auto', position: 'relative' }}>
          {children}
        </main>
      </div>
    </div>
  )
}