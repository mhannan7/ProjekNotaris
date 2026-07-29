import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Spinner, Badge, EmptyState, Modal, formatDate, formatRp } from '../components/UI'
import { useToast } from '../hooks/useToast'

const STATUS_LIST = ['menunggu', 'diproses', 'selesai', 'batal']
const EMPTY_FORM = {
  klien_id: '', layanan_id: '', tanggal_masuk: new Date().toISOString().split('T')[0],
  tanggal_selesai: '', status: 'menunggu', catatan: '', biaya: '',
}

export function OrderDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const toast = useToast()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase.from('v_orders').select('*').eq('id', id).single()
      setOrder(data ?? null)
      setLoading(false)
    }
    load()
  }, [id])

  async function quickStatus(status) {
    setBusy(true)
    const payload = { status }
    if (status === 'selesai') payload.tanggal_selesai = new Date().toISOString().split('T')[0]
    const { error } = await supabase.from('orders').update(payload).eq('id', id)
    if (error) toast('Gagal update status.', 'error')
    else {
      toast('Status diperbarui!', 'success')
      setOrder(o => ({ ...o, ...payload }))
    }
    setBusy(false)
  }

  if (loading) return <Spinner />
  if (!order) return (
    <div className="page">
      <button className="btn btn-sm" onClick={() => nav('/order')} style={{ marginBottom: 20 }}>← Kembali</button>
      <EmptyState msg="Order tidak ditemukan." />
    </div>
  )

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button className="btn btn-sm" onClick={() => nav('/order')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Kembali
          </button>
          <div>
            <h2 style={{ margin: 0 }}>Detail Order</h2>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-xs)', fontFamily: 'monospace' }}>{order.nomor_order}</p>
          </div>
        </div>
        <Badge status={order.status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
        {/* Info utama */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 20 }}>Informasi Order</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            {[
              ['Nomor Order', order.nomor_order ?? '—'],
              ['Klien', order.klien_nama ?? '—'],
              ['Jenis Layanan', order.layanan_nama ?? '—'],
              ['Tanggal Masuk', formatDate(order.tanggal_masuk)],
              ['Tanggal Selesai',formatDate(order.tanggal_selesai)],
              ['Biaya', formatRp(order.biaya)],
            ].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{val}</div>
              </div>
            ))}
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: 11, color: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Catatan</div>
              <div style={{ fontSize: 14, color: 'var(--text)' }}>{order.catatan ?? '—'}</div>
            </div>
          </div>
        </div>

        {/* Sidebar aksi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>Ubah Status</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {order.status === 'menunggu' && (
                <button disabled={busy} onClick={() => quickStatus('diproses')}
                  style={{ padding: '9px 12px', fontSize: 13, fontWeight: 600, background: 'var(--warn-l)', color: 'var(--warn)', border: '1px solid rgba(245,158,11,.3)', borderRadius: 9, cursor: 'pointer' }}>
                  ◐ Tandai Diproses
                </button>
              )}
              {order.status === 'diproses' && (
                <button disabled={busy} onClick={() => quickStatus('selesai')}
                  style={{ padding: '9px 12px', fontSize: 13, fontWeight: 600, background: 'var(--success-l)', color: 'var(--success)', border: '1px solid rgba(34,197,94,.3)', borderRadius: 9, cursor: 'pointer' }}>
                  ● Tandai Selesai
                </button>
              )}
              {(order.status === 'menunggu' || order.status === 'diproses') && (
                <button disabled={busy} onClick={() => quickStatus('batal')}
                  style={{ padding: '9px 12px', fontSize: 13, fontWeight: 600, background: 'var(--danger-l)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 9, cursor: 'pointer' }}>
                  ✕ Batalkan Order
                </button>
              )}
            </div>
          </div>

          <div className="card" style={{ background: 'linear-gradient(135deg,rgba(79,70,229,.08),rgba(123,97,255,.05))', border: '1px solid rgba(79,70,229,.15)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Total Biaya</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>{formatRp(order.biaya)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}


export default function OrderPage() {
  const toast = useToast()
  const nav = useNavigate()
  const [orders, setOrders] = useState([])
  const [kliens, setKliens] = useState([])
  const [layanan, setLayanan] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState({ status: '', search: '' })

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [oRes, kRes, lRes] = await Promise.all([
      supabase.from('v_orders').select('*'),
      supabase.from('klien').select('id, nama').order('nama'),
      supabase.from('jenis_layanan').select('id, nama').order('nama'),
    ])
    if (oRes.data) setOrders(oRes.data)
    if (kRes.data) setKliens(kRes.data)
    if (lRes.data) setLayanan(lRes.data)
    setLoading(false)
  }

  function openAdd() { setForm(EMPTY_FORM); setModal('add') }
  function openEdit(o) {
    setSelected(o)
    setForm({ klien_id: o.klien_id ?? '', layanan_id: o.layanan_id ?? '', tanggal_masuk: o.tanggal_masuk ?? '', tanggal_selesai: o.tanggal_selesai ?? '', status: o.status, catatan: o.catatan ?? '', biaya: o.biaya ?? '' })
    setModal('edit')
  }
  function closeModal() { setModal(null); setSelected(null) }
  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    if (!form.klien_id || !form.layanan_id || !form.tanggal_masuk) { toast('Klien, layanan, dan tanggal masuk wajib diisi.', 'error'); return }
    setSaving(true)
    const payload = { klien_id: Number(form.klien_id), layanan_id: Number(form.layanan_id), tanggal_masuk: form.tanggal_masuk, tanggal_selesai: form.tanggal_selesai || null, status: form.status, catatan: form.catatan || null, biaya: form.biaya ? Number(form.biaya) : 0 }
    let err
    if (modal === 'add') { ;({ error: err } = await supabase.from('orders').insert({ ...payload, nomor_order: '' })) }
    else { ;({ error: err } = await supabase.from('orders').update(payload).eq('id', selected.id)) }
    setSaving(false)
    if (err) { toast('Gagal menyimpan: ' + err.message, 'error'); return }
    toast(modal === 'add' ? 'Order berhasil ditambahkan!' : 'Order berhasil diperbarui!', 'success')
    closeModal(); fetchAll()
  }

  async function handleDelete(id) {
    if (!confirm('Hapus order ini?')) return
    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (error) { toast('Gagal menghapus.', 'error'); return }
    toast('Order dihapus.', 'success'); fetchAll()
  }

  async function quickStatus(id, status) {
    const payload = { status }
    if (status === 'selesai') payload.tanggal_selesai = new Date().toISOString().split('T')[0]
    const { error } = await supabase.from('orders').update(payload).eq('id', id)
    if (error) { toast('Gagal update status.', 'error'); return }
    toast('Status diperbarui!', 'success'); fetchAll()
  }

  const filtered = orders.filter(o => {
    if (filter.status && o.status !== filter.status) return false
    if (filter.search) {
      const q = filter.search.toLowerCase()
      return (o.klien_nama ?? '').toLowerCase().includes(q) || (o.nomor_order ?? '').toLowerCase().includes(q) || (o.layanan_nama ?? '').toLowerCase().includes(q)
    }
    return true
  })

  if (loading) return <Spinner />

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Penerimaan Order</h2>
          <p>{orders.length} total order terdaftar</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M12 4v16m8-8H4"/></svg>
          Tambah Order
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-wrap" style={{ flex: 1, maxWidth: 280 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input placeholder="Cari klien / nomor order..." value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))} />
        </div>
        <select style={{ width: 170 }} value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
          <option value="">Semua status</option>
          {STATUS_LIST.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        {(filter.search || filter.status) && <button className="btn btn-sm" onClick={() => setFilter({ status: '', search: '' })}>Reset</button>}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>No. Order</th><th>Klien</th><th>Layanan</th><th>Tgl Masuk</th><th>Tgl Selesai</th><th>Biaya</th><th>Status</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={8}><EmptyState msg="Tidak ada order ditemukan." /></td></tr>
                : filtered.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => nav(`/order/${o.id}`)}>{o.nomor_order}</td>
                    <td style={{ fontWeight: 500 }}>{o.klien_nama ?? '—'}</td>
                    <td style={{ color: 'var(--text-sm)' }}>{o.layanan_nama ?? '—'}</td>
                    <td style={{ color: 'var(--text-xs)' }}>{formatDate(o.tanggal_masuk)}</td>
                    <td style={{ color: 'var(--text-xs)' }}>{formatDate(o.tanggal_selesai)}</td>
                    <td style={{ fontWeight: 500 }}>{formatRp(o.biaya)}</td>
                    <td><Badge status={o.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button className="btn btn-sm" onClick={() => nav(`/order/${o.id}`)}>Detail</button>
                        <button className="btn btn-sm" onClick={() => openEdit(o)}>Edit</button>
                        {o.status === 'menunggu' && <button className="btn btn-sm" style={{ color: 'var(--warn)', borderColor: 'rgba(245,158,11,.3)' }} onClick={() => quickStatus(o.id, 'diproses')}>Proses</button>}
                        {o.status === 'diproses' && <button className="btn btn-sm" style={{ color: 'var(--success)', borderColor: 'rgba(34,197,94,.3)' }} onClick={() => quickStatus(o.id, 'selesai')}>Selesai</button>}
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(o.id)}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Tambah Order Baru' : 'Edit Order'} onClose={closeModal}
          footer={<><button className="btn" onClick={closeModal}>Batal</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button></>}>
          <div className="form-grid">
            <div className="form-group"><label>Klien *</label><select value={form.klien_id} onChange={e => setField('klien_id', e.target.value)}><option value="">— Pilih klien —</option>{kliens.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}</select></div>
            <div className="form-group"><label>Jenis Layanan *</label><select value={form.layanan_id} onChange={e => setField('layanan_id', e.target.value)}><option value="">— Pilih layanan —</option>{layanan.map(l => <option key={l.id} value={l.id}>{l.nama}</option>)}</select></div>
            <div className="form-group"><label>Tanggal Masuk *</label><input type="date" value={form.tanggal_masuk} onChange={e => setField('tanggal_masuk', e.target.value)} /></div>
            <div className="form-group"><label>Tanggal Selesai</label><input type="date" value={form.tanggal_selesai} onChange={e => setField('tanggal_selesai', e.target.value)} /></div>
            <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setField('status', e.target.value)}>{STATUS_LIST.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}</select></div>
            <div className="form-group"><label>Biaya (Rp)</label><input type="number" min="0" value={form.biaya} onChange={e => setField('biaya', e.target.value)} placeholder="0" /></div>
            <div className="form-group full"><label>Catatan</label><textarea value={form.catatan} onChange={e => setField('catatan', e.target.value)} placeholder="Keterangan tambahan..." /></div>
          </div>
        </Modal>
      )}
    </div>
  )
}
