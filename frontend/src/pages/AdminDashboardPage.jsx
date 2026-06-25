import { useState } from 'react'
import { getCurrentUser } from '../hooks/Auth'

// ── Mock data ────────────────────────────────────────────────────
// Replace with real API calls once backend is ready.
// e.g. fetch('/api/admin/applications', { headers: { Authorization: `Bearer ${token}` } })
const MOCK_STATS = [
  { label: 'Total Applications', value: 142, icon: '📋' },
  { label: 'Pending Review',     value: 38,  icon: '⏳' },
  { label: 'Accepted',           value: 76,  icon: '✅' },
  { label: 'Registered Users',   value: 94,  icon: '👥' },
]

const INITIAL_APPLICATIONS = [
  { id: 1, parent: 'Sipho Mokwena',   school: 'Pretoria High School', grade: 'Grade 8', submitted: '2025-03-01', status: 'PENDING'      },
  { id: 2, parent: 'Zanele Dlamini',  school: "St John's College",    grade: 'Grade 9', submitted: '2025-03-02', status: 'UNDER_REVIEW' },
  { id: 3, parent: 'Thabo Nkosi',     school: 'Northcliff Primary',   grade: 'Grade 4', submitted: '2025-03-03', status: 'PENDING'      },
  { id: 4, parent: 'Lerato Sithole',  school: 'Parktown Boys High',   grade: 'Grade 8', submitted: '2025-03-05', status: 'ACCEPTED'     },
  { id: 5, parent: 'Nomvula Khumalo', school: 'Crawford College',     grade: 'Grade 6', submitted: '2025-03-06', status: 'DECLINED'     },
  { id: 6, parent: 'Bongani Zulu',    school: 'Wits High School',     grade: 'Grade 10', submitted: '2025-03-07', status: 'PENDING'     },
]

const MOCK_USERS = [
  { id: 1, name: 'Sipho Mokwena',   email: 'sipho@email.com',   role: 'ROLE_PARENT',  joined: '2025-02-10' },
  { id: 2, name: 'Zanele Dlamini',  email: 'zanele@email.com',  role: 'ROLE_PARENT',  joined: '2025-02-12' },
  { id: 3, name: 'Mr Ndlovu',       email: 'ndlovu@school.com', role: 'ROLE_TEACHER', joined: '2025-01-05' },
  { id: 4, name: 'Thabo Nkosi',     email: 'thabo@email.com',   role: 'ROLE_PARENT',  joined: '2025-03-01' },
  { id: 5, name: 'Ms Khumalo',      email: 'khumalo@school.com',role: 'ROLE_TEACHER', joined: '2025-01-08' },
]

const STATUS_MAP = {
  PENDING:      { label: 'Pending',      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'         },
  ACCEPTED:     { label: 'Accepted',     color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'     },
  DECLINED:     { label: 'Declined',     color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'             },
}

const ROLE_MAP = {
  ROLE_PARENT:  { label: 'Parent',  color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'     },
  ROLE_TEACHER: { label: 'Teacher', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  ROLE_ADMIN:   { label: 'Admin',   color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'           },
}

// Which tab is active — "applications" or "users"
const TABS = ['Applications', 'Users']

export default function AdminDashboard() {
  const user = getCurrentUser()

  const [activeTab,    setActiveTab]    = useState('Applications')
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS)
  const [filterStatus, setFilterStatus] = useState('ALL')

  // Called when admin clicks Approve or Decline on an application.
  // Updates the status locally — replace the setApplications call with
  // a real PATCH /api/admin/applications/{id}/status request when wiring the backend.
  const handleDecision = (id, decision) => {
    setApplications(prev =>
      prev.map(app =>
        app.id === id ? { ...app, status: decision } : app
      )
    )
  }

  // Filter applications based on the selected status dropdown
  const visibleApplications = filterStatus === 'ALL'
    ? applications
    : applications.filter(a => a.status === filterStatus)

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
          {MOCK_STATS.map(stat => (
            <div
              key={stat.label}
              className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-5"
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stat.value}</p>
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
                      // Active tab — blue underline indicator
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
                    }
                  `}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Filter — only visible on the Applications tab */}
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
                <p className="text-center text-light-muted dark:text-dark-muted py-10 text-sm">
                  No applications match this filter.
                </p>
              ) : (
                <div className="space-y-3">
                  {visibleApplications.map(app => {
                    const badge = STATUS_MAP[app.status]
                    const canDecide = app.status === 'PENDING' || app.status === 'UNDER_REVIEW'

                    return (
                      <div
                        key={app.id}
                        className="
                          flex flex-col md:flex-row md:items-center justify-between gap-4
                          p-4 rounded-xl bg-light-bg dark:bg-dark-bg
                          border border-light-border dark:border-dark-border
                        "
                      >
                        {/* Application info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-light-text dark:text-dark-text">
                              {app.parent}
                            </p>
                            <span className="text-light-muted dark:text-dark-muted text-xs">→</span>
                            <p className="text-sm text-light-muted dark:text-dark-muted">{app.school}</p>
                          </div>
                          <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                            {app.grade} · Submitted {app.submitted}
                          </p>
                        </div>

                        {/* Status badge + action buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.color}`}>
                            {badge.label}
                          </span>

                          {/* Approve / Decline only shown when application can still be decided on */}
                          {canDecide && (
                            <>
                              <button
                                onClick={() => handleDecision(app.id, 'ACCEPTED')}
                                className="px-3 py-1 rounded-lg text-xs font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleDecision(app.id, 'DECLINED')}
                                className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors"
                              >
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
              <div className="space-y-3">
                {MOCK_USERS.map(u => {
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
                      <div>
                        <p className="text-sm font-semibold text-light-text dark:text-dark-text">{u.name}</p>
                        <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                          {u.email} · Joined {u.joined}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${roleBadge.color}`}>
                        {roleBadge.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}