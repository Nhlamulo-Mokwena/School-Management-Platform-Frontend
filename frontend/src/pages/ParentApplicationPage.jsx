import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const STATUS_MAP = {
  PENDING:      { label: 'Pending',      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', dot: 'bg-yellow-500' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',         dot: 'bg-blue-500'   },
  ACCEPTED:     { label: 'Accepted',     color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',     dot: 'bg-green-500'  },
  DECLINED:     { label: 'Declined',     color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',             dot: 'bg-red-500'    },
}

function StatusIcon({ status }) {
  if (status === 'ACCEPTED') return (
    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
      </svg>
    </div>
  )
  if (status === 'DECLINED') return (
    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
      <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </div>
  )
  if (status === 'UNDER_REVIEW') return (
    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    </div>
  )
  return (
    <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
      <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    </div>
  )
}

export default function ParentApplications() {
  const [applications,  setApplications] = useState([])
  const [loading,       setLoading]      = useState(true)
  const [error,         setError]        = useState(null)
  const [search,        setSearch]       = useState('')
  const [filterStatus,  setFilterStatus] = useState('ALL')
  const [selected,      setSelected]     = useState(null)
  const [withdrawing,   setWithdrawing]  = useState(false)

  // ── Fetch applications from the backend on mount ──────────────
  // GET /api/applications/my returns only the logged-in parent's applications.
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token')
        const res   = await fetch('http://localhost:8080/api/applications/my', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error('Failed to load applications')

        const data = await res.json()

        // Map the backend response fields to what the UI expects.
        // The backend returns camelCase fields from ApplicationResponse.
        const mapped = data.map(app => ({
          id:          app.id,
          school:      app.schoolName,
          schoolType:  '',                    // not returned by backend yet — leave blank
          grade:       app.gradeApplying,
          submitted:   app.submittedAt ? app.submittedAt.split('T')[0] : '—',
          lastUpdated: app.updatedAt   ? app.updatedAt.split('T')[0]   : '—',
          status:      app.status,
          refNumber:   app.referenceNumber,
          notes:       app.adminNotes ?? 'Application received. Awaiting review.',
          // keep original fields for the drawer details
          parentFirstName:      app.parentFirstName,
          parentLastName:       app.parentLastName,
          childFirstName:       app.childFirstName,
          childLastName:        app.childLastName,
          birthCertificatePath: app.birthCertificatePath,
          parentIdPath:         app.parentIdPath,
          reportCardPath:       app.reportCardPath,
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

  // ── Withdraw an application ───────────────────────────────────
  // DELETE /api/applications/my/{id}/withdraw
  const handleWithdraw = async (id) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return
    setWithdrawing(true)
    try {
      const token = localStorage.getItem('token')
      const res   = await fetch(`http://localhost:8080/api/applications/my/${id}/withdraw`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error('Failed to withdraw application')

      // Remove the withdrawn application from local state — no need to refetch
      setApplications(prev => prev.filter(a => a.id !== id))
      setSelected(null)
    } catch (err) {
      alert(err.message)
    } finally {
      setWithdrawing(false)
    }
  }

  // ── Derived filtered list ─────────────────────────────────────
  const filtered = applications.filter(app => {
    const matchesStatus = filterStatus === 'ALL' || app.status === filterStatus
    const matchesSearch = app.school.toLowerCase().includes(search.toLowerCase()) ||
                          app.refNumber?.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const stats = [
    { label: 'Total',        value: applications.length,                                          color: 'text-light-text dark:text-dark-text'  },
    { label: 'Pending',      value: applications.filter(a => a.status === 'PENDING').length,      color: 'text-yellow-600 dark:text-yellow-400' },
    { label: 'Under Review', value: applications.filter(a => a.status === 'UNDER_REVIEW').length, color: 'text-blue-600 dark:text-blue-400'     },
    { label: 'Accepted',     value: applications.filter(a => a.status === 'ACCEPTED').length,     color: 'text-green-600 dark:text-green-400'   },
  ]

  // ── Loading state ─────────────────────────────────────────────
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

  // ── Error state ───────────────────────────────────────────────
  if (error) return (
    <div className="min-h-full bg-light-bg dark:bg-dark-bg flex items-center justify-center px-6">
      <div className="text-center">
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
    <div className="min-h-full bg-light-bg dark:bg-dark-bg py-10 px-6">
      <div className="max-w-5xl mx-auto">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-light-text dark:text-dark-text">
              My Applications
            </h1>
            <p className="text-light-muted dark:text-dark-muted text-sm mt-1">
              Track all your submitted school applications.
            </p>
          </div>
          <Link
            to="/dashboard/apply"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            New Application
          </Link>
        </div>

        {/* ── Stats strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(stat => (
            <div key={stat.label} className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-light-muted dark:text-dark-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Search + filter bar ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-muted dark:text-dark-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              placeholder="Search by school or reference number..."
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

        {/* ── Application cards ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-light-muted dark:text-dark-muted text-sm">
              {applications.length === 0 ? "You haven't submitted any applications yet." : 'No applications match your search.'}
            </p>
            <Link to="/dashboard/apply" className="inline-block mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Submit a new application →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(app => {
              const badge = STATUS_MAP[app.status] ?? STATUS_MAP.PENDING
              return (
                <div
                  key={app.id}
                  onClick={() => setSelected(app)}
                  className="
                    flex items-center justify-between
                    bg-light-surface dark:bg-dark-surface
                    border border-light-border dark:border-dark-border
                    rounded-xl px-5 py-4 cursor-pointer
                    hover:border-blue-300 dark:hover:border-blue-700
                    hover:shadow-sm transition-all
                  "
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${badge.dot}`} />
                    <div>
                      <p className="text-sm font-semibold text-light-text dark:text-dark-text">{app.school}</p>
                      <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                        {app.grade} · Ref: {app.refNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="hidden sm:block text-right">
                      <p className="text-xs text-light-muted dark:text-dark-muted">Submitted</p>
                      <p className="text-xs font-medium text-light-text dark:text-dark-text">{app.submitted}</p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.color}`}>
                      {badge.label}
                    </span>
                    <svg className="w-4 h-4 text-light-muted dark:text-dark-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Detail drawer ── */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40" onClick={() => setSelected(null)} />
      )}

      <div className={`
        fixed top-0 right-0 h-full w-full max-w-md z-50
        bg-light-surface dark:bg-dark-surface
        border-l border-light-border dark:border-dark-border
        shadow-2xl flex flex-col
        transition-transform duration-300
        ${selected ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {selected && (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border flex-shrink-0">
              <h2 className="font-semibold text-light-text dark:text-dark-text">Application Details</h2>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-light-muted dark:text-dark-muted hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

              {/* Status hero */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border">
                <StatusIcon status={selected.status} />
                <div>
                  <p className="font-semibold text-light-text dark:text-dark-text">{selected.school}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_MAP[selected.status]?.color}`}>
                    {STATUS_MAP[selected.status]?.label}
                  </span>
                </div>
              </div>

              {/* Application info */}
              <div>
                <h3 className="text-xs font-semibold text-light-muted dark:text-dark-muted uppercase tracking-widest mb-3">
                  Application Info
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Reference Number', value: selected.refNumber    },
                    { label: 'Grade Applying For',value: selected.grade       },
                    { label: 'Date Submitted',    value: selected.submitted   },
                    { label: 'Last Updated',      value: selected.lastUpdated },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between py-2 border-b border-light-border dark:border-dark-border last:border-0">
                      <span className="text-sm text-light-muted dark:text-dark-muted">{row.label}</span>
                      <span className="text-sm font-medium text-light-text dark:text-dark-text">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message from school */}
              <div>
                <h3 className="text-xs font-semibold text-light-muted dark:text-dark-muted uppercase tracking-widest mb-3">
                  Message from School
                </h3>
                <div className="p-4 rounded-xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border">
                  <p className="text-sm text-light-text dark:text-dark-text leading-relaxed">
                    {selected.notes}
                  </p>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-xs font-semibold text-light-muted dark:text-dark-muted uppercase tracking-widest mb-3">
                  Submitted Documents
                </h3>
                <div className="space-y-2">
                  {[
                    { label: 'Birth Certificate', path: selected.birthCertificatePath },
                    { label: 'Parent ID',          path: selected.parentIdPath         },
                    { label: 'Report Card',        path: selected.reportCardPath       },
                  ].map(doc => (
                    <div key={doc.label} className="flex items-center justify-between p-3 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        <span className="text-sm text-light-text dark:text-dark-text">{doc.label}</span>
                      </div>
                      <span className={`text-xs font-medium ${doc.path ? 'text-green-600 dark:text-green-400' : 'text-light-muted dark:text-dark-muted'}`}>
                        {doc.path ? 'Uploaded' : 'Not uploaded'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Withdraw footer */}
            {(selected.status === 'PENDING' || selected.status === 'UNDER_REVIEW') && (
              <div className="px-6 py-4 border-t border-light-border dark:border-dark-border flex-shrink-0">
                <button
                  onClick={() => handleWithdraw(selected.id)}
                  disabled={withdrawing}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold border border-red-300 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                >
                  {withdrawing ? 'Withdrawing...' : 'Withdraw Application'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}