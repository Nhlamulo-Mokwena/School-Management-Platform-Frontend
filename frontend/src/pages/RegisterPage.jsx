import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export default function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',        // "PARENT", "TEACHER", or "ADMIN"
                     // the backend adds the "ROLE_" prefix on its side
  })

  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.fullName)                            e.fullName        = 'Full name is required'
    if (!form.email)                               e.email           = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email))     e.email           = 'Enter a valid email'
    if (!form.password)                            e.password        = 'Password is required'
    else if (form.password.length < 8)             e.password        = 'Password must be at least 8 characters'
    if (!form.confirmPassword)                     e.confirmPassword = 'Please confirm your password'
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (!form.role)                                e.role            = 'Please select your role'
    return e
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
      // TODO: replace with your actual API call
      const res = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          role: form.role,   // sends "PARENT" — backend prefixes "ROLE_"
        }),
      })
      if (!res.ok) throw new Error()
        
      toast.success('User account successfully registered!');
      await new Promise(r => setTimeout(r, 1000))
      navigate('/login')
    } catch (err) {
      setErrors({ general: 'Registration failed. Please try again.' })
      console.log(err);
      toast.error('failed to register user!');
    } finally {
      setLoading(false)
    }
  }

  // Reusable input class builder — applies red border on error, normal border otherwise
  const inputClass = (field) => `
    w-full px-4 py-2.5 rounded-lg text-sm
    bg-light-bg dark:bg-dark-bg
    text-light-text dark:text-dark-text
    border transition-colors outline-none
    placeholder:text-light-muted dark:placeholder:text-dark-muted
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${errors[field]
      ? 'border-red-400 dark:border-red-600'
      : 'border-light-border dark:border-dark-border'
    }
  `

  return (
    <div className="min-h-screen pt-16 bg-light-bg dark:bg-dark-bg flex items-center justify-center px-4 py-12">

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
              Create your account
            </h1>
            <p className="text-light-muted dark:text-dark-muted text-sm mt-1">
              Join SchoolApply and start your applications
            </p>
          </div>

          {/* General error */}
          {errors.general && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400 text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Full name */}
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
                Full name
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Nhlamulo Mokwena"
                className={inputClass('fullName')}
              />
              {errors.fullName && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
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
                className={inputClass('email')}
              />
              {errors.email && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
                I am a...
              </label>
              {/* Three role buttons — acts like a toggle group */}
              <div className="grid grid-cols-3 gap-2">
                {['PARENT', 'TEACHER', 'ADMIN'].map(r => (
                  <button
                    key={r}
                    type="button"   // prevent form submission on click
                    onClick={() => {
                      setForm(prev => ({ ...prev, role: r }))
                      setErrors(prev => ({ ...prev, role: '' }))
                    }}
                    className={`
                      py-2.5 rounded-lg text-sm font-medium border transition-colors
                      ${form.role === r
                        // Selected state — filled blue
                        ? 'bg-blue-600 border-blue-600 text-white'
                        // Unselected state
                        : 'bg-light-bg dark:bg-dark-bg border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'
                      }
                    `}
                  >
                    {r.charAt(0) + r.slice(1).toLowerCase()} {/* "PARENT" → "Parent" */}
                  </button>
                ))}
              </div>
              {errors.role && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.role}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                className={inputClass('password')}
              />
              {errors.password && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
                Confirm password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={inputClass('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit */}
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
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              )}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-light-border dark:bg-dark-border" />
            <span className="text-xs text-light-muted dark:text-dark-muted">or</span>
            <div className="flex-1 h-px bg-light-border dark:bg-dark-border" />
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-light-muted dark:text-dark-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}