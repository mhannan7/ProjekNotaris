import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Spinner, formatRp, formatDate } from '../components/UI'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#1B4FD8', '#93AEED', '#166534', '#92400E', '#6B6860']

// export ke PDF, jsPDF-nya di-load dari CDN pas dibutuhin aja
async function exportPDF({ rangeStart, rangeEnd, total, selesai, diproses, menunggu, batal, totalBiaya, layananData, orders }) {
  // Load jsPDF dari CDN
  if (!window.jspdf) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      s.onload = resolve; s.onerror = reject
      document.head.appendChild(s)
    })
  }
  if (!window.jspdf?.jsPDF?.API?.autoTable) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'
      s.onload = resolve; s.onerror = reject
      document.head.appendChild(s)
    })
  }

  const { jsPDF } = window.jspdf
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const W = doc.internal.pageSize.getWidth()
  const margin = 18

  doc.setFillColor(30, 64, 175)
  doc.rect(0, 0, W, 38, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('LAPORAN ADMINISTRASI', margin, 16)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('Kantor Notaris & PPAT Renny Fonda — Kota Cilegon, Banten', margin, 23)
  doc.text(`Periode: ${rangeStart} s/d ${rangeEnd}`, margin, 29)
  doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}`, margin, 35)

  let y = 48

  doc.setTextColor(30, 30, 30)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Ringkasan Periode', margin, y)
  y += 6

  const boxW = (W - margin * 2 - 12) / 4
  const boxes = [
    { label: 'Total Order', val: String(total), bg: [239,246,255], accent: [30,64,175] },
    { label: 'Selesai', val: String(selesai), bg: [240,253,244], accent: [22,101,52] },
    { label: 'Diproses', val: String(diproses), bg: [255,251,235], accent: [146,64,14] },
    { label: 'Total Pendapatan',val: formatRp(totalBiaya), bg: [245,243,255], accent: [109,40,217] },
  ]
  boxes.forEach((b, i) => {
    const x = margin + i * (boxW + 4)
    doc.setFillColor(...b.bg)
    doc.roundedRect(x, y, boxW, 20, 3, 3, 'F')
    doc.setDrawColor(...b.accent)
    doc.setLineWidth(0.5)
    doc.roundedRect(x, y, boxW, 20, 3, 3, 'S')
    doc.setTextColor(...b.accent)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(b.val.length > 10 ? 8 : 13)
    doc.text(b.val, x + boxW / 2, y + 12, { align: 'center' })
    doc.setTextColor(100, 100, 100)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.text(b.label.toUpperCase(), x + boxW / 2, y + 18, { align: 'center' })
  })
  y += 28

  doc.setTextColor(30, 30, 30)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Distribusi Status', margin, y)
  y += 4

  doc.autoTable({
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Status', 'Jumlah Order', 'Persentase']],
    body: [
      ['Menunggu', menunggu, total ? `${Math.round(menunggu/total*100)}%` : '0%'],
      ['Diproses', diproses, total ? `${Math.round(diproses/total*100)}%` : '0%'],
      ['Selesai', selesai, total ? `${Math.round(selesai/total*100)}%` : '0%'],
      ['Batal', batal, total ? `${Math.round(batal/total*100)}%` : '0%'],
    ],
    foot: [['TOTAL', total, '100%']],
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: [241, 245, 249], textColor: [30,30,30], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'center' }, 2: { halign: 'center' } },
  })
  y = doc.lastAutoTable.finalY + 10

  doc.setTextColor(30, 30, 30)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Rekap per Jenis Layanan', margin, y)
  y += 4

  const layananRows = layananData.map(l => {
    const rows = orders.filter(o => o.layanan_nama === l.name)
    return [
      l.name,
      rows.length,
      rows.filter(o => o.status === 'menunggu').length,
      rows.filter(o => o.status === 'diproses').length,
      rows.filter(o => o.status === 'selesai').length,
      rows.filter(o => o.status === 'batal').length,
      formatRp(rows.reduce((s, o) => s + (Number(o.biaya)||0), 0)),
    ]
  })

  doc.autoTable({
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Jenis Layanan', 'Total', 'Menunggu', 'Diproses', 'Selesai', 'Batal', 'Pendapatan']],
    body: layananRows.length ? layananRows : [['Tidak ada data', '', '', '', '', '', '']],
    foot: layananRows.length ? [['TOTAL', total, menunggu, diproses, selesai, batal, formatRp(totalBiaya)]] : [],
    styles: { fontSize: 8.5, cellPadding: 3.5 },
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: [241, 245, 249], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { halign: 'center' }, 2: { halign: 'center' },
      3: { halign: 'center' }, 4: { halign: 'center' },
      5: { halign: 'center' }, 6: { halign: 'right' },
    },
  })
  y = doc.lastAutoTable.finalY + 10

  // Cek apakah cukup ruang, kalau tidak tambah halaman baru
  if (y > 220) { doc.addPage(); y = 20 }

  doc.setTextColor(30, 30, 30)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Daftar Order', margin, y)
  y += 4

  const statusColor = { selesai: [22,101,52], diproses: [146,64,14], menunggu: [71,85,105], batal: [185,28,28] }

  doc.autoTable({
    startY: y,
    margin: { left: margin, right: margin },
    head: [['No. Order', 'Klien', 'Layanan', 'Tanggal', 'Status', 'Biaya']],
    body: orders.map(o => [
      o.nomor_order ?? '-',
      o.klien_nama ?? '-',
      o.layanan_nama ? (o.layanan_nama.length > 22 ? o.layanan_nama.slice(0,21)+'…' : o.layanan_nama) : '-',
      o.tanggal_masuk ? new Date(o.tanggal_masuk).toLocaleDateString('id-ID') : '-',
      (o.status ?? '-').charAt(0).toUpperCase() + (o.status ?? '').slice(1),
      formatRp(Number(o.biaya)||0),
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold', textColor: [30,64,175] },
      1: { cellWidth: 36 },
      2: { cellWidth: 46 },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { halign: 'right' },
    },
    didParseCell(data) {
      if (data.section === 'body' && data.column.index === 4) {
        const s = data.cell.raw?.toLowerCase()
        const c = statusColor[s]
        if (c) data.cell.styles.textColor = c
      }
    },
  })

  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`Halaman ${i} dari ${totalPages}`, W - margin, doc.internal.pageSize.getHeight() - 8, { align: 'right' })
    doc.text('Kantor Notaris & PPAT Renny Fonda', margin, doc.internal.pageSize.getHeight() - 8)
  }

  doc.save(`Laporan_${rangeStart}_sd_${rangeEnd}.pdf`)
}

export default function LaporanPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [rangeStart, setRangeStart] = useState(() => {
    const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0]
  })
  const [rangeEnd, setRangeEnd] = useState(() => new Date().toISOString().split('T')[0])

  useEffect(() => { fetchOrders() }, [rangeStart, rangeEnd])

  async function fetchOrders() {
    setLoading(true)
    const { data } = await supabase
      .from('v_orders').select('*')
      .gte('tanggal_masuk', rangeStart)
      .lte('tanggal_masuk', rangeEnd)
      .order('tanggal_masuk')
    if (data) setOrders(data)
    setLoading(false)
  }

  const total = orders.length
  const selesai = orders.filter(o => o.status === 'selesai').length
  const diproses = orders.filter(o => o.status === 'diproses').length
  const menunggu = orders.filter(o => o.status === 'menunggu').length
  const batal = orders.filter(o => o.status === 'batal').length
  const totalBiaya = orders.reduce((sum, o) => sum + (Number(o.biaya) || 0), 0)

  const layananMap = {}
  orders.forEach(o => {
    if (!o.layanan_nama) return
    if (!layananMap[o.layanan_nama]) layananMap[o.layanan_nama] = { name: o.layanan_nama, total: 0, selesai: 0 }
    layananMap[o.layanan_nama].total++
    if (o.status === 'selesai') layananMap[o.layanan_nama].selesai++
  })
  const layananData = Object.values(layananMap)

  const pieData = [
    { name: 'Menunggu', value: menunggu },
    { name: 'Diproses', value: diproses },
    { name: 'Selesai', value: selesai },
    { name: 'Batal', value: batal },
  ].filter(d => d.value > 0)

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportPDF({ rangeStart, rangeEnd, total, selesai, diproses, menunggu, batal, totalBiaya, layananData, orders })
    } catch(e) {
      alert('Gagal export PDF: ' + e.message)
    }
    setExporting(false)
  }

  if (loading) return <Spinner />

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Laporan Administrasi</h2>
          <p style={{ color: 'var(--text-sm)', fontSize: 13, marginTop: 2 }}>Rekap penerimaan order berdasarkan periode</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={fetchOrders}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M4 4v5h5M20 20v-5h-5"/><path strokeLinecap="round" d="M4 9a8 8 0 0115.5-2M20 15a8 8 0 01-15.5 2"/></svg>
            Refresh
          </button>
          {/* ── TOMBOL EXPORT PDF ── */}
          <button
            onClick={handleExport}
            disabled={exporting || total === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', fontSize: 13, fontWeight: 600,
              background: exporting || total === 0 ? 'var(--border)' : 'linear-gradient(135deg,#DC2626,#EF4444)',
              color: '#fff', border: 'none', borderRadius: 9,
              cursor: exporting || total === 0 ? 'not-allowed' : 'pointer',
              boxShadow: exporting || total === 0 ? 'none' : '0 4px 12px rgba(220,38,38,.35)',
              transition: 'all .15s',
            }}
          >
            {exporting ? (
              <>
                <span style={{ display:'inline-block', width:13, height:13, border:'2px solid rgba(255,255,255,.35)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .6s linear infinite' }} />
                Membuat PDF…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <polyline points="9,15 12,18 15,15"/>
                </svg>
                Export PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Date range filter */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <label style={{ whiteSpace: 'nowrap' }}>Dari</label>
            <input type="date" style={{ width: 160 }} value={rangeStart} onChange={e => setRangeStart(e.target.value)} />
          </div>
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <label style={{ whiteSpace: 'nowrap' }}>Sampai</label>
            <input type="date" style={{ width: 160 }} value={rangeEnd} onChange={e => setRangeEnd(e.target.value)} />
          </div>
          <button className="btn btn-sm" onClick={() => {
            const d = new Date(); d.setDate(1)
            setRangeStart(d.toISOString().split('T')[0])
            setRangeEnd(new Date().toISOString().split('T')[0])
          }}>Bulan Ini</button>
          <button className="btn btn-sm" onClick={() => {
            const d = new Date(); d.setMonth(d.getMonth() - 1, 1)
            const e = new Date(d.getFullYear(), d.getMonth() + 1, 0)
            setRangeStart(d.toISOString().split('T')[0])
            setRangeEnd(e.toISOString().split('T')[0])
          }}>Bulan Lalu</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat accent"><div className="stat-label">Total Order</div><div className="stat-val">{total}</div></div>
        <div className="stat"><div className="stat-label">Selesai</div><div className="stat-val">{selesai}</div><div className="stat-sub">{total ? Math.round(selesai/total*100) : 0}% dari total</div></div>
        <div className="stat"><div className="stat-label">Diproses</div><div className="stat-val">{diproses}</div></div>
        <div className="stat"><div className="stat-label">Total Pendapatan</div><div className="stat-val" style={{ fontSize: 18 }}>{formatRp(totalBiaya)}</div></div>
      </div>

      <div className="two-col" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-title">Order per jenis layanan</div>
          {layananData.length === 0 ? (
            <p style={{ color: 'var(--text-sm)', fontSize: 13 }}>Tidak ada data.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={layananData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="total" name="Total" fill="#1B4FD8" radius={[0,4,4,0]} />
                <Bar dataKey="selesai" name="Selesai" fill="#166534" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card">
          <div className="card-title">Distribusi status order</div>
          {pieData.length === 0 ? (
            <p style={{ color: 'var(--text-sm)', fontSize: 13 }}>Tidak ada data.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name, percent}) => `${name} ${Math.round(percent*100)}%`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Detail table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px 12px', fontWeight: 600, fontSize: 14, borderBottom: '1px solid var(--border)' }}>
          Rekap per jenis layanan
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Jenis Layanan</th><th>Total</th><th>Menunggu</th>
                <th>Diproses</th><th>Selesai</th><th>Batal</th>
              </tr>
            </thead>
            <tbody>
              {layananData.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--text-sm)' }}>Tidak ada data pada periode ini.</td></tr>
              ) : layananData.map(l => {
                const rows = orders.filter(o => o.layanan_nama === l.name)
                return (
                  <tr key={l.name}>
                    <td style={{ fontWeight: 500 }}>{l.name}</td>
                    <td>{rows.length}</td>
                    <td>{rows.filter(o => o.status === 'menunggu').length}</td>
                    <td>{rows.filter(o => o.status === 'diproses').length}</td>
                    <td>{rows.filter(o => o.status === 'selesai').length}</td>
                    <td>{rows.filter(o => o.status === 'batal').length}</td>
                  </tr>
                )
              })}
              {layananData.length > 0 && (
                <tr style={{ fontWeight: 600, background: 'var(--bg)' }}>
                  <td>TOTAL</td><td>{total}</td><td>{menunggu}</td>
                  <td>{diproses}</td><td>{selesai}</td><td>{batal}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}