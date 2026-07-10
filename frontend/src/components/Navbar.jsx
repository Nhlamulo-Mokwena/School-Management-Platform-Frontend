import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Navbar({ isDark, toggle }) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleScrollLink = (id) => {
    if (location.pathname !== '/') {
      // On a different page — navigate home first, then scroll after load
      navigate('/')
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      // Already on home — just scroll
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className="
      fixed top-0 left-0 right-0 z-50
      bg-white dark:bg-dark-elevated
      border-b border-light-border dark:border-dark-border
      shadow-sm
    ">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <svg className="w-7 h-7 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm-7 9.99L12 17l7-4.01V14l-7 4-7-4v-1.01z"/>
          </svg>
          <span className="text-light-text dark:text-dark-text font-bold text-lg tracking-tight">
            SchoolApply
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-light-muted dark:text-dark-muted hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-colors"
          >
            Home
          </Link>
          <Link
            to="/news"
            className="text-light-muted dark:text-dark-muted hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-colors"
          >
            News
          </Link>
          {[
            { label: 'How It Works', id: 'how-it-works' },
            { label: 'About',        id: 'about'        },
          ].map(link => (
            <button
              key={link.id}
              onClick={() => handleScrollLink(link.id)}
              className="text-light-muted dark:text-dark-muted hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-colors bg-transparent border-0 cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">

          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="
              w-9 h-9 rounded-full flex items-center justify-center
              bg-blue-50 dark:bg-dark-surface
              text-blue-600 dark:text-blue-400
              hover:bg-blue-100 dark:hover:bg-dark-border
              transition-colors
            "
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z"
                />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          {/* Register */}
          <Link
            to="/register"
            className="
              hidden sm:block px-4 py-2 rounded-lg text-sm font-semibold
              border border-blue-600 dark:border-blue-500
              text-blue-600 dark:text-blue-400
              hover:bg-blue-50 dark:hover:bg-blue-900/20
              transition-colors
            "
          >
            Register
          </Link>

          {/* Login */}
          <Link
            to="/login"
            className="
              px-4 py-2 rounded-lg text-sm font-semibold
              bg-blue-600 hover:bg-blue-700
              text-white transition-colors
            "
          >
            Log In
          </Link>
        </div>
      </div>
    </nav>
  )
}