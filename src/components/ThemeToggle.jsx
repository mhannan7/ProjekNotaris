import { useTheme } from '../hooks/useTheme'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      title={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
      style={{
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: 99,
        width: 52, height: 28,
        cursor: 'pointer',
        position: 'relative',
        transition: 'background .3s, border-color .3s',
        flexShrink: 0,
      }}
      aria-label="Toggle tema"
    >
      {/* Track icons */}
      <span style={{
        position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)',
        fontSize: 11, lineHeight: 1, transition: 'opacity .2s',
        opacity: isDark ? 0 : 1,
      }}>☀️</span>
      <span style={{
        position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
        fontSize: 11, lineHeight: 1, transition: 'opacity .2s',
        opacity: isDark ? 1 : 0,
      }}>🌙</span>
      {/* Thumb */}
      <span style={{
        position: 'absolute',
        top: 3, left: isDark ? 27 : 3,
        width: 22, height: 22,
        borderRadius: '50%',
        background: isDark ? 'var(--accent)' : 'var(--gold)',
        boxShadow: isDark ? '0 2px 8px rgba(79,126,255,.5)' : '0 2px 8px rgba(240,180,41,.5)',
        transition: 'left .25s cubic-bezier(.34,1.56,.64,1), background .3s, box-shadow .3s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10,
      }}>
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  )
}
