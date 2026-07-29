import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Spinner, EmptyState, Modal, formatDate } from '../components/UI'
import { useToast } from '../hooks/useToast'

const EMPTY = { nama: '', nik: '', telepon: '', email: '', alamat: '' }

function InitialAvatar({ name }) {
  const init = (name || '?').charAt(0).toUpperCase()
  const colors = ['#4F7EFF','#7B61FF','#F0B429','#22C55E','#EF4444','#06B6D4']
  const color = colors[name?.charCodeAt(0) % colors.length] ?? colors[0]
  return (
    <div style={{
      width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
      background: color + '22', color, border: `1px solid ${color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: 13,
    }}>{init}</div>
  )
}

export default function KlienPage() {
  const toast = useToast()
  const [kliens, setKliens] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('klien').select('*').order('created_at', { ascending: false })
    if (data) setKliens(data)
    setLoading(false)
  }

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }
  function openAdd() { setForm(EMPTY); setModal('add') }
  function openEdit(k) { setSelected(k); setForm({ nama: k.nama, nik: k.nik ?? '', telepon: k.telepon ?? '', email: k.email ?? '', alamat: k.alamat ?? '' }); setModal('edit') }
  function openDetail(k) { setSelected(k); setModal('detail') }
  function close() { setModal(null); setSelected(null) }

  async function handleSave() {
    if (!form.nama.trim()) { toast('Nama wajib diisi.', 'error'); return }
    setSaving(true)
    const payload = { nama: form.nama, nik: form.nik || null, telepon: form.telepon || null, email: form.email || null, alamat: form.alamat || null }
    let err
    if (modal === 'add') {
      ;({ error: err } = await supabase.from('klien').insert(payload))
    } else {
      ;({ error: err } = await supabase.from('klien').update(payload).eq('id', selected.id))
    }
    setSaving(false)
    if (err) { toast('Gagal: ' + err.message, 'error'); return }
    toast(modal === 'add' ? 'Klien ditambahkan!' : 'Data klien diperbarui!', 'success')
    close(); load()
  }

  async function handleDelete(id) {
    if (!confirm('Hapus data klien ini? Order terkait tidak akan terhapus.')) return
    const { error } = await supabase.from('klien').delete().eq('id', id)
    if (error) { toast('Gagal menghapus.', 'error'); return }
    toast('Klien dihapus.', 'success'); load()
  }

  const filtered = kliens.filter(k =>
    !search || k.nama.toLowerCase().includes(search.toLowerCase()) ||
    (k.telepon ?? '').includes(search) || (k.nik ?? '').includes(search)
  )

  if (loading) return <Spinner />

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Data Klien</h2>
          <p>{kliens.length} klien terdaftar</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" d="M12 4v16m8-8H4"/>
          </svg>
          Tambah Klien
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-wrap" style={{ flex: 1, maxWidth: 300 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input placeholder="Cari nama / NIK / telepon..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Klien</th><th>NIK</th><th>Telepon</th><th>Email</th>
                <th>Terdaftar</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6}><EmptyState msg="Belum ada klien terdaftar." /></td></tr>
              ) : filtered.map(k => (
                <tr key={k.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <InitialAvatar name={k.nama} />
                      <span style={{ fontWeight: 500 }}>{k.nama}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-xs)' }}>{k.nik ?? '—'}</td>
                  <td style={{ color: 'var(--text-sm)' }}>{k.telepon ?? '—'}</td>
                  <td style={{ color: 'var(--text-sm)' }}>{k.email ?? '—'}</td>
                  <td style={{ color: 'var(--text-xs)' }}>{formatDate(k.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button className="btn btn-sm" onClick={() => openDetail(k)}>Detail</button>
                      <button className="btn btn-sm" onClick={() => openEdit(k)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(k.id)}>Hapus</button>
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
          title={modal === 'add' ? 'Tambah Klien Baru' : 'Edit Data Klien'}
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
              <label>Nama Lengkap *</label>
              <input value={form.nama} onChange={e => setField('nama', e.target.value)} placeholder="Nama sesuai KTP" />
            </div>
            <div className="form-group">
              <label>NIK</label>
              <input value={form.nik} onChange={e => setField('nik', e.target.value)} placeholder="16 digit" maxLength={16} />
            </div>
            <div className="form-group">
              <label>No. Telepon</label>
              <input value={form.telepon} onChange={e => setField('telepon', e.target.value)} placeholder="08xxxxxxxxxx" />
            </div>
            <div className="form-group full">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="email@contoh.com" />
            </div>
            <div className="form-group full">
              <label>Alamat</label>
              <textarea value={form.alamat} onChange={e => setField('alamat', e.target.value)} placeholder="Alamat lengkap..." />
            </div>
          </div>
        </Modal>
      )}

      {modal === 'detail' && selected && (
        <Modal title="Detail Klien" onClose={close} footer={<button className="btn" onClick={close}>Tutup</button>}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, padding: '16px', background: 'var(--bg2)', borderRadius: 12 }}>
            <InitialAvatar name={selected.nama} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{selected.nama}</div>
              <div style={{ fontSize: 12, color: 'var(--text-xs)', marginTop: 2 }}>Terdaftar {formatDate(selected.created_at)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {[
              ['NIK', selected.nik ?? '—'],
              ['Telepon', selected.telepon ?? '—'],
              ['Email', selected.email ?? '—'],
              ['Alamat', selected.alamat ?? '—'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: 14, fontSize: 13, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--text-xs)', width: 80, flexShrink: 0, paddingTop: 2 }}>{k}</span>
                <span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  )
}
