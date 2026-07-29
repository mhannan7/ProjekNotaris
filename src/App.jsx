import { useState, useEffect, createContext, useContext } from 'react'
import { Routes, Route, useLocation, Navigate, useNavigate, Link } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import ThemeToggle from './components/ThemeToggle'
import { ThemeProvider } from './hooks/useTheme'
import { ToastProvider } from './hooks/useToast'
import Dashboard from './pages/Dashboard'
import OrderPage, { OrderDetail } from './pages/Order'
import KlienPage from './pages/Klien'
import DokumenPage from './pages/Dokumen'
import LaporanPage from './pages/Laporan'
import UserLogin from './pages/UserLogin'
import UserRegister from './pages/UserRegister'
import UserPortal, { UserAuthProvider, UserGuard } from './pages/UserPortal'

// admin session lives in sessionStorage, super basic
const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

function AuthProvider({ children }) {
  const [ok, setOk] = useState(() => sessionStorage.getItem('adm') === '1')
  const login = pw => { const v = (import.meta.env.VITE_ADMIN_PASSWORD||'admin123'); if(pw===v){sessionStorage.setItem('adm','1');setOk(true);return true} return false }
  const logout = () => { sessionStorage.removeItem('adm'); setOk(false) }
  return <AuthCtx.Provider value={{ ok, login, logout }}>{children}</AuthCtx.Provider>
}

function LandingPage() {
  const { ok } = useAuth()
  const nav = useNavigate()
  useEffect(() => { if (ok) nav('/dashboard', { replace: true }) }, [ok])
  if (ok) return null

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ 
          width: 'clamp(75px, 12vw, 115px)', 
          height: 'clamp(75px, 12vw, 115px)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 20px', 
          padding: 0,                           /* Dibuat 0 agar logo mengisi penuh */
          boxSizing: 'border-box'
        }}>
          <img 
            src={"/LogoRonnyWeb_20260729_021749_0000.svg"} /* atau src="/logo.svg" */
            alt="Logo Notaris Renny Fonda" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
          />
        </div>
        <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: 'var(--text-xs)', textTransform: 'uppercase' }}>Selamat Datang di</p>
        <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, color: 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Notaris & PPAT Renny Fonda</h1>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-xs)' }}>Kota Cilegon, Banten — Silakan pilih portal yang sesuai</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, width: '100%', maxWidth: 600 }}>
        {/* Portal Klien */}
        <Link to="/portal/login" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'var(--surface)', border: '1.5px solid rgba(79,126,255,.25)', borderRadius: 18, padding: '32px 28px', cursor: 'pointer', transition: 'all .2s', boxShadow: '0 4px 20px rgba(79,126,255,.08)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(79,126,255,.2)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(79,126,255,.25)'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(79,126,255,.08)' }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 13, background: 'linear-gradient(135deg,#1E4ED8,#4F7EFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, boxShadow: '0 4px 14px rgba(79,126,255,.35)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 8 }}>Portal Klien</div>
            <h3 style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Masuk sebagai Klien</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text-xs)', lineHeight: 1.6 }}>Pantau status order, cek kelengkapan dokumen, dan lihat riwayat layanan Anda.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {['🔔 Status order real-time', '📄 Kelengkapan dokumen', '🔒 Data aman & terenkripsi'].map(f => (
                <div key={f} style={{ fontSize: 12, color: 'var(--text-sm)' }}>{f}</div>
              ))}
            </div>
            <div style={{ marginTop: 22 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>Masuk ke Portal →</span>
            </div>
          </div>
        </Link>

        {/* Admin */}
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 18, padding: '32px 28px', cursor: 'pointer', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='#7B61FF'; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(79,70,229,.15)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 13, background: 'linear-gradient(135deg,#4F46E5,#7B61FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, boxShadow: '0 4px 14px rgba(79,70,229,.35)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: '#7B61FF', textTransform: 'uppercase', marginBottom: 8 }}>Admin</div>
            <h3 style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Masuk sebagai Admin</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text-xs)', lineHeight: 1.6 }}>Kelola order, data klien, dokumen, dan laporan administrasi kantor notaris.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {['📋 Manajemen order & klien', '📁 Pengelolaan dokumen', '📊 Laporan & statistik'].map(f => (
                <div key={f} style={{ fontSize: 12, color: 'var(--text-sm)' }}>{f}</div>
              ))}
            </div>
            <div style={{ marginTop: 22 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#7B61FF' }}>Login Admin →</span>
            </div>
          </div>
        </Link>
      </div>

      <p style={{ marginTop: 36, fontSize: 11, color: 'var(--text-xs)', textAlign: 'center' }}>
        © 2026 Kantor Notaris & PPAT Renny Fonda · Kota Cilegon, Banten
      </p>
    </div>
  )
}


function LoginPage() {
  const { login, ok } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const from = loc.state?.from?.pathname || '/dashboard'
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => { if (ok) nav(from, { replace: true }) }, [ok])
  if (ok) return null

  const submit = async e => {
    e.preventDefault(); setErr(''); setBusy(true)
    await new Promise(r => setTimeout(r, 300))
    if (!login(pw)) { setErr('Password salah.'); setPw('') }
    setBusy(false)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:24 }}>
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:18, padding:'44px 36px', width:'100%', maxWidth:380, boxShadow:'0 8px 40px rgba(0,0,0,.15)', textAlign:'center' }}>
        <div style={{ 
          width: 'clamp(50px, 8vw, 70px)', 
          height: 'clamp(50px, 8vw, 70px)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 18px', 
          padding: 0,
          boxSizing: 'border-box'
        }}>
          <img 
            src="/LogoRonnyWeb_20260729_021749_0000.svg" 
            alt="Logo Notaris Renny Fonda" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
          />
        </div>

        <p style={{ margin:'0 0 4px', fontSize:11, fontWeight:600, letterSpacing:2, color:'var(--text-xs)', textTransform:'uppercase' }}>Notaris & PPAT Renny Fonda</p>
        <h2 style={{ margin:'0 0 6px', fontSize:21, fontWeight:700, color:'var(--text)' }}>Admin Login</h2>
        <p style={{ margin:'0 0 26px', fontSize:13, color:'var(--text-xs)' }}>Masukkan password untuk masuk ke dashboard.</p>
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:13, textAlign:'left' }}>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'var(--text-sm)', display:'block', marginBottom:5 }}>Password</label>
            <div style={{ position:'relative' }}>
              <input type={show?'text':'password'} value={pw} onChange={e=>setPw(e.target.value)}
                placeholder="Masukkan password admin" required autoFocus
                style={{ width:'100%', padding:'11px 42px 11px 13px', fontSize:14, border:`1.5px solid ${err?'#EF4444':'var(--border)'}`, borderRadius:9, outline:'none', background:err?'#FFF5F5':'var(--surface2)', color:'var(--text)', boxSizing:'border-box', letterSpacing:show?0:3 }}
              />
              <button type="button" onClick={()=>setShow(s=>!s)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-xs)', display:'flex', padding:2 }}>
                {show
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>
          {err && <div style={{ display:'flex', alignItems:'center', gap:7, background:'#FEF2F2', color:'#B91C1C', border:'1px solid #FECACA', borderRadius:8, padding:'9px 12px', fontSize:12, fontWeight:500 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {err}
          </div>}
          <button type="submit" disabled={busy||!pw} style={{ padding:'12px', fontSize:13, fontWeight:600, background:busy||!pw?'var(--border)':'linear-gradient(135deg,#4F46E5,#7B61FF)', color:'#fff', border:'none', borderRadius:9, cursor:busy||!pw?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7, minHeight:44, boxShadow:busy||!pw?'none':'0 4px 14px rgba(79,70,229,.4)' }}>
            {busy?<><span style={{ display:'inline-block', width:15, height:15, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .6s linear infinite' }}/> Memverifikasi…</>:<>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
              Masuk ke Dashboard
            </>}
          </button>
        </form>
        <p style={{ marginTop:20, fontSize:12, color:'var(--text-xs)' }}>
          Masuk sebagai klien?{' '}
          <Link to="/portal/login" style={{ color:'var(--accent)', fontWeight:600, textDecoration:'none' }}>Portal Klien →</Link>
        </p>
        <p style={{ marginTop:8, fontSize:12, color:'var(--text-xs)' }}>
          <Link to="/" style={{ color:'var(--text-xs)', textDecoration:'none' }}>← Kembali ke halaman utama</Link>
        </p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// redirect kalau belum login
function Guard({ children }) {
  const { ok } = useAuth()
  const loc = useLocation()
  if (!ok) return <Navigate to="/login" state={{ from: loc }} replace />
  return children
}

function LogoutBtn() {
  const { logout } = useAuth()
  const nav = useNavigate()
  const [confirm, setConfirm] = useState(false)
  const doLogout = () => { logout(); nav('/login', { replace: true }) }

  return (
    <>
      <button onClick={()=>setConfirm(true)} className="logout-btn" title="Logout">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
        <span className="logout-label">Logout</span>
      </button>
      {confirm && (
        <div onClick={()=>setConfirm(false)} style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,.5)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'32px 28px', width:'100%', maxWidth:320, textAlign:'center', boxShadow:'0 20px 60px rgba(0,0,0,.25)' }}>
            <div style={{ width:50, height:50, borderRadius:13, background:'#FEF2F2', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            </div>
            <h3 style={{ margin:'0 0 7px', fontSize:16, fontWeight:700, color:'var(--text)' }}>Konfirmasi Logout</h3>
            <p style={{ margin:'0 0 22px', fontSize:13, color:'var(--text-xs)', lineHeight:1.5 }}>Kamu akan keluar dari sesi admin.<br/>Lanjutkan?</p>
            <div style={{ display:'flex', gap:9 }}>
              <button onClick={()=>setConfirm(false)} style={{ flex:1, padding:'10px', fontSize:13, fontWeight:600, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8, cursor:'pointer', color:'var(--text-sm)' }}>Batal</button>
              <button onClick={doLogout} style={{ flex:1, padding:'10px', fontSize:13, fontWeight:600, background:'#EF4444', border:'none', borderRadius:8, cursor:'pointer', color:'#fff', boxShadow:'0 4px 12px rgba(239,68,68,.35)' }}>Ya, Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// dipakai buat judul header tiap halaman
const TITLES = {
  '/dashboard': { title:'Dashboard', icon:'▦' },
  '/order': { title:'Penerimaan Order', icon:'📋' },
  '/klien': { title:'Data Klien', icon:'👥' },
  '/dokumen': { title:'Dokumen', icon:'📁' },
  '/laporan': { title:'Laporan', icon:'📊' },
}

// routing manual, gak pakai react-router buat bagian dalam
function PageContent() {
  const loc = useLocation()
  const path = loc.pathname.replace(/\/+$/, '') // trim trailing slash
  const parts = path.split('/').filter(Boolean) // ['dashboard'] or ['order', '123']

  if (parts[0] === 'order' && parts[1]) return <OrderDetail />
  if (parts[0] === 'klien' && parts[1]) return <KlienPage />
  if (parts[0] === 'dashboard' || parts.length === 0) return <Dashboard />
  if (parts[0] === 'order') return <OrderPage />
  if (parts[0] === 'klien') return <KlienPage />
  if (parts[0] === 'dokumen') return <DokumenPage />
  if (parts[0] === 'laporan') return <LaporanPage />
  return <Navigate to="/dashboard" replace />
}

function Shell() {
  const loc = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const base = '/' + (loc.pathname.split('/').filter(Boolean)[0] || 'dashboard')
  const pg = TITLES[base] ?? { title:'Admin', icon:'' }
  const closeSidebar = () => setMobileOpen(false)

  return (
    <div className="app-shell">
      {mobileOpen && <div className="sidebar-backdrop" onClick={closeSidebar} aria-hidden="true" />}
      <div className={`sidebar-drawer${mobileOpen?' open':''}`}>
        <button className="sidebar-close-btn" onClick={closeSidebar} aria-label="Tutup menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <Sidebar onNavigate={closeSidebar} />
      </div>
      <div className="main-area">
        <header className="topbar">
          <button className="hamburger-btn" onClick={()=>setMobileOpen(true)} aria-label="Buka menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span className="topbar-title">
            <span style={{ fontSize:18, lineHeight:1 }}>{pg.icon}</span>
            <span className="topbar-title-text">{pg.title}</span>
          </span>
          <div className="topbar-user">
            <ThemeToggle />
            <span className="topbar-admin-label" style={{ fontSize:12, color:'var(--text-xs)' }}>Admin</span>
            <div className="avatar">AD</div>
            <LogoutBtn />
          </div>
        </header>
        <main>
          <PageContent />
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserAuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/portal/login" element={<UserLogin />} />
              <Route path="/portal/register" element={<UserRegister />} />
              <Route path="/portal/*" element={<UserGuard><UserPortal /></UserGuard>} />
              <Route path="/*" element={<Guard><Shell /></Guard>} />
            </Routes>
          </ToastProvider>
        </UserAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}