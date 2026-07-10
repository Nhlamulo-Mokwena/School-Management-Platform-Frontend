import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentUser } from '../hooks/Auth'
import {
  FiFileText, FiClock, FiCheckCircle, FiAlertCircle,
  FiBookOpen, FiEye
} from 'react-icons/fi'

const STATUS_MAP = {
  PENDING:      { label: 'Pending',      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', dot: 'bg-yellow-500' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',         dot: 'bg-blue-500'   },
  ACCEPTED:     { label: 'Accepted',     color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',     dot: 'bg-green-500'  },
  DECLINED:     { label: 'Declined',     color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',             dot: 'bg-red-500'    },
}

export default function TeacherDashboard() {
  const user = getCurrentUser()

  const [applications, setApplications] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)

  // ── Fetch all applications visible to the teacher ─────────────
  // Teachers use the same admin/all endpoint — you can later scope
  // this to their school by adding a /api/applications/teacher endpoint
  // that filters by schoolName matching the teacher's assigned school.
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token')
        const res   = await fetch('http://localhost:8080/api/applications/teacher', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to load applications')
        const data = await res.json()
        const mapped = data.map(app => ({
          id:          app.id,
          refNumber:   app.referenceNumber,
          childName:   `${app.childFirstName} ${app.childLastName}`,
          parentName:  `${app.parentFirstName} ${app.parentLastName}`,
          school:      app.schoolName,
          grade:       app.gradeApplying,
          submitted:   app.submittedAt ? app.submittedAt.split('T')[0] : '—',
          status:      app.status,
          adminNotes:  app.adminNotes,
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

  // ── Derived stats ─────────────────────────────────────────────
  const stats = [
    {
      label: 'Total Applications',
      value: applications.length,
      icon:  <FiFileText    className="w-5 h-5" />,
      color: 'text-blue-600 dark:text-blue-400',
      bg:    'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Awaiting Review',
      value: applications.filter(a => a.status === 'PENDING').length,
      icon:  <FiClock       className="w-5 h-5" />,
      color: 'text-yellow-600 dark:text-yellow-400',
      bg:    'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      label: 'Under Review',
      value: applications.filter(a => a.status === 'UNDER_REVIEW').length,
      icon:  <FiEye         className="w-5 h-5" />,
      color: 'text-blue-600 dark:text-blue-400',
      bg:    'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Decided',
      value: applications.filter(a => a.status === 'ACCEPTED' || a.status === 'DECLINED').length,
      icon:  <FiCheckCircle className="w-5 h-5" />,
      color: 'text-green-600 dark:text-green-400',
      bg:    'bg-green-50 dark:bg-green-900/20',
    },
  ]

  return (
    <div className="min-h-full bg-light-bg dark:bg-dark-bg">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* ── Header ── */}
        <div className="mb-8">
          <p className="text-light-muted dark:text-dark-muted text-sm">Welcome back,</p>
          <h1 className="font-display text-2xl font-bold text-light-text dark:text-dark-text">
            {user?.sub ?? 'Teacher'}
          </h1>
          <p className="text-light-muted dark:text-dark-muted text-sm mt-1">
            Review incoming applications and leave recommendations for the admin.
          </p>
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

        {/* ── Recent applications needing review ── */}
        <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-light-text dark:text-dark-text flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <FiBookOpen className="w-4 h-4" />
              </span>
              Applications Awaiting Review
            </h2>
            <Link
              to="/dashboard/teacher/applications"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              View all →
            </Link>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-10 gap-2 text-light-muted dark:text-dark-muted">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              <span className="text-sm">Loading...</span>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <FiAlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && applications.filter(a => a.status === 'PENDING').length === 0 && (
            <div className="text-center py-10">
              <FiCheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <p className="text-sm text-light-muted dark:text-dark-muted">
                All caught up — no applications waiting for review.
              </p>
            </div>
          )}

          {/* Pending applications — show latest 5 */}
          {!loading && !error && (
            <div className="space-y-3">
              {applications
                .filter(a => a.status === 'PENDING')
                .slice(0, 5)
                .map(app => {
                  const badge = STATUS_MAP[app.status] ?? STATUS_MAP.PENDING
                  return (
                    <Link
                      key={app.id}
                      to={`/dashboard/teacher/applications/${app.id}`}
                      className="
                        flex items-center justify-between p-4 rounded-xl
                        bg-light-bg dark:bg-dark-bg
                        border border-light-border dark:border-dark-border
                        hover:border-blue-300 dark:hover:border-blue-700
                        hover:shadow-sm transition-all group
                      "
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${badge.dot}`} />
                        <div>
                          <p className="text-sm font-semibold text-light-text dark:text-dark-text">
                            {app.childName}
                          </p>
                          <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                            {app.school} · {app.grade} · Submitted {app.submitted}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.color}`}>
                          {badge.label}
                        </span>
                        <FiEye className="w-4 h-4 text-light-muted dark:text-dark-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  )
                })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}