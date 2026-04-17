const statusMap = {
  pending: { label: 'Pendente', color: '#f59e0b' },
  processing: { label: 'Processando', color: '#3b82f6' },
  completed: { label: 'Concluído', color: '#22c55e' },
  cancelled: { label: 'Cancelado', color: '#e53e3e' },
}

export default function Orders() {
  return (
    <div style={{ animation: 'fadeUp 0.4s ease both' }}>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }`}</style>
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '4px' }}>Gerenciamento</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 300, color: '#111', margin: 0, letterSpacing: '-0.5px' }}>
          Pedidos
        </h1>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {Object.entries(statusMap).map(([key, { label, color }]) => (
          <div key={key} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '8px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#888' }}>{label}</span>
            <span style={{ fontSize: '22px', fontFamily: 'var(--font-display)', fontWeight: 300, color: '#111' }}>0</span>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: '10px' }}>
          <svg width="36" height="36" fill="none" stroke="#ddd" strokeWidth="1" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p style={{ fontSize: '14px', color: '#aaa', margin: 0 }}>Nenhum pedido ainda</p>
          <p style={{ fontSize: '12px', color: '#ccc', margin: 0 }}>Os pedidos aparecerão aqui quando forem realizados</p>
        </div>
      </div>
    </div>
  )
}