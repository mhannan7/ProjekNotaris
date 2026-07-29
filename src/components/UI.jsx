export function Spinner() {
  return (
    <div className="loading-wrap">
      <div className="spinner" />
      <span>Memuat data...</span>
    </div>
  )
}

export function Badge({ status }) {
  const map = {
    menunggu: ['badge badge-menunggu', '◌ Menunggu'],
    diproses: ['badge badge-diproses', '◐ Diproses'],
    selesai: ['badge badge-selesai', '● Selesai'],
    batal: ['badge badge-batal', '✕ Batal'],
  }
  const [cls, label] = map[status] ?? ['badge', status]
  return <span className={cls}>{label}</span>
}

export function EmptyState({ msg = 'Belum ada data.' }) {
  return (
    <div className="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
      {msg}
    </div>
  )
}

export function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="btn btn-sm" onClick={onClose} aria-label="Tutup">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

export function formatRp(val) {
  if (!val && val !== 0) return '—'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)
}

export function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}
