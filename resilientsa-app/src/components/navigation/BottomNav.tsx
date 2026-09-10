import { NavLink, useLocation } from 'react-router-dom'

interface NavItem {
  key: string
  label: string
  icon: string
  to: string
  match: (pathname: string) => boolean
}

const ITEMS: NavItem[] = [
  { key: 'exchange', label: 'Exchange', icon: '🏠', to: '/trade', match: (p) => p.startsWith('/trade') },
  { key: 'support', label: 'Get support', icon: '🤝', to: '/support', match: (p) => p.startsWith('/support') },
  { key: 'steward', label: 'Steward', icon: '👥', to: '/steward', match: (p) => p.startsWith('/steward') },
]

// Primary app navigation. Icon + label per destination, active item in
// Fynbos Aloe — mirrors design/prototype-v1/components/navigation/BottomNav.jsx,
// rebuilt for React Router (NavLink for real navigation, not a tab index state)
// and the emoji-icon convention already used in PillarFilterRow.tsx.
export default function BottomNav() {
  const location = useLocation()

  return (
    <nav
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${ITEMS.length}, 1fr)`,
        background: 'var(--surface-card, #FBFBF9)',
        borderTop: '1px solid var(--border-hairline, #E5E1DA)',
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
        flexShrink: 0,
      }}
    >
      {ITEMS.map((item) => {
        const on = item.match(location.pathname)
        return (
          <NavLink
            key={item.key}
            to={item.to}
            aria-current={on ? 'page' : undefined}
            aria-label={item.label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '8px 4px 12px',
              minHeight: 58,
              border: 'none',
              background: 'transparent',
              textDecoration: 'none',
              color: on ? 'var(--action-primary, #4C7A3F)' : 'var(--text-muted, #8A847A)',
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>{item.icon}</span>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                fontWeight: on ? 600 : 500,
              }}
            >
              {item.label}
            </span>
          </NavLink>
        )
      })}
    </nav>
  )
}
