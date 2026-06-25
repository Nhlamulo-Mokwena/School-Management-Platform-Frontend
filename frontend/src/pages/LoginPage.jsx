import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { decodeToken } from '../hooks/Auth'

export default function Login() {
  const navigate = useNavigate()

  // Form field values
  const [form, setForm] = useState({ email: '', password: '' })

  // Field-level error messages shown under each input
  const [errors, setErrors] = useState({})

  // Controls the loading spinner on the button while the API call runs
  const [loading, setLoading] = useState(false)

  // Updates a single field in form state without overwriting the others
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    // Clear the error for this field as soon as the user starts typing
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  // Basic client-side validation before hitting the API
  const validate = () => {
    const newErrors = {}
    if (!form.email)                          newErrors.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email  = 'Enter a valid email'
    if (!form.password)                        newErrors.password = 'Password is required'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      // Call the Spring Boot login endpoint
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })

      // If the server returns 401, credentials are wrong
      if (!res.ok) {
        setErrors({ general: 'Invalid email or password. Please try again.' })
        return
      }

      const data = await res.json()

      // Save the JWT to localStorage — auth.js reads it on every page load
      localStorage.setItem('token', data.token)

      // Decode the token to read the role without an extra API call.
      // Then redirect the user to the right dashboard.
      const decoded = decodeToken(data.token)
      const authorities = decoded?.authorities

      // Spring returns authorities as [{ authority: "ROLE_ADMIN" }] or ["ROLE_ADMIN"]
      const role = Array.isArray(authorities)
        ? (authorities[0]?.authority ?? authorities[0])
        : null

      // All roles go to /dashboard — Dashboard.jsx decides what to render
      navigate('/dashboard')

    } catch (err) {
      // Network error or server is down
      setErrors({ general: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    // Full-page centered layout — no navbar overlap needed on auth pages
    // but pt-16 accounts for the fixed navbar
    <div className="min-h-screen pt-16 bg-light-bg dark:bg-dark-bg flex items-center justify-center px-4">

      {/* Subtle background glow matching the home page */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-blue-500/5 dark:bg-blue-900/20 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">

        {/* Card */}
        <div className="
          bg-light-surface dark:bg-dark-surface
          border border-light-border dark:border-dark-border
          rounded-2xl shadow-lg p-8
        ">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm-7 9.99L12 17l7-4.01V14l-7 4-7-4v-1.01z"/>
              </svg>
            </div>
            <h1 className="font-display text-2xl font-bold text-light-text dark:text-dark-text">
              Welcome back
            </h1>
            <p className="text-light-muted dark:text-dark-muted text-sm mt-1">
              Sign in to your SchoolApply account
            </p>
          </div>

          {/* General error (e.g. wrong credentials from API) */}
          {errors.general && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`
                  w-full px-4 py-2.5 rounded-lg text-sm
                  bg-light-bg dark:bg-dark-bg
                  text-light-text dark:text-dark-text
                  border transition-colors outline-none
                  placeholder:text-light-muted dark:placeholder:text-dark-muted
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.email
                    ? 'border-red-400 dark:border-red-600'
                    : 'border-light-border dark:border-dark-border'
                  }
                `}
              />
              {/* Show field error if present */}
              {errors.email && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-light-text dark:text-dark-text">
                  Password
                </label>
                <a href="#" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`
                  w-full px-4 py-2.5 rounded-lg text-sm
                  bg-light-bg dark:bg-dark-bg
                  text-light-text dark:text-dark-text
                  border transition-colors outline-none
                  placeholder:text-light-muted dark:placeholder:text-dark-muted
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.password
                    ? 'border-red-400 dark:border-red-600'
                    : 'border-light-border dark:border-dark-border'
                  }
                `}
              />
              {errors.password && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-2.5 rounded-lg font-semibold text-sm text-white
                bg-blue-600 hover:bg-blue-700
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-colors flex items-center justify-center gap-2
              "
            >
              {loading && (
                // Spinner shown while API call is in progress
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              )}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-light-border dark:bg-dark-border" />
            <span className="text-xs text-light-muted dark:text-dark-muted">or</span>
            <div className="flex-1 h-px bg-light-border dark:bg-dark-border" />
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-light-muted dark:text-dark-muted">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}