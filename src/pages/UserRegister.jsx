import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function UserRegister() {
  const nav = useNavigate()
  const [step, setStep] = useState(1) // 1=form, 2=success
  const [form, setForm] = useState({ email: '', password: '', confirm: '' })
  const [show, setShow] = useState({ pw: false, cf: false })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setErr(''); setBusy(true)

    if (form.password !== form.confirm) {
      setErr('Password tidak cocok.'); setBusy(false); return
    }
    if (form.password.length < 6) {
      setErr('Password minimal 6 karakter.'); setBusy(false); return
    }

    // Cek dulu apakah email ada di tabel klien
    const { data: klien } = await supabase
      .from('klien')
      .select('id')
      .eq('email', form.email)
      .single()

    if (!klien) {
      setErr('Email ini belum terdaftar sebagai klien kami. Hubungi kantor untuk mendaftarkan email Anda terlebih dahulu.')
      setBusy(false); return
    }

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setErr('Email ini sudah memiliki akun. Silakan login.')
      } else {
        setErr(error.message)
      }
      setBusy(false); return
    }

    setStep(2)
    setBusy(false)
  }

  if (step === 2) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '48px 36px', width: '100%', maxWidth: 400, textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,.3)' }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--success-l)', border: '1px solid rgba(34,197,94,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckIcon />
        </div>
        <h2 style={{ fontFagitmily: "'Plus Jakarta Sans',sans-serif", fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 10 }}>Akun Berhasil Dibuat</h2>
        <p style={{ fontSize: 13, color: 'var(--text-xs)', lineHeight: 1.7, marginBottom: 28 }}>
          Kami mengirimkan email verifikasi ke <strong style={{ color: 'var(--text-sm)' }}>{form.email}</strong>.<br />
          Buka email dan klik tautan verifikasi untuk mengaktifkan akun Anda.
        </p>
        <button onClick={() => nav('/portal/login')} style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 700, background: 'linear-gradient(135deg,#1E4ED8,#4F7EFF)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', boxShadow: '0 4px 16px rgba(79,126,255,.35)' }}>
          Ke Halaman Login
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '32px 24px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
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
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Notaris & PPAT Renny Fonda</div>
            <div style={{ fontSize: 11, color: 'var(--text-xs)' }}>Portal Klien</div>
          </div>
        </div>

        <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>Buat Akun</h2>
        <p style={{ fontSize: 13, color: 'var(--text-xs)', marginBottom: 28 }}>
          Email harus sudah terdaftar sebagai klien kantor kami.
        </p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          {[
            { key: 'email', label: 'Email', type: 'email', ph: 'nama@email.com', icon: <MailIcon /> },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 6 }}>{f.label}</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-xs)', pointerEvents: 'none' }}>{f.icon}</span>
                <input
                  type={f.type} value={form[f.key]} onChange={set(f.key)}
                  placeholder={f.ph} required
                  style={{ width: '100%', padding: '11px 13px 11px 38px', fontSize: 14, background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 10, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>
          ))}

          {/* Password */}
          {[
            { key: 'password', label: 'Password', showKey: 'pw', ph: '••••••••' },
            { key: 'confirm', label: 'Konfirmasi Password', showKey: 'cf', ph: '••••••••' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 6 }}>{f.label}</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-xs)', pointerEvents: 'none' }}><LockIcon /></span>
                <input
                  type={show[f.showKey] ? 'text' : 'password'} value={form[f.key]} onChange={set(f.key)}
                  placeholder={f.ph} required
                  style={{ width: '100%', padding: '11px 40px 11px 38px', fontSize: 14, background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 10, color: 'var(--text)', outline: 'none', boxSizing: 'border-box', letterSpacing: show[f.showKey] ? 0 : 3 }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button type="button" onClick={() => setShow(s => ({ ...s, [f.showKey]: !s[f.showKey] }))} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-xs)', padding: 4 }}>
                  {show[f.showKey] ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
          ))}

          {err && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'var(--danger-l)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '9px 12px', fontSize: 12, color: '#FCA5A5', fontWeight: 500, lineHeight: 1.5 }}>
              <AlertIcon /> <span>{err}</span>
            </div>
          )}

          <button type="submit" disabled={busy} style={{ padding: '13px', fontSize: 14, fontWeight: 700, background: busy ? 'var(--surface2)' : 'linear-gradient(135deg,#1E4ED8,#4F7EFF)', color: busy ? 'var(--text-xs)' : '#fff', border: 'none', borderRadius: 10, cursor: busy ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: busy ? 'none' : '0 4px 16px rgba(79,126,255,.35)', marginTop: 4 }}>
            {busy ? <><Spin /> Mendaftarkan…</> : 'Buat Akun'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text-xs)' }}>
          Sudah punya akun?{' '}
          <Link to="/portal/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Masuk di sini</Link>
        </p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function ScaleIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M3 9l9-6 9 6M3 15h18"/><path d="M6 12H3l3 6M18 12h3l-3 6"/></svg>
}
function MailIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg> }
function LockIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg> }
function EyeIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> }
function EyeOffIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg> }
function AlertIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0,marginTop:1}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> }
function CheckIcon() { return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg> }
function Spin() { return <span style={{ display:'inline-block', width:14, height:14, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .6s linear infinite' }} /> }