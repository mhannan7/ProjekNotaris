import { NavLink } from 'react-router-dom'

const nav = [
  {
    label: 'Menu Utama', items: [
      { to: '/dashboard', label: 'Dashboard', icon: <IconDashboard /> },
      { to: '/order', label: 'Penerimaan Order', icon: <IconOrder /> },
      { to: '/klien', label: 'Data Klien', icon: <IconKlien /> },
    ]
  },
  {
    label: 'Administrasi', items: [
      { to: '/dokumen', label: 'Dokumen', icon: <IconDokumen /> },
      { to: '/laporan', label: 'Laporan', icon: <IconLaporan /> },
    ]
  },
]

export default function Sidebar({ onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
  <div 
    className="sidebar-logo-icon" 
    style={{ 
      width: 'clamp(32px, 4vw, 42px)', 
      height: 'clamp(32px, 4vw, 42px)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'transparent', /* Mengubah background menjadi transparan */
      padding: 0,
      flexShrink: 0
    }}
  >
    <img 
      src="/LogoRonnyWeb_20260729_021749_0000.svg" 
      alt="Logo Notaris Renny Fonda" 
      style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
    />
  </div>
  <h1>Notaris & PPAT<br />Renny Fonda</h1>
  <p>Kota Cilegon, Banten</p>
</div>

      {nav.map(group => (
        <div className="nav-group" key={group.label}>
          <div className="nav-label">{group.label}</div>
          {group.items.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
              onClick={onNavigate}
            >
              {item.icon}
              {item.label}
              <span className="nav-indicator" />
            </NavLink>
          ))}
        </div>
      ))}

      {/* Link ke Portal Klien */}
      <div style={{ padding: '12px 14px 0' }}>
        <div className="nav-label">Akses Klien</div>
        <a
          href="/portal/login"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 9,
            background: 'var(--accent-l)',
            border: '1px solid rgba(79,126,255,.2)',
            color: 'var(--accent)', fontSize: 13, fontWeight: 600,
            textDecoration: 'none', cursor: 'pointer',
            transition: 'all .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,126,255,.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-l)'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          Portal Klien
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ marginLeft: 'auto', opacity: .6 }}>
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
          </svg>
        </a>
      </div>

      <div style={{
        marginTop: 'auto', padding: '16px 18px',
        borderTop: '1px solid var(--border)',
        fontSize: 11, color: 'var(--text-xs)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span className="pulse-dot" />
        <span>Sistem Administrasi v1.0 &nbsp;·&nbsp; © 2026</span>
      </div>
    </aside>
  )
}

function IconDashboard() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>
}
function IconOrder() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
}
function IconKlien() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
}
function IconDokumen() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
}
function IconLaporan() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
}