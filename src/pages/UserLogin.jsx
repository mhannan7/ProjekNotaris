import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function UserLogin() {
  const nav = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setErr(''); setBusy(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })
    if (error) {
      setErr('Email atau password salah.')
      setBusy(false)
      return
    }
    // cek apakah user ini punya record di tabel klien
    const { data: klien } = await supabase
      .from('klien')
      .select('id, nama')
      .eq('email', data.user.email)
      .single()

    if (!klien) {
      await supabase.auth.signOut()
      setErr('Akun ini belum terdaftar sebagai klien. Hubungi kantor kami.')
      setBusy(false)
      return
    }
    nav('/portal', { replace: true })
    setBusy(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>
      {/* Left — hero */}
      <div style={{
        flex: '0 0 480px', display: 'none',
        background: 'linear-gradient(160deg, #0B1526 0%, #0F2040 60%, #091830 100%)',
        borderRight: '1px solid var(--border)',
        flexDirection: 'column', justifyContent: 'space-between',
        padding: '52px 48px', position: 'relative', overflow: 'hidden',
      }} className="user-login-hero">
        {/* decorative rings */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 360, height: 360, borderRadius: '50%', border: '1px solid rgba(79,126,255,.12)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -30, right: -30, width: 220, height: 220, borderRadius: '50%', border: '1px solid rgba(79,126,255,.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 120, left: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,126,255,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            {/* Logo Baru (Transparan & Responsif) */}
            <div style={{ 
              width: 'clamp(32px, 4vw, 42px)', 
              height: 'clamp(32px, 4vw, 42px)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <img 
                src="/LogoRonnyWeb_20260729_021749_0000.svg" 
                alt="Logo Notaris Renny Fonda" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', letterSpacing: '.3px' }}>Notaris & PPAT</div>
              <div style={{ fontSize: 11, color: 'var(--text-xs)' }}>Renny Fonda · Kota Cilegon</div>
            </div>
          </div>
        </div>

        {/* Main copy */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 16 }}>Portal Klien</div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 36, fontWeight: 800, color: 'var(--text)', lineHeight: 1.2, marginBottom: 18 }}>
            Pantau Status<br />Layanan Anda<br />
            <span style={{ color: 'var(--accent)' }}>Kapan Saja.</span>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-sm)', lineHeight: 1.7, maxWidth: 320 }}>
            Akses real-time ke status order, dokumen, dan informasi layanan notariat Anda tanpa perlu menghubungi kantor.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 36 }}>
            {[
              { icon: '🔔', text: 'Notifikasi status order otomatis' },
              { icon: '📄', text: 'Lihat kelengkapan dokumen' },
              { icon: '🔒', text: 'Data Anda terlindungi & aman' },
            ].map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-sm)' }}>
                <span style={{ fontSize: 16 }}>{f.icon}</span>
                {f.text}
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 11, color: 'var(--text-xs)' }}>© 2026 Kantor Notaris & PPAT Renny Fonda</div>
      </div>

      {/* Right — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Mobile brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }} className="user-login-mobile-brand">
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg,#1E4ED8,#4F7EFF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ScaleIcon size={16} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Notaris & PPAT Renny Fonda</div>
              <div style={{ fontSize: 11, color: 'var(--text-xs)' }}>Portal Klien</div>
            </div>
          </div>

          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>Masuk ke Portal</h2>
          <p style={{ fontSize: 13, color: 'var(--text-xs)', marginBottom: 32 }}>Gunakan email yang sudah terdaftar di kantor kami.</p>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 6 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-xs)', pointerEvents: 'none' }}>
                  <MailIcon size={15} />
                </span>
                <input
                  type="email" value={form.email} onChange={set('email')}
                  placeholder="nama@email.com" required autoFocus
                  style={{ width: '100%', padding: '11px 13px 11px 38px', fontSize: 14, background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 10, color: 'var(--text)', outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-xs)', pointerEvents: 'none' }}>
                  <LockIcon size={15} />
                </span>
                <input
                  type={show ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder="••••••••" required
                  style={{ width: '100%', padding: '11px 40px 11px 38px', fontSize: 14, background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 10, color: 'var(--text)', outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s', letterSpacing: show ? 0 : 3 }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-xs)', padding: 4 }}>
                  {show ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {err && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--danger-l)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '9px 12px', fontSize: 12, color: '#FCA5A5', fontWeight: 500 }}>
                <AlertIcon size={13} /> {err}
              </div>
            )}

            <button type="submit" disabled={busy || !form.email || !form.password} style={{
              padding: '13px', fontSize: 14, fontWeight: 700,
              background: busy || !form.email || !form.password ? 'var(--surface2)' : 'linear-gradient(135deg,#1E4ED8,#4F7EFF)',
              color: busy || !form.email || !form.password ? 'var(--text-xs)' : '#fff',
              border: 'none', borderRadius: 10, cursor: busy || !form.email || !form.password ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: busy || !form.email || !form.password ? 'none' : '0 4px 16px rgba(79,126,255,.35)',
              transition: 'all .15s',
            }}>
              {busy ? <><Spin /> Memverifikasi…</> : <>Masuk ke Portal <ArrowIcon size={14} /></>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--text-xs)' }}>
            Belum punya akun?{' '}
            <Link to="/portal/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Daftar sekarang</Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'var(--text-xs)' }}>
            Masuk sebagai{' '}
            <Link to="/login" style={{ color: 'var(--text-sm)', fontWeight: 600, textDecoration: 'none' }}>Admin →</Link>
          </div>
        </div>
      </div>

      <style>{`
        @media(min-width:900px){
          .user-login-hero { display:flex !important; }
          .user-login-mobile-brand { display:none !important; }
        }
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  )
}

// ── Inline icon components ──────────────────────────────────────────────
function ScaleIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M3 9l9-6 9 6M3 15h18"/><path d="M6 12H3l3 6M18 12h3l-3 6"/></svg>
}
function MailIcon({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
}
function LockIcon({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
}
function EyeIcon({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
}
function EyeOffIcon({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
}
function AlertIcon({ size = 13 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
}
function ArrowIcon({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
}
function Spin() {
  return <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
}