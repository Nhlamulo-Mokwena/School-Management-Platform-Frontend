import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiFileText, FiSearch, FiAlertCircle,
  FiCheckCircle, FiClock, FiXCircle, FiChevronRight
} from 'react-icons/fi'

const STATUS_MAP = {
  PENDING:      { label: 'Pending',      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', dot: 'bg-yellow-500' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',         dot: 'bg-blue-500'   },
  ACCEPTED:     { label: 'Accepted',     color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',     dot: 'bg-green-500'  },
  DECLINED:     { label: 'Declined',     color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',             dot: 'bg-red-500'    },
}

export default function AdminApplications() {
  const navigate = useNavigate()

  const [applications, setApplications] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [search,       setSearch]       = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')

  const token   = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  // ── Fetch all applications ────────────────────────────────────
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/applications/admin/all', { headers })
        if (!res.ok) throw new Error('Failed to load applications')

        const data = await res.json()
        const mapped = data.map(app => ({
          id:            app.id,
          refNumber:     app.referenceNumber,
          parentName:    `${app.parentFirstName} ${app.parentLastName}`,
          parentEmail:   app.parentEmail,
          childName:     `${app.childFirstName} ${app.childLastName}`,
          school:        app.schoolName,
          grade:         app.gradeApplying,
          submitted:     app.submittedAt ? app.submittedAt.split('T')[0] : '—',
          lastUpdated:   app.updatedAt   ? app.updatedAt.split('T')[0]   : '—',
          status:        app.status,
          adminNotes:    app.adminNotes,
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

  // ── Derived list ──────────────────────────────────────────────
  const filtered = applications.filter(app => {
    const matchesStatus = filterStatus === 'ALL' || app.status === filterStatus
    const q = search.toLowerCase()
    const matchesSearch =
      app.parentName.toLowerCase().includes(q)  ||
      app.school.toLowerCase().includes(q)       ||
      app.refNumber?.toLowerCase().includes(q)   ||
      app.childName.toLowerCase().includes(q)
    return matchesStatus && matchesSearch
  })

  // ── Stats derived from the full list (not filtered) ───────────
  const stats = [
    { label: 'Total',        value: applications.length,                                          icon: <FiFileText    className="w-4 h-4" />, color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/20'    },
    { label: 'Pending',      value: applications.filter(a => a.status === 'PENDING').length,      icon: <FiClock       className="w-4 h-4" />, color: 'text-yellow-600 dark:text-yellow-400',bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Under Review', value: applications.filter(a => a.status === 'UNDER_REVIEW').length, icon: <FiClock       className="w-4 h-4" />, color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/20'    },
    { label: 'Accepted',     value: applications.filter(a => a.status === 'ACCEPTED').length,     icon: <FiCheckCircle className="w-4 h-4" />, color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-900/20'  },
    { label: 'Declined',     value: applications.filter(a => a.status === 'DECLINED').length,     icon: <FiXCircle     className="w-4 h-4" />, color: 'text-red-600 dark:text-red-400',      bg: 'bg-red-50 dark:bg-red-900/20'      },
  ]

  if (loading) return (
    <div className="min-h-full bg-light-bg dark:bg-dark-bg flex items-center justify-center">
      <div className="flex items-center gap-3 text-light-muted dark:text-dark-muted">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        Loading applications...
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-full bg-light-bg dark:bg-dark-bg flex items-center justify-center px-6">
      <div className="text-center">
        <FiAlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <p className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
          Try Again
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-full bg-light-bg dark:bg-dark-bg py-10 px-6">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-light-text dark:text-dark-text">
            Applications
          </h1>
          <p className="text-light-muted dark:text-dark-muted text-sm mt-1">
            Review, approve, or decline school applications.
          </p>
        </div>

        {/* ── Stats strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {stats.map(stat => (
            <div key={stat.label} className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </div>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Search + filter ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-muted dark:text-dark-muted" />
            <input
              type="text"
              placeholder="Search by parent, child, school or reference..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="
                w-full pl-9 pr-4 py-2.5 rounded-lg text-sm
                bg-light-surface dark:bg-dark-surface
                text-light-text dark:text-dark-text
                border border-light-border dark:border-dark-border
                placeholder:text-light-muted dark:placeholder:text-dark-muted
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                transition-colors
              "
            />
          </div>

          {/* Status filters */}
          <div className="flex gap-2 flex-wrap">
            {['ALL', 'PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'DECLINED'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`
                  px-3 py-2 rounded-lg text-xs font-semibold transition-colors
                  ${filterStatus === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }
                `}
              >
                {s === 'ALL' ? 'All' : s === 'UNDER_REVIEW' ? 'Under Review' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* ── Applications table ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl">
            <FiFileText className="w-10 h-10 text-light-muted dark:text-dark-muted mx-auto mb-3" />
            <p className="text-light-muted dark:text-dark-muted text-sm">No applications match your search.</p>
          </div>
        ) : (
          <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl overflow-hidden">

            {/* Table header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg">
              <p className="col-span-3 text-xs font-semibold text-light-muted dark:text-dark-muted uppercase tracking-wider">Parent / Child</p>
              <p className="col-span-3 text-xs font-semibold text-light-muted dark:text-dark-muted uppercase tracking-wider">School</p>
              <p className="col-span-2 text-xs font-semibold text-light-muted dark:text-dark-muted uppercase tracking-wider">Reference</p>
              <p className="col-span-2 text-xs font-semibold text-light-muted dark:text-dark-muted uppercase tracking-wider">Submitted</p>
              <p className="col-span-2 text-xs font-semibold text-light-muted dark:text-dark-muted uppercase tracking-wider">Status</p>
            </div>

            {/* Rows */}
            <div className="divide-y divide-light-border dark:divide-dark-border">
              {filtered.map(app => {
                const badge = STATUS_MAP[app.status] ?? STATUS_MAP.PENDING
                return (
                  <div
                    key={app.id}
                    onClick={() => navigate(`/dashboard/admin/applications/${app.id}`)}
                    className="
                      grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4
                      px-5 py-4 cursor-pointer
                      hover:bg-light-bg dark:hover:bg-dark-bg
                      transition-colors group
                    "
                  >
                    {/* Parent + child */}
                    <div className="md:col-span-3">
                      <p className="text-sm font-semibold text-light-text dark:text-dark-text">{app.parentName}</p>
                      <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">Child: {app.childName}</p>
                    </div>

                    {/* School + grade */}
                    <div className="md:col-span-3">
                      <p className="text-sm text-light-text dark:text-dark-text">{app.school}</p>
                      <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">{app.grade}</p>
                    </div>

                    {/* Ref number */}
                    <div className="md:col-span-2">
                      <p className="text-xs font-mono text-light-muted dark:text-dark-muted">{app.refNumber}</p>
                    </div>

                    {/* Submitted date */}
                    <div className="md:col-span-2">
                      <p className="text-xs text-light-muted dark:text-dark-muted">{app.submitted}</p>
                    </div>

                    {/* Status + chevron */}
                    <div className="md:col-span-2 flex items-center justify-between">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.color}`}>
                        {badge.label}
                      </span>
                      <FiChevronRight className="w-4 h-4 text-light-muted dark:text-dark-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer count */}
            <div className="px-5 py-3 border-t border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg">
              <p className="text-xs text-light-muted dark:text-dark-muted">
                Showing {filtered.length} of {applications.length} applications
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}