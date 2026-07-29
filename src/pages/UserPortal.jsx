import { useState, useEffect, createContext, useContext } from 'react'
import { Routes, Route, NavLink, useNavigate, Navigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Badge, formatDate, formatRp, Spinner } from '../components/UI'
import ThemeToggle from '../components/ThemeToggle'

// context session user (klien), simpen di sessionStorage
const UserCtx = createContext(null)
export const useUserAuth = () => useContext(UserCtx)

export function UserAuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [klien, setKlien] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session) fetchKlien(data.session.user.email)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, sess) => {
      setSession(sess)
      if (sess) fetchKlien(sess.user.email)
      else setKlien(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchKlien(email) {
    const { data } = await supabase.from('klien').select('*').eq('email', email).single()
    setKlien(data ?? null)
  }

  const logout = async () => { await supabase.auth.signOut() }

  return (
    <UserCtx.Provider value={{ session, klien, logout }}>
      {children}
    </UserCtx.Provider>
  )
}

export function UserGuard({ children }) {
  const { session } = useUserAuth()
  if (session === undefined) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <Spinner />
    </div>
  )
  if (!session) return <Navigate to="/portal/login" replace />
  return children
}


export default function UserPortal() {
  const { klien, logout } = useUserAuth()
  const nav = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)

  const doLogout = async () => { await logout(); nav('/portal/login', { replace: true }) }

  const navItems = [
    { to: '/portal', label: 'Beranda', icon: <HomeIcon />, end: true },
    { to: '/portal/order', label: 'Order Saya', icon: <OrderIcon /> },
    { to: '/portal/dokumen', label: 'Dokumen', icon: <DokIcon /> },
    { to: '/portal/profil', label: 'Profil', icon: <UserIcon /> },
  ]

  const initials = klien?.nama
    ? klien.nama.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?'

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {mobileOpen && <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <div className={`sidebar-drawer${mobileOpen ? ' open' : ''}`}>
        <button className="sidebar-close-btn" onClick={() => setMobileOpen(false)} aria-label="Tutup menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <aside className="sidebar">
          {/* Logo */}
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v18M3 9l9-6 9 6M3 15h18"/><path d="M6 12H3l3 6M18 12h3l-3 6"/>
              </svg>
            </div>
            <h1>Notaris & PPAT<br />Renny Fonda</h1>
            <p style={{ color: 'var(--accent)', fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: 4 }}>Portal Klien</p>
          </div>

          {/* Klien info */}
          {klien && (
            <div style={{ margin: '12px 12px 0', background: 'var(--accent-l)', border: '1px solid rgba(79,126,255,.15)', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg,#1E4ED8,#4F7EFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{klien.nama}</div>
                <div style={{ fontSize: 10, color: 'var(--text-xs)' }}>Klien Terdaftar</div>
              </div>
            </div>
          )}

          {/* Nav */}
          <div className="nav-group" style={{ marginTop: 8 }}>
            <div className="nav-label">Menu</div>
            {navItems.map(item => (
              <NavLink
                key={item.to} to={item.to} end={item.end}
                className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
                onClick={() => setMobileOpen(false)}
              >
                {item.icon} {item.label}
                <span className="nav-indicator" />
              </NavLink>
            ))}
          </div>

          {/* Footer */}
          <div style={{ marginTop: 'auto', padding: '16px 12px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={() => setConfirmLogout(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-sm)', fontSize: 12, fontWeight: 600, transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-l)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,.3)'; e.currentTarget.style.color = '#FCA5A5' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-sm)' }}
            >
              <LogoutIcon /> Keluar
            </button>
            <div style={{ fontSize: 10, color: 'var(--text-xs)', paddingLeft: 4 }}><span className="pulse-dot" /> Portal Klien v1.0</div>
          </div>
        </aside>
      </div>

      {/* Main */}
      <div className="main-area">
        <header className="topbar">
          <button className="hamburger-btn" onClick={() => setMobileOpen(true)} aria-label="Buka menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span className="topbar-title">
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', color: 'var(--accent)', textTransform: 'uppercase' }}>Portal Klien</span>
          </span>
          <div className="topbar-user">
            <ThemeToggle />
            {klien && <span style={{ fontSize: 12, color: 'var(--text-xs)' }}>{klien.nama.split(' ')[0]}</span>}
            <div className="avatar" style={{ background: 'linear-gradient(135deg,#1E4ED8,#4F7EFF)', fontSize: 11 }}>{initials}</div>
          </div>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<UserDashboard />} />
            <Route path="/order" element={<UserOrders />} />
            <Route path="/order/:id" element={<UserOrderDetail />} />
            <Route path="/dokumen" element={<UserDokumen />} />
            <Route path="/profil" element={<UserProfil />} />
            <Route path="*" element={<Navigate to="/portal" replace />} />
          </Routes>
        </main>
      </div>

      {/* Logout confirm modal */}
      {confirmLogout && (
        <div onClick={() => setConfirmLogout(false)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '32px 28px', width: '100%', maxWidth: 320, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,.4)' }}>
            <div style={{ width: 50, height: 50, borderRadius: 13, background: 'var(--danger-l)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            </div>
            <h3 style={{ margin: '0 0 7px', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Konfirmasi Keluar</h3>
            <p style={{ margin: '0 0 22px', fontSize: 13, color: 'var(--text-xs)', lineHeight: 1.5 }}>Kamu akan keluar dari portal klien. Lanjutkan?</p>
            <div style={{ display: 'flex', gap: 9 }}>
              <button onClick={() => setConfirmLogout(false)} style={{ flex: 1, padding: '10px', fontSize: 13, fontWeight: 600, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-sm)' }}>Batal</button>
              <button onClick={doLogout} style={{ flex: 1, padding: '10px', fontSize: 13, fontWeight: 600, background: '#EF4444', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#fff' }}>Ya, Keluar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function UserDashboard() {
  const { klien } = useUserAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()

  useEffect(() => {
    if (!klien) return
    supabase.from('v_orders').select('*').eq('klien_id', klien.id).order('created_at', { ascending: false }).limit(20)
      .then(({ data }) => { setOrders(data ?? []); setLoading(false) })
  }, [klien])

  if (loading || !klien) return <div className="page"><Spinner /></div>

  const total = orders.length
  const menunggu = orders.filter(o => o.status === 'menunggu').length
  const diproses = orders.filter(o => o.status === 'diproses').length
  const selesai = orders.filter(o => o.status === 'selesai').length
  const recent = orders.slice(0, 5)

  const cards = [
    { label: 'Total Order', val: total, color: '#4F7EFF', bg: 'var(--accent-l)', icon: <OrderIcon /> },
    { label: 'Menunggu', val: menunggu, color: '#F0B429', bg: 'var(--warn-l)', icon: <ClockIcon /> },
    { label: 'Diproses', val: diproses, color: '#7B61FF', bg: 'rgba(123,97,255,.12)', icon: <ProcessIcon /> },
    { label: 'Selesai', val: selesai, color: '#22C55E', bg: 'var(--success-l)', icon: <CheckCircleIcon /> },
  ]

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 11) return 'Selamat pagi'
    if (h < 15) return 'Selamat siang'
    if (h < 18) return 'Selamat sore'
    return 'Selamat malam'
  }

  return (
    <div className="page">
      {/* Welcome */}
      <div style={{ background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface2) 100%)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '28px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,126,255,.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, right: 80, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,97,255,.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <p style={{ fontSize: 12, color: 'var(--text-xs)', marginBottom: 6 }}>{greeting()},</p>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>{klien.nama} 👋</h2>
        <p style={{ fontSize: 13, color: 'var(--text-sm)', maxWidth: 480 }}>Selamat datang di portal klien Notaris & PPAT Renny Fonda. Pantau seluruh layanan Anda di sini.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginBottom: 28 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, marginBottom: 12 }}>{c.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: c.color, lineHeight: 1, marginBottom: 4 }}>{c.val}</div>
            <div style={{ fontSize: 12, color: 'var(--text-xs)' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Order Terbaru</span>
          <button onClick={() => nav('/portal/order')} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Lihat Semua →</button>
        </div>
        {recent.length === 0
          ? <EmptyPortal msg="Belum ada order." />
          : recent.map(o => (
            <div key={o.id} onClick={() => nav(`/portal/order/${o.id}`)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background .12s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{o.layanan_nama ?? '—'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-xs)', fontFamily: 'monospace' }}>{o.nomor_order} · {formatDate(o.tanggal_masuk)}</div>
              </div>
              <Badge status={o.status} />
            </div>
          ))
        }
      </div>
    </div>
  )
}

function UserOrders() {
  const { klien } = useUserAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('semua')
  const nav = useNavigate()

  useEffect(() => {
    if (!klien) return
    supabase.from('v_orders').select('*').eq('klien_id', klien.id).order('created_at', { ascending: false })
      .then(({ data }) => { setOrders(data ?? []); setLoading(false) })
  }, [klien])

  const filtered = filter === 'semua' ? orders : orders.filter(o => o.status === filter)
  const filters = ['semua', 'menunggu', 'diproses', 'selesai', 'batal']

  if (loading) return <div className="page"><Spinner /></div>

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Order Saya</h2>
          <p style={{ fontSize: 13, color: 'var(--text-xs)', marginTop: 3 }}>Semua permintaan layanan yang pernah Anda ajukan</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 14px', fontSize: 12, fontWeight: 600, borderRadius: 8, cursor: 'pointer', border: 'none', transition: 'all .12s',
            background: filter === f ? 'var(--accent)' : 'var(--surface)',
            color: filter === f ? '#fff' : 'var(--text-sm)',
            boxShadow: filter === f ? '0 2px 8px rgba(79,126,255,.35)' : 'none',
          }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'semua' && <span style={{ marginLeft: 5, fontSize: 10, opacity: .8 }}>({orders.filter(o => o.status === f).length})</span>}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0
        ? <EmptyPortal msg={`Tidak ada order dengan status "${filter}".`} />
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(o => (
              <div key={o.id} onClick={() => nav(`/portal/order/${o.id}`)}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px 22px', cursor: 'pointer', transition: 'all .12s', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.borderColor = 'var(--border-l)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{o.layanan_nama ?? '—'}</span>
                    <Badge status={o.status} />
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-xs)', fontFamily: 'monospace' }}>{o.nomor_order}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-xs)' }}>Masuk: {formatDate(o.tanggal_masuk)}</span>
                    {o.biaya > 0 && <span style={{ fontSize: 11, color: 'var(--text-xs)' }}>{formatRp(o.biaya)}</span>}
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-xs)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}><path d="M9 18l6-6-6-6"/></svg>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}

function UserOrderDetail() {
  const { id } = useParams()
  const { klien } = useUserAuth()
  const [order, setOrder] = useState(null)
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()

  useEffect(() => {
    if (!klien) return
    Promise.all([
      supabase.from('v_orders').select('*').eq('id', id).eq('klien_id', klien.id).single(),
      supabase.from('dokumen').select('*').eq('order_id', id).order('created_at'),
    ]).then(([oRes, dRes]) => {
      setOrder(oRes.data ?? null)
      setDocs(dRes.data ?? [])
      setLoading(false)
    })
  }, [id, klien])

  if (loading) return <div className="page"><Spinner /></div>
  if (!order) return (
    <div className="page">
      <button className="btn btn-sm" onClick={() => nav('/portal/order')} style={{ marginBottom: 20 }}>← Kembali</button>
      <EmptyPortal msg="Order tidak ditemukan atau bukan milik Anda." />
    </div>
  )

  const steps = ['menunggu', 'diproses', 'selesai']
  const stepIdx = steps.indexOf(order.status)

  return (
    <div className="page">
      <button className="btn btn-sm" onClick={() => nav('/portal/order')} style={{ marginBottom: 20 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Kembali
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 20 }} className="order-detail-grid">
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Header card */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{order.layanan_nama ?? '—'}</h2>
                <span style={{ fontSize: 12, color: 'var(--text-xs)', fontFamily: 'monospace' }}>{order.nomor_order}</span>
              </div>
              <Badge status={order.status} />
            </div>

            {/* Progress tracker */}
            {order.status !== 'batal' && (
              <div style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                  {steps.map((s, i) => {
                    const done = i <= stepIdx
                    const active = i === stepIdx
                    return (
                      <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: done ? 'var(--accent)' : 'var(--surface2)', border: `2px solid ${done ? 'var(--accent)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: active ? '0 0 0 4px var(--accent-l)' : 'none', transition: 'all .3s', flexShrink: 0 }}>
                            {done ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                              : <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border)' }} />}
                          </div>
                          <span style={{ fontSize: 10, color: done ? 'var(--accent)' : 'var(--text-xs)', fontWeight: done ? 700 : 400, textAlign: 'center', whiteSpace: 'nowrap' }}>{s.charAt(0).toUpperCase()+s.slice(1)}</span>
                        </div>
                        {i < steps.length - 1 && (
                          <div style={{ flex: 1, height: 2, background: i < stepIdx ? 'var(--accent)' : 'var(--border)', margin: '0 4px', marginBottom: 22, transition: 'background .3s' }} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Detail info */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '22px 24px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 18 }}>Informasi Order</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 24px' }} className="detail-info-grid">
              {[
                ['Nomor Order', order.nomor_order ?? '—'],
                ['Jenis Layanan', order.layanan_nama ?? '—'],
                ['Tanggal Masuk', formatDate(order.tanggal_masuk)],
                ['Tanggal Selesai', formatDate(order.tanggal_selesai)],
                ['Biaya Estimasi', order.biaya > 0 ? formatRp(order.biaya) : 'Akan dikonfirmasi'],
                ['Status', <Badge key="st" status={order.status} />],
              ].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 10, color: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>{l}</div>
                  <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
            {order.catatan && (
              <div style={{ marginTop: 18, padding: '14px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 9 }}>
                <div style={{ fontSize: 10, color: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Catatan dari Kantor</div>
                <p style={{ fontSize: 13, color: 'var(--text-sm)', lineHeight: 1.6, margin: 0 }}>{order.catatan}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right — dokumen sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '22px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>
              Dokumen ({docs.length})
            </div>
            {docs.length === 0
              ? <p style={{ fontSize: 12, color: 'var(--text-xs)', textAlign: 'center', padding: '12px 0' }}>Belum ada dokumen.</p>
              : docs.map(d => (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: d.status_dok === 'lengkap' ? 'var(--success-l)' : 'var(--warn-l)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {d.status_dok === 'lengkap'
                      ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                      : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    }
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.nama_file}</div>
                    <div style={{ fontSize: 10, color: d.status_dok === 'lengkap' ? '#22C55E' : '#F59E0B', fontWeight: 600 }}>
                      {d.status_dok === 'lengkap' ? 'Lengkap' : 'Belum Lengkap'}
                    </div>
                  </div>
                </div>
              ))
            }
          </div>

          {/* Kontak kantor */}
          <div style={{ background: 'var(--accent-gl)', border: '1px solid rgba(79,126,255,.2)', borderRadius: 'var(--radius-lg)', padding: '18px 20px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 10 }}>Butuh Bantuan?</div>
            <p style={{ fontSize: 12, color: 'var(--text-xs)', lineHeight: 1.6, marginBottom: 12 }}>Hubungi kantor kami untuk informasi lebih lanjut tentang order Anda.</p>
            <a href="tel:+6200000000" style={{ display: 'block', width: '100%', padding: '9px 14px', background: 'var(--accent)', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}>
              📞 Hubungi Kantor
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:768px){
          .order-detail-grid { grid-template-columns: 1fr !important; }
          .detail-info-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function UserDokumen() {
  const { klien } = useUserAuth()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!klien) return
    // join dokumen → orders → filter by klien_id
    supabase.from('dokumen')
      .select('*, orders!inner(nomor_order, klien_id, status)')
      .eq('orders.klien_id', klien.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setDocs(data ?? []); setLoading(false) })
  }, [klien])

  if (loading) return <div className="page"><Spinner /></div>

  const lengkap = docs.filter(d => d.status_dok === 'lengkap').length
  const belum = docs.filter(d => d.status_dok === 'belum_lengkap').length

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Dokumen Saya</h2>
          <p style={{ fontSize: 13, color: 'var(--text-xs)', marginTop: 3 }}>Seluruh dokumen terkait layanan Anda</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24, maxWidth: 480 }}>
        {[
          { l: 'Dokumen Lengkap', v: lengkap, c: '#22C55E', bg: 'var(--success-l)' },
          { l: 'Belum Lengkap', v: belum, c: '#F59E0B', bg: 'var(--warn-l)' },
        ].map(s => (
          <div key={s.l} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px 20px' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.c, marginBottom: 4 }}>{s.v}</div>
            <div style={{ fontSize: 12, color: 'var(--text-xs)' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {docs.length === 0
        ? <EmptyPortal msg="Belum ada dokumen terdaftar." />
        : (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {docs.map((d, i) => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 22px', borderBottom: i < docs.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: d.status_dok === 'lengkap' ? 'var(--success-l)' : 'var(--warn-l)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {d.status_dok === 'lengkap'
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{d.nama_file}</div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-xs)' }}>Order: {d.orders?.nomor_order ?? '—'}</span>
                    {d.keterangan && <span style={{ fontSize: 11, color: 'var(--text-xs)' }}>{d.keterangan}</span>}
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: d.status_dok === 'lengkap' ? 'var(--success-l)' : 'var(--warn-l)', color: d.status_dok === 'lengkap' ? '#22C55E' : '#F59E0B', flexShrink: 0 }}>
                  {d.status_dok === 'lengkap' ? 'Lengkap' : 'Belum Lengkap'}
                </span>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}

function UserProfil() {
  const { klien, session } = useUserAuth()

  if (!klien) return <div className="page"><Spinner /></div>

  const fields = [
    { l: 'Nama Lengkap', v: klien.nama },
    { l: 'NIK', v: klien.nik ?? '—' },
    { l: 'Email', v: klien.email ?? '—' },
    { l: 'Nomor Telepon', v: klien.telepon ?? '—' },
    { l: 'Alamat', v: klien.alamat ?? '—', full: true },
    { l: 'Terdaftar Sejak', v: new Date(klien.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) },
  ]

  const initials = klien.nama.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Profil Saya</h2>
          <p style={{ fontSize: 13, color: 'var(--text-xs)', marginTop: 3 }}>Data diri Anda sebagai klien terdaftar</p>
        </div>
      </div>

      {/* Avatar card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '32px 28px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ width: 72, height: 72, borderRadius: 18, background: 'linear-gradient(135deg,#1E4ED8,#4F7EFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: '#fff', boxShadow: '0 8px 24px rgba(79,126,255,.4)', flexShrink: 0 }}>
          {initials}
        </div>
        <div>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{klien.nama}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: 'var(--success-l)', color: '#22C55E' }}>Klien Terdaftar</span>
            {klien.nik && <span style={{ fontSize: 11, color: 'var(--text-xs)', fontFamily: 'monospace' }}>NIK: {klien.nik}</span>}
          </div>
        </div>
      </div>

      {/* Detail */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px 26px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 18 }}>Informasi Data Diri</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px 32px' }}>
          {fields.map(f => (
            <div key={f.l} style={f.full ? { gridColumn: '1 / -1' } : {}}>
              <div style={{ fontSize: 10, color: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 5 }}>{f.l}</div>
              <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500, lineHeight: 1.5 }}>{f.v}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24, padding: '14px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 9 }}>
          <div style={{ fontSize: 12, color: 'var(--text-xs)', marginBottom: 4, fontWeight: 600 }}>Perubahan data?</div>
          <p style={{ fontSize: 12, color: 'var(--text-xs)', lineHeight: 1.6, margin: 0 }}>
            Untuk memperbarui data diri Anda, silakan hubungi langsung kantor Notaris & PPAT Renny Fonda.
          </p>
        </div>
      </div>
    </div>
  )
}

function EmptyPortal({ msg }) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-xs)' }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" style={{ marginBottom: 12, opacity: .5 }}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/></svg>
      <p style={{ fontSize: 13 }}>{msg}</p>
    </div>
  )
}

// kumpulan icon svg biar gak perlu import library
function HomeIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> }
function OrderIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> }
function DokIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg> }
function UserIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> }
function LogoutIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg> }
function ClockIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2"/></svg> }
function ProcessIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4v5h5M20 20v-5h-5"/><path strokeLinecap="round" d="M4 9a8 8 0 0115.5-2M20 15a8 8 0 01-15.5 2"/></svg> }
function CheckCircleIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg> }