import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FiArrowLeft, FiCheckCircle, FiXCircle, FiClock,
  FiAlertCircle, FiFileText, FiUser, FiBookOpen, FiPaperclip
} from 'react-icons/fi'

const STATUS_MAP = {
  PENDING:      { label: 'Pending',      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'          },
  ACCEPTED:     { label: 'Accepted',     color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'     },
  DECLINED:     { label: 'Declined',     color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'             },
}

// Reusable labelled row for the detail sections
function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-light-border dark:border-dark-border last:border-0">
      <span className="text-sm text-light-muted dark:text-dark-muted">{label}</span>
      <span className="text-sm font-medium text-light-text dark:text-dark-text text-right max-w-xs">{value ?? '—'}</span>
    </div>
  )
}

// Section card wrapper
function Section({ title, icon, children }) {
  return (
    <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6">
      <h2 className="font-semibold text-light-text dark:text-dark-text flex items-center gap-2 mb-4">
        <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </div>
  )
}

export default function AdminApplicationDetail() {
  const { id }    = useParams()   // /dashboard/admin/applications/:id
  const navigate  = useNavigate()

  const [app,      setApp]      = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [deciding, setDeciding] = useState(false)
  const [note,     setNote]     = useState('')      // admin note when approving/declining
  const [showNote, setShowNote] = useState(false)   // toggles the note textarea
  const [decision, setDecision] = useState(null)    // 'ACCEPTED' | 'DECLINED' pending confirmation

  const token   = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  // ── Fetch single application ──────────────────────────────────
  // We fetch from /admin/all and find by id since there's no single-get admin endpoint yet.
  // To add one later: GET /api/applications/admin/{id}
  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/applications/admin/all', { headers })
        if (!res.ok) throw new Error('Failed to load application')
        const data = await res.json()
        const found = data.find(a => String(a.id) === String(id))
        if (!found) throw new Error('Application not found')
        setApp(found)
        setNote(found.adminNotes ?? '')
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchApp()
  }, [id])

  // ── Submit decision ───────────────────────────────────────────
  // PATCH /api/applications/admin/{id}/status
  const handleDecision = async (status) => {
    setDeciding(true)
    try {
      const res = await fetch(`http://localhost:8080/api/applications/admin/${id}/status`, {
        method:  'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status, adminNotes: note || null }),
      })

      if (!res.ok) throw new Error('Failed to update status')

      const updated = await res.json()
      // Merge the updated fields into local state so the page reflects the change
      setApp(prev => ({ ...prev, status: updated.status, adminNotes: updated.adminNotes }))
      setDecision(null)
      setShowNote(false)
    } catch (err) {
      alert(err.message)
    } finally {
      setDeciding(false)
    }
  }

  if (loading) return (
    <div className="min-h-full bg-light-bg dark:bg-dark-bg flex items-center justify-center">
      <div className="flex items-center gap-3 text-light-muted dark:text-dark-muted">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        Loading application...
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-full bg-light-bg dark:bg-dark-bg flex items-center justify-center px-6">
      <div className="text-center">
        <FiAlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <p className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
          Go Back
        </button>
      </div>
    </div>
  )

  const badge    = STATUS_MAP[app.status] ?? STATUS_MAP.PENDING
  const canDecide = app.status === 'PENDING' || app.status === 'UNDER_REVIEW'

  return (
    <div className="min-h-full bg-light-bg dark:bg-dark-bg py-10 px-6">
      <div className="max-w-4xl mx-auto">

        {/* ── Back + header ── */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard/admin/applications')}
            className="w-9 h-9 rounded-lg flex items-center justify-center border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-2xl font-bold text-light-text dark:text-dark-text">
                Application Detail
              </h1>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.color}`}>
                {badge.label}
              </span>
            </div>
            <p className="text-light-muted dark:text-dark-muted text-sm mt-0.5">
              Ref: {app.referenceNumber} · Submitted: {app.submittedAt ? app.submittedAt.split('T')[0] : '—'}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* ── Left column: decision panel ── */}
          <div className="md:col-span-1 space-y-4">

            {/* Current status card */}
            <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6">
              <p className="text-xs font-semibold text-light-muted dark:text-dark-muted uppercase tracking-widest mb-3">
                Current Status
              </p>
              <div className="flex items-center gap-3 mb-4">
                {app.status === 'ACCEPTED' && <FiCheckCircle className="w-8 h-8 text-green-500" />}
                {app.status === 'DECLINED' && <FiXCircle     className="w-8 h-8 text-red-500"   />}
                {(app.status === 'PENDING' || app.status === 'UNDER_REVIEW') && <FiClock className="w-8 h-8 text-blue-500" />}
                <div>
                  <p className="font-semibold text-light-text dark:text-dark-text">{badge.label}</p>
                  <p className="text-xs text-light-muted dark:text-dark-muted">
                    Last updated: {app.updatedAt ? app.updatedAt.split('T')[0] : '—'}
                  </p>
                </div>
              </div>

              {/* Admin notes left by previous decision */}
              {app.adminNotes && (
                <div className="p-3 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border">
                  <p className="text-xs font-semibold text-light-muted dark:text-dark-muted mb-1">Admin note sent to parent:</p>
                  <p className="text-sm text-light-text dark:text-dark-text leading-relaxed">{app.adminNotes}</p>
                </div>
              )}
            </div>

            {/* Decision panel — only shown if application can still be decided */}
            {canDecide && (
              <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6">
                <p className="text-xs font-semibold text-light-muted dark:text-dark-muted uppercase tracking-widest mb-4">
                  Make a Decision
                </p>

                {/* Optional note toggle */}
                <button
                  onClick={() => setShowNote(p => !p)}
                  className="w-full mb-3 py-2 rounded-lg text-xs font-medium border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {showNote ? 'Hide note' : '+ Add note to parent (optional)'}
                </button>

                {showNote && (
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    rows={3}
                    placeholder="e.g. Congratulations! Please confirm enrollment by..."
                    className="
                      w-full px-3 py-2.5 mb-3 rounded-lg text-sm resize-none
                      bg-light-bg dark:bg-dark-bg
                      text-light-text dark:text-dark-text
                      border border-light-border dark:border-dark-border
                      placeholder:text-light-muted dark:placeholder:text-dark-muted
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                    "
                  />
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDecision('ACCEPTED')}
                    disabled={deciding}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {deciding
                      ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                      : <FiCheckCircle className="w-4 h-4" />
                    }
                    Approve
                  </button>
                  <button
                    onClick={() => handleDecision('DECLINED')}
                    disabled={deciding}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {deciding
                      ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                      : <FiXCircle className="w-4 h-4" />
                    }
                    Decline
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right column: application details ── */}
          <div className="md:col-span-2 space-y-4">

            {/* Child details */}
            <Section title="Child's Details" icon={<FiUser className="w-4 h-4" />}>
              <DetailRow label="Full name"      value={`${app.childFirstName} ${app.childLastName}`} />
              <DetailRow label="Date of birth"  value={app.childDob}       />
              <DetailRow label="ID number"      value={app.childIdNumber}  />
              <DetailRow label="Grade applying" value={app.gradeApplying}  />
              <DetailRow label="School"         value={app.schoolName}     />
            </Section>

            {/* Parent contact */}
            <Section title="Parent / Guardian" icon={<FiUser className="w-4 h-4" />}>
              <DetailRow label="Full name"     value={`${app.parentFirstName} ${app.parentLastName}`} />
              <DetailRow label="Email"         value={app.parentEmail}    />
              <DetailRow label="Phone"         value={app.parentPhone}    />
              <DetailRow label="Relationship"  value={app.relationship}   />
              <DetailRow label="Address"       value={app.address}        />
            </Section>

            {/* Documents */}
            <Section title="Submitted Documents" icon={<FiPaperclip className="w-4 h-4" />}>
              {[
                { label: 'Birth Certificate',    path: app.birthCertificatePath },
                { label: 'Parent / Guardian ID', path: app.parentIdPath         },
                { label: 'Report Card',          path: app.reportCardPath       },
              ].map(doc => {
                const filename = doc.path ? doc.path.split(/[\\/]/).pop() : null
                const viewUrl  = filename
                  ? `http://localhost:8080/api/files/documents/${filename}`
                  : null

                return (
                  <div key={doc.label} className="flex items-center justify-between py-2.5 border-b border-light-border dark:border-dark-border last:border-0">
                    <div className="flex items-center gap-2">
                      <FiFileText className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <span className="text-sm text-light-text dark:text-dark-text">{doc.label}</span>
                    </div>

                    {viewUrl ? (
                      <a
                        href={viewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => {
                          e.preventDefault()
                          const token = localStorage.getItem('token')
                          fetch(viewUrl, { headers: { Authorization: `Bearer ${token}` } })
                            .then(res => res.blob())
                            .then(blob => {
                              const url = URL.createObjectURL(blob)
                              window.open(url, '_blank')
                            })
                            .catch(() => alert('Could not load document.'))
                        }}
                        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <FiFileText className="w-3.5 h-3.5" />
                        View
                      </a>
                    ) : (
                      <span className="text-xs text-light-muted dark:text-dark-muted">Not uploaded</span>
                    )}
                  </div>
                )
              })}
            </Section>
          </div>
        </div>

      </div>
    </div>
  )
}