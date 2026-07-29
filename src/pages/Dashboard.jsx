import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Spinner, Badge, formatDate } from '../components/UI'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Area, AreaChart, CartesianGrid } from 'recharts'

/* Animated counter */
function AnimCounter({ target, duration = 900 }) {
  const [val, setVal] = useState(0)
  const raf = useRef(null)
  useEffect(() => {
    const start = performance.now()
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(target * ease))
      if (p < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [target])
  return <>{val}</>
}

const CHART_COLORS = ['#4F7EFF', '#7B61FF', '#F0B429', '#22C55E']

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [statsRes, recentRes, chartRes] = await Promise.all([
      supabase.from('v_dashboard').select('*').single(),
      supabase.from('v_orders').select('*').limit(6),
      supabase.from('v_orders').select('layanan_nama, status'),
    ])
    if (statsRes.data) setStats(statsRes.data)
    if (recentRes.data) setRecent(recentRes.data)
    if (chartRes.data) {
      const map = {}
      chartRes.data.forEach(o => {
        if (!o.layanan_nama) return
        map[o.layanan_nama] = (map[o.layanan_nama] || 0) + 1
      })
      setChartData(Object.entries(map).map(([name, val]) => ({ name, val })))
    }
    setLoading(false)
  }

  if (loading) return <Spinner />

  const cards = [
    { label: 'Total Order', val: stats?.total_order ?? 0, sub: 'semua waktu', accent: false, icon: '📋', color: '#4F7EFF' },
    { label: 'Bulan Ini', val: stats?.order_bulan_ini ?? 0, sub: 'order masuk', accent: true, icon: '📈', color: '#7B61FF' },
    { label: 'Sedang Diproses', val: stats?.total_diproses ?? 0, sub: 'perlu tindakan', accent: false, icon: '⚙️', color: '#F0B429' },
    { label: 'Selesai', val: stats?.total_selesai ?? 0, sub: 'order tuntas', accent: false, icon: '✅', color: '#22C55E' },
  ]

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) return (
      <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 9, padding: '8px 14px', fontSize: 12 }}>
        <p style={{ color: 'var(--text-xs)', marginBottom: 3 }}>{label}</p>
        <p style={{ color: 'var(--accent)', fontWeight: 600 }}>{payload[0].value} order</p>
      </div>
    )
    return null
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Selamat Datang </h2>
          <p>Ringkasan aktivitas Kantor Notaris & PPAT Renny Fonda</p>
        </div>
        <button className="btn" onClick={fetchAll}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M4 4v5h5M20 20v-5h-5"/>
            <path strokeLinecap="round" d="M4 9a8 8 0 0115.5-2M20 15a8 8 0 01-15.5 2"/>
          </svg>
          Perbarui
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {cards.map((c, i) => (
          <div key={c.label} className={`stat ${c.accent ? 'accent' : ''}`} style={{ animationDelay: `${i * 0.07}s` }}>
            <div className="stat-icon" style={{ background: c.color + '22' }}>
              <span style={{ fontSize: 18 }}>{c.icon}</span>
            </div>
            <div className="stat-label">{c.label}</div>
            <div className="stat-val"><AnimCounter target={c.val} /></div>
            <div className="stat-sub">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts + table */}
      <div className="two-col" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="card-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            Distribusi Layanan
          </div>
          {chartData.length === 0 ? (
            <p style={{ color: 'var(--text-xs)', fontSize: 13 }}>Belum ada data.</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 42)}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 130, right: 20, top: 4, bottom: 4 }}>
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={125}
                  tick={{ fontSize: 11, fill: 'var(--text-sm)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => v.length > 20 ? v.slice(0, 19) + '…' : v}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="val" radius={[0, 6, 6, 0]} maxBarSize={20}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="card-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
            </svg>
            Order Terbaru
          </div>
          {recent.length === 0 ? (
            <p style={{ color: 'var(--text-xs)', fontSize: 13 }}>Belum ada order.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>No. Order</th>
                    <th>Klien</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(o => (
                    <tr key={o.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-xs)' }}>{o.nomor_order}</td>
                      <td>{o.klien_nama ?? '—'}</td>
                      <td><Badge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Status summary */}
      <div className="card">
        <div className="card-title">Ringkasan Status</div>
        <div className="status-row">
          {[
            { label: 'Menunggu', val: stats?.total_menunggu ?? 0, cls: 'badge-menunggu', color: 'var(--text-xs)' },
            { label: 'Diproses', val: stats?.total_diproses ?? 0, cls: 'badge-diproses', color: 'var(--warn)' },
            { label: 'Selesai', val: stats?.total_selesai ?? 0, cls: 'badge-selesai', color: 'var(--success)' },
            { label: 'Batal', val: stats?.total_batal ?? 0, cls: 'badge-batal', color: 'var(--danger)' },
          ].map(s => (
            <div key={s.label} className="status-item">
              <span className={`badge ${s.cls}`}>{s.label}</span>
              <span className="status-count" style={{ color: s.color }}>{s.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}