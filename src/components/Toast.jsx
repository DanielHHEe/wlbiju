import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function Toast({ message, type = 'success', onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000)
        return () => clearTimeout(timer)
    }, [onClose])

    const colors = {
        success: { bg: '#f0faf4', border: '#86efac', text: '#166534', icon: '✓' },
        error: { bg: '#fff5f5', border: '#fca5a5', text: '#991b1b', icon: '✕' },
        info: { bg: '#f0f9ff', border: '#93c5fd', text: '#1e40af', icon: 'i' },
    }

    const c = colors[type]

    return createPortal(
        <div style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 999999,
            animation: 'toastIn 0.3s ease',
        }}>
            <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
            <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: c.bg, border: `1px solid ${c.border}`,
                borderRadius: '10px', padding: '14px 18px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                minWidth: '280px', maxWidth: '380px',
            }}>
                <div style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: c.border, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '12px', fontWeight: 700,
                    color: c.text, flexShrink: 0,
                }}>
                    {c.icon}
                </div>
                <p style={{ fontSize: '14px', color: c.text, margin: 0, flex: 1, lineHeight: 1.4 }}>
                    {message}
                </p>
                <button onClick={onClose} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: c.text, opacity: 0.5, fontSize: '16px',
                    padding: '0', lineHeight: 1, flexShrink: 0,
                }}>
                    ×
                </button>
            </div>
        </div>,
        document.body
    )
}