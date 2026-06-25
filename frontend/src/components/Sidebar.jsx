import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getUserRole, logout } from '../hooks/Auth'

// Nav items per role — only show what's relevant to that user
const NAV_ITEMS = {
  ROLE_ADMIN: [
    { label: 'Overview',     to: '/dashboard',              icon: GridIcon     },
    { label: 'Applications', to: '/dashboard/applications', icon: ClipboardIcon },
    { label: 'Users',        to: '/dashboard/users',        icon: UsersIcon    },
  ],
  ROLE_PARENT: [
    { label: 'My Dashboard',   to: '/dashboard',               icon: GridIcon      },
    { label: 'Applications',   to: '/dashboard/applications',  icon: ClipboardIcon },
    { label: 'New Application',to: '/dashboard/apply',         icon: PlusIcon      },
    { label: 'Child Info',     to: '/dashboard/child',         icon: UserIcon      },
  ],
}

export default function Sidebar({ isDark, toggle }) {
  const location = useLocation()
  const navigate  = useNavigate()
  const role      = getUserRole()

  // Collapsed state — on mobile the sidebar starts hidden
  const [collapsed, setCollapsed] = useState(false)

  const navItems = NAV_ITEMS[role] ?? []

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className={`
        fixed top-0 left-0 h-full z-40 flex flex-col
        bg-white dark:bg-dark-surface
        border-r border-light-border dark:border-dark-border
        transition-all duration-300
        ${collapsed ? 'w-16' : 'w-60'}
      `}>

        {/* Logo + collapse toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-light-border dark:border-dark-border flex-shrink-0">
          {!collapsed && (
            <Link to="/dashboard" className="flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm-7 9.99L12 17l7-4.01V14l-7 4-7-4v-1.01z"/>
              </svg>
              <span className="font-bold text-light-text dark:text-dark-text text-sm tracking-tight">
                SchoolApply
              </span>
            </Link>
          )}
          {collapsed && (
            <svg className="w-6 h-6 text-blue-600 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm-7 9.99L12 17l7-4.01V14l-7 4-7-4v-1.01z"/>
            </svg>
          )}

          {/* Collapse / expand button */}
          <button
            onClick={() => setCollapsed(p => !p)}
            className={`
              w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
              text-light-muted dark:text-dark-muted
              hover:bg-light-bg dark:hover:bg-dark-bg transition-colors
              ${collapsed ? 'mx-auto' : ''}
            `}
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </button>
        </div>

        {/* Role badge */}
        {!collapsed && (
          <div className="px-4 pt-4 pb-2">
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              {role === 'ROLE_ADMIN' ? 'Administrator' : 'Parent'}
            </span>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            // Highlight the active route
            const isActive = location.pathname === item.to
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-colors group
                  ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-light-muted dark:text-dark-muted hover:bg-light-bg dark:hover:bg-dark-bg hover:text-light-text dark:hover:text-dark-text'
                  }
                `}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-light-muted dark:text-dark-muted group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom: dark mode toggle + logout */}
        <div className="px-3 pb-4 space-y-1 border-t border-light-border dark:border-dark-border pt-3 flex-shrink-0">

          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              text-light-muted dark:text-dark-muted
              hover:bg-light-bg dark:hover:bg-dark-bg
              hover:text-light-text dark:hover:text-dark-text
              transition-colors
            "
            title={collapsed ? (isDark ? 'Light mode' : 'Dark mode') : undefined}
          >
            {isDark
              ? <SunIcon className="w-5 h-5 flex-shrink-0" />
              : <MoonIcon className="w-5 h-5 flex-shrink-0" />
            }
            {!collapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              text-light-muted dark:text-dark-muted
              hover:bg-red-50 dark:hover:bg-red-900/20
              hover:text-red-500 dark:hover:text-red-400
              transition-colors
            "
            title={collapsed ? 'Log out' : undefined}
          >
            <LogoutIcon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Spacer so main content doesn't hide under the sidebar */}
      <div className={`flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`} />
    </>
  )
}

// ── Inline SVG icon components ───────────────────────────────────
// Kept inline to avoid extra dependencies — just pass className as a prop.

function GridIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  )
}

function ClipboardIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  )
}

function UsersIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  )
}

function UserIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  )
}

function SunIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z"
      />
    </svg>
  )
}

function MoonIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  )
}

function LogoutIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

function PlusIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}