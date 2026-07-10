import { useState, useEffect } from 'react'
import { getCurrentUser } from '../hooks/Auth'
import {
  FiFileText, FiClock, FiCheckCircle, FiUsers,
  FiXCircle, FiAlertCircle
} from 'react-icons/fi'

const STATUS_MAP = {
  PENDING:      { label: 'Pending',      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'         },
  ACCEPTED:     { label: 'Accepted',     color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'     },
  DECLINED:     { label: 'Declined',     color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'             },
}

const ROLE_MAP = {
  ROLE_PARENT:  { label: 'Parent',  color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'           },
  ROLE_TEACHER: { label: 'Teacher', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'   },
  ROLE_ADMIN:   { label: 'Admin',   color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'               },
}

const TABS = ['Applications', 'Users']

export default function AdminDashboard() {
  const user = getCurrentUser()

  const [activeTab,    setActiveTab]    = useState('Applications')
  const [applications, setApplications] = useState([])
  const [users,        setUsers]        = useState([])
  const [stats,        setStats]        = useState(null)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [deciding,     setDeciding]     = useState(null) // id of app being decided

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  // ── Fetch everything on mount ─────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Run all three requests in parallel for speed
        const [appsRes, statsRes, usersRes] = await Promise.all([
          fetch('http://localhost:8080/api/applications/admin/all',   { headers }),
          fetch('http://localhost:8080/api/applications/admin/stats', { headers }),
          fetch('http://localhost:8080/api/users',                    { headers }),
        ])

        if (!appsRes.ok)  throw new Error('Failed to load applications')
        if (!statsRes.ok) throw new Error('Failed to load stats')

        const appsData  = await appsRes.json()
        const statsData = await statsRes.json()

        // Map backend fields to what the UI expects
        const mappedApps = appsData.map(app => ({
          id:        app.id,
          parent:    `${app.parentFirstName} ${app.parentLastName}`,
          school:    app.schoolName,
          grade:     app.gradeApplying,
          submitted: app.submittedAt ? app.submittedAt.split('T')[0] : '—',
          status:    app.status,
          refNumber: app.referenceNumber,
        }))

        setApplications(mappedApps)
        setStats(statsData)

        // Users endpoint is optional — fail gracefully if not built yet
        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setUsers(usersData)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  // ── Approve or decline an application ────────────────────────
  // PATCH /api/applications/admin/{id}/status
  const handleDecision = async (id, decision) => {
    setDeciding(id)
    try {
      const res = await fetch(`http://localhost:8080/api/applications/admin/${id}/status`, {
        method:  'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: decision, adminNotes: null }),
      })

      if (!res.ok) throw new Error('Failed to update status')

      // Update the application in local state — no need to refetch everything
      setApplications(prev =>
        prev.map(app => app.id === id ? { ...app, status: decision } : app)
      )

      // Update the stats counts locally to reflect the decision
      setStats(prev => {
        if (!prev) return prev
        const oldStatus = applications.find(a => a.id === id)?.status
        return {
          ...prev,
          pending:     oldStatus === 'PENDING'      ? prev.pending - 1      : prev.pending,
          underReview: oldStatus === 'UNDER_REVIEW'  ? prev.underReview - 1  : prev.underReview,
          accepted:    decision  === 'ACCEPTED'      ? prev.accepted + 1     : prev.accepted,
          declined:    decision  === 'DECLINED'      ? prev.declined + 1     : prev.declined,
        }
      })
    } catch (err) {
      alert(err.message)
    } finally {
      setDeciding(null)
    }
  }

  const visibleApplications = filterStatus === 'ALL'
    ? applications
    : applications.filter(a => a.status === filterStatus)

  // ── Stats cards config — built from live data ─────────────────
  const statCards = stats ? [
    { label: 'Total Applications', value: stats.total,       icon: <FiFileText className="w-5 h-5" />, color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-900/20'   },
    { label: 'Pending Review',     value: stats.pending,     icon: <FiClock    className="w-5 h-5" />, color: 'text-yellow-600 dark:text-yellow-400',bg: 'bg-yellow-50 dark:bg-yellow-900/20'},
    { label: 'Accepted',           value: stats.accepted,    icon: <FiCheckCircle className="w-5 h-5"/>,color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Registered Users',   value: users.length,      icon: <FiUsers    className="w-5 h-5" />, color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-900/20'   },
  ] : []

  // ── Loading state ─────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-full bg-light-bg dark:bg-dark-bg flex items-center justify-center">
      <div className="flex items-center gap-3 text-light-muted dark:text-dark-muted">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        Loading dashboard...
      </div>
    </div>
  )

  // ── Error state ───────────────────────────────────────────────
  if (error) return (
    <div className="min-h-full bg-light-bg dark:bg-dark-bg flex items-center justify-center px-6">
      <div className="text-center">
        <FiAlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <p className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-full bg-light-bg dark:bg-dark-bg">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* ── Header ── */}
        <div className="mb-8">
          <p className="text-light-muted dark:text-dark-muted text-sm">Admin Panel</p>
          <h1 className="font-display text-2xl font-bold text-light-text dark:text-dark-text">
            {user?.sub ?? 'Administrator'}
          </h1>
        </div>

        {/* ── Stats overview ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map(stat => (
            <div
              key={stat.label}
              className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-5"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-light-muted dark:text-dark-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Main card with tabs ── */}
        <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl">

          {/* Tab bar */}
          <div className="flex items-center justify-between border-b border-light-border dark:border-dark-border px-6 pt-4">
            <div className="flex gap-1">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors
                    ${activeTab === tab
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
                    }
                  `}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'Applications' && (
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="
                  text-xs px-3 py-1.5 rounded-lg mb-2
                  bg-light-bg dark:bg-dark-bg
                  text-light-text dark:text-dark-text
                  border border-light-border dark:border-dark-border
                  outline-none focus:ring-1 focus:ring-blue-500
                "
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="DECLINED">Declined</option>
              </select>
            )}
          </div>

          {/* ── Applications tab ── */}
          {activeTab === 'Applications' && (
            <div className="p-6">
              {visibleApplications.length === 0 ? (
                <div className="text-center py-10">
                  <FiFileText className="w-8 h-8 text-light-muted dark:text-dark-muted mx-auto mb-3" />
                  <p className="text-light-muted dark:text-dark-muted text-sm">
                    No applications match this filter.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleApplications.map(app => {
                    const badge    = STATUS_MAP[app.status] ?? STATUS_MAP.PENDING
                    const canDecide = app.status === 'PENDING' || app.status === 'UNDER_REVIEW'
                    const isDeciding = deciding === app.id

                    return (
                      <div
                        key={app.id}
                        className="
                          flex flex-col md:flex-row md:items-center justify-between gap-4
                          p-4 rounded-xl bg-light-bg dark:bg-dark-bg
                          border border-light-border dark:border-dark-border
                        "
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-light-text dark:text-dark-text">
                              {app.parent}
                            </p>
                            <span className="text-light-muted dark:text-dark-muted text-xs">→</span>
                            <p className="text-sm text-light-muted dark:text-dark-muted">{app.school}</p>
                          </div>
                          <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                            {app.grade} · Submitted {app.submitted} · Ref: {app.refNumber}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.color}`}>
                            {badge.label}
                          </span>

                          {canDecide && (
                            <>
                              <button
                                onClick={() => handleDecision(app.id, 'ACCEPTED')}
                                disabled={isDeciding}
                                className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 transition-colors"
                              >
                                {isDeciding
                                  ? <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                                  : <FiCheckCircle className="w-3 h-3" />
                                }
                                Approve
                              </button>
                              <button
                                onClick={() => handleDecision(app.id, 'DECLINED')}
                                disabled={isDeciding}
                                className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 transition-colors"
                              >
                                {isDeciding
                                  ? <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                                  : <FiXCircle className="w-3 h-3" />
                                }
                                Decline
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Users tab ── */}
          {activeTab === 'Users' && (
            <div className="p-6">
              {users.length === 0 ? (
                <div className="text-center py-10">
                  <FiUsers className="w-8 h-8 text-light-muted dark:text-dark-muted mx-auto mb-3" />
                  <p className="text-light-muted dark:text-dark-muted text-sm">No users found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map(u => {
                    const roleBadge = ROLE_MAP[u.role] ?? { label: u.role, color: '' }
                    return (
                      <div
                        key={u.id}
                        className="
                          flex items-center justify-between
                          p-4 rounded-xl bg-light-bg dark:bg-dark-bg
                          border border-light-border dark:border-dark-border
                        "
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">
                              {u.email?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-light-text dark:text-dark-text">{u.email}</p>
                            <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                              ID: {u.id}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${roleBadge.color}`}>
                          {roleBadge.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}