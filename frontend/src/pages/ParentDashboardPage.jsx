import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentUser } from '../hooks/Auth'
import {
  FiUser, FiBookOpen, FiCheckCircle, FiClock, FiXCircle,
  FiFileText, FiPlus, FiAlertCircle
} from 'react-icons/fi'

const STATUS_MAP = {
  PENDING:      { label: 'Pending',      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'         },
  ACCEPTED:     { label: 'Accepted',     color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'     },
  DECLINED:     { label: 'Declined',     color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'             },
}

export default function ParentDashboard() {
  const user = getCurrentUser()

  const [applications, setApplications] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)

  // ── Fetch applications from the backend on mount ──────────────
  // GET /api/applications/my — returns only the logged-in parent's applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token')
        const res   = await fetch('http://localhost:8080/api/applications/my', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error('Failed to load applications')

        const data = await res.json()

        // Map backend field names to what the UI expects
        const mapped = data.map(app => ({
          id:        app.id,
          school:    app.schoolName,
          grade:     app.gradeApplying,
          submitted: app.submittedAt ? app.submittedAt.split('T')[0] : '—',
          status:    app.status,
          refNumber: app.referenceNumber,
        }))

        setApplications(mapped)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])

  const stats = [
    {
      label: 'Total Applied',
      value: applications.length,
      icon:  <FiFileText className="w-5 h-5" />,
      color: 'text-blue-600 dark:text-blue-400',
      bg:    'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Accepted',
      value: applications.filter(a => a.status === 'ACCEPTED').length,
      icon:  <FiCheckCircle className="w-5 h-5" />,
      color: 'text-green-600 dark:text-green-400',
      bg:    'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Under Review',
      value: applications.filter(a => a.status === 'UNDER_REVIEW').length,
      icon:  <FiClock className="w-5 h-5" />,
      color: 'text-blue-600 dark:text-blue-400',
      bg:    'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Declined',
      value: applications.filter(a => a.status === 'DECLINED').length,
      icon:  <FiXCircle className="w-5 h-5" />,
      color: 'text-red-600 dark:text-red-400',
      bg:    'bg-red-50 dark:bg-red-900/20',
    },
  ]

  return (
    <div className="min-h-full bg-light-bg dark:bg-dark-bg">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* ── Header ── */}
        <div className="mb-8">
          <p className="text-light-muted dark:text-dark-muted text-sm">Welcome back,</p>
          <h1 className="font-display text-2xl font-bold text-light-text dark:text-dark-text">
            {user?.sub ?? 'Parent'}
          </h1>
        </div>

        {/* ── Stats strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(stat => (
            <div
              key={stat.label}
              className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-light-muted dark:text-dark-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* ── Left column ── */}
          <div className="md:col-span-1 space-y-4">

            {/* Profile card */}
            <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6">
              <h2 className="font-semibold text-light-text dark:text-dark-text mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <FiUser className="w-4 h-4" />
                </span>
                My Account
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-light-muted dark:text-dark-muted">Email</p>
                  <p className="text-sm font-medium text-light-text dark:text-dark-text mt-0.5 truncate">
                    {user?.sub ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-light-muted dark:text-dark-muted">Role</p>
                  <p className="text-sm font-medium text-light-text dark:text-dark-text mt-0.5">Parent</p>
                </div>
              </div>

              <Link
                to="/dashboard/child"
                className="mt-5 w-full py-2 rounded-lg text-xs font-semibold border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-1.5"
              >
                <FiUser className="w-3.5 h-3.5" />
                Manage Children
              </Link>
            </div>

            {/* Quick action */}
            <div className="bg-blue-600 dark:bg-blue-700 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-1">
                <FiPlus className="w-4 h-4" />
                <p className="font-semibold">New Application</p>
              </div>
              <p className="text-blue-100 text-xs mb-4">
                Submit a new school application for your child.
              </p>
              <Link
                to="/dashboard/apply"
                className="block w-full py-2 rounded-lg text-xs font-semibold text-center bg-white text-blue-600 hover:bg-blue-50 transition-colors"
              >
                Start Application
              </Link>
            </div>
          </div>

          {/* ── Applications list ── */}
          <div className="md:col-span-2">
            <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-light-text dark:text-dark-text flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <FiBookOpen className="w-4 h-4" />
                  </span>
                  Recent Applications
                </h2>
                <Link
                  to="/dashboard/applications"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  View all →
                </Link>
              </div>

              {/* Loading state */}
              {loading && (
                <div className="flex items-center justify-center py-10 gap-2 text-light-muted dark:text-dark-muted">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  <span className="text-sm">Loading...</span>
                </div>
              )}

              {/* Error state */}
              {!loading && error && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <FiAlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Empty state */}
              {!loading && !error && applications.length === 0 && (
                <div className="text-center py-10">
                  <FiFileText className="w-8 h-8 text-light-muted dark:text-dark-muted mx-auto mb-3" />
                  <p className="text-sm text-light-muted dark:text-dark-muted mb-3">No applications yet.</p>
                  <Link
                    to="/dashboard/apply"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Submit your first application →
                  </Link>
                </div>
              )}

              {/* Applications list — show latest 4 */}
              {!loading && !error && applications.length > 0 && (
                <div className="space-y-3">
                  {applications.slice(0, 4).map(app => {
                    const badge = STATUS_MAP[app.status] ?? STATUS_MAP.PENDING
                    return (
                      <div
                        key={app.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border"
                      >
                        <div>
                          <p className="text-sm font-semibold text-light-text dark:text-dark-text">{app.school}</p>
                          <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                            {app.grade} · Submitted {app.submitted}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}