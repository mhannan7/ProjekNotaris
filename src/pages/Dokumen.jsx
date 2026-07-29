import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Spinner, EmptyState, Modal, formatDate } from '../components/UI'
import { useToast } from '../hooks/useToast'

const EMPTY = { order_id: '', nama_file: '', keterangan: '', status_dok: 'belum_lengkap' }

export default function DokumenPage() {
  const toast = useToast()
  const [docs, setDocs] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [dRes, oRes] = await Promise.all([
      supabase.from('dokumen').select(`*, orders(nomor_order, klien:klien(nama))`).order('created_at', { ascending: false }),
      supabase.from('orders').select('id, nomor_order').order('created_at', { ascending: false }),
    ])
    if (dRes.data) setDocs(dRes.data)
    if (oRes.data) setOrders(oRes.data)
    setLoading(false)
  }

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }
  function openAdd() { setForm(EMPTY); setModal('add') }
  function openEdit(d) { setSelected(d); setForm({ order_id: d.order_id ?? '', nama_file: d.nama_file, keterangan: d.keterangan ?? '', status_dok: d.status_dok }); setModal('edit') }
  function close() { setModal(null); setSelected(null) }

  async function handleSave() {
    if (!form.nama_file.trim() || !form.order_id) { toast('Order dan nama dokumen wajib diisi.', 'error'); return }
    setSaving(true)
    const payload = { order_id: Number(form.order_id), nama_file: form.nama_file, keterangan: form.keterangan || null, status_dok: form.status_dok }
    let err
    if (modal === 'add') {
      ;({ error: err } = await supabase.from('dokumen').insert(payload))
    } else {
      ;({ error: err } = await supabase.from('dokumen').update(payload).eq('id', selected.id))
    }
    setSaving(false)
    if (err) { toast('Gagal: ' + err.message, 'error'); return }
    toast('Dokumen disimpan!', 'success'); close(); fetchAll()
  }

  async function handleDelete(id) {
    if (!confirm('Hapus dokumen ini?')) return
    const { error } = await supabase.from('dokumen').delete().eq('id', id)
    if (error) { toast('Gagal menghapus.', 'error'); return }
    toast('Dokumen dihapus.', 'success'); fetchAll()
  }

  async function toggleStatus(d) {
    const next = d.status_dok === 'lengkap' ? 'belum_lengkap' : 'lengkap'
    const { error } = await supabase.from('dokumen').update({ status_dok: next }).eq('id', d.id)
    if (error) { toast('Gagal update.', 'error'); return }
    toast('Status dokumen diperbarui!', 'success'); fetchAll()
  }

  const filtered = docs.filter(d => !filterStatus || d.status_dok === filterStatus)

  if (loading) return <Spinner />

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Dokumen</h2>
          <p style={{ color: 'var(--text-sm)', fontSize: 13, marginTop: 2 }}>{docs.length} dokumen tercatat</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M12 4v16m8-8H4"/></svg>
          Tambah Dokumen
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <select style={{ width: 200 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Semua status</option>
          <option value="belum_lengkap">Belum Lengkap</option>
          <option value="lengkap">Lengkap</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>No. Order</th>
                <th>Klien</th>
                <th>Nama Dokumen</th>
                <th>Keterangan</th>
                <th>Status</th>
                <th>Tgl Dibuat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}><EmptyState msg="Belum ada dokumen." /></td></tr>
              ) : filtered.map(d => (
                <tr key={d.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{d.orders?.nomor_order ?? '—'}</td>
                  <td>{d.orders?.klien?.nama ?? '—'}</td>
                  <td style={{ fontWeight: 500 }}>{d.nama_file}</td>
                  <td style={{ color: 'var(--text-sm)' }}>{d.keterangan ?? '—'}</td>
                  <td>
                    <span className={`badge ${d.status_dok === 'lengkap' ? 'badge-selesai' : 'badge-menunggu'}`}>
                      {d.status_dok === 'lengkap' ? '● Lengkap' : '● Belum Lengkap'}
                    </span>
                  </td>
                  <td>{formatDate(d.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-sm" onClick={() => toggleStatus(d)}>
                        {d.status_dok === 'lengkap' ? 'Batal' : 'Lengkap'}
                      </button>
                      <button className="btn btn-sm" onClick={() => openEdit(d)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(d.id)}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <Modal
          title={modal === 'add' ? 'Tambah Dokumen' : 'Edit Dokumen'}
          onClose={close}
          footer={<>
            <button className="btn" onClick={close}>Batal</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </>}
        >
          <div className="form-grid">
            <div className="form-group full">
              <label>Order *</label>
              <select value={form.order_id} onChange={e => setField('order_id', e.target.value)}>
                <option value="">-- Pilih nomor order --</option>
                {orders.map(o => <option key={o.id} value={o.id}>{o.nomor_order}</option>)}
              </select>
            </div>
            <div className="form-group full">
              <label>Nama Dokumen *</label>
              <input value={form.nama_file} onChange={e => setField('nama_file', e.target.value)} placeholder="Contoh: KTP, NPWP, SHM..." />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status_dok} onChange={e => setField('status_dok', e.target.value)}>
                <option value="belum_lengkap">Belum Lengkap</option>
                <option value="lengkap">Lengkap</option>
              </select>
            </div>
            <div className="form-group full">
              <label>Keterangan</label>
              <textarea value={form.keterangan} onChange={e => setField('keterangan', e.target.value)} placeholder="Catatan tambahan..." />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
