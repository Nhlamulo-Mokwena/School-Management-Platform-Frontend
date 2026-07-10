import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  FiArrowLeft, FiAlertCircle, FiFileText,
  FiUser, FiBookOpen, FiPaperclip, FiCheckCircle,
  FiClock, FiXCircle, FiMessageSquare
} from 'react-icons/fi'

const STATUS_MAP = {
  PENDING:      { label: 'Pending',      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'         },
  ACCEPTED:     { label: 'Accepted',     color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'     },
  DECLINED:     { label: 'Declined',     color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'             },
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-light-border dark:border-dark-border last:border-0">
      <span className="text-sm text-light-muted dark:text-dark-muted">{label}</span>
      <span className="text-sm font-medium text-light-text dark:text-dark-text text-right max-w-xs">{value ?? '—'}</span>
    </div>
  )
}

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

export default function TeacherApplicationDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()

  // Define token and headers at component scope so they are accessible
  // both in useEffect (for fetching) and in the document view button handler
  const token   = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const [app,        setApp]        = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [note,       setNote]       = useState('')     // teacher's recommendation note
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)  // shows success banner after marking review

  // ── Fetch the application ─────────────────────────────────────
  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/applications/teacher', { headers })
        if (!res.ok) throw new Error('Failed to load application')
        const data  = await res.json()
        const found = data.find(a => String(a.id) === String(id))
        if (!found) throw new Error('Application not found')
        setApp(found)
        // Pre-fill the note if the teacher previously left one
        setNote(found.adminNotes ?? '')
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchApp()
  }, [id])

  // ── Mark as Under Review with recommendation note ─────────────
  // PATCH /api/applications/teacher/{id}/review
  // This sets the status to UNDER_REVIEW and saves the teacher's note
  // so the admin can see the recommendation when making the final decision.
  const handleMarkUnderReview = async () => {
    if (!note.trim()) {
      toast.warning('Please add a recommendation note before marking as under review.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`http://localhost:8080/api/applications/teacher/${id}/review`, {
        method:  'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          status:     'UNDER_REVIEW',
          adminNotes: note.trim(),  // reusing adminNotes field for the teacher's note
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message ?? 'Failed to submit recommendation')
      }

      const updated = await res.json()
      setApp(prev => ({
        ...prev,
        status:     updated.status,
        adminNotes: updated.adminNotes,
      }))
      setSubmitted(true)
      toast.success('Recommendation submitted successfully.')
    } catch (err) {
      toast.error(err.message ?? 'Failed to submit recommendation')
    } finally {
      setSubmitting(false)
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

  const badge      = STATUS_MAP[app.status] ?? STATUS_MAP.PENDING
  const isPending  = app.status === 'PENDING'
  const isReviewed = app.status === 'UNDER_REVIEW'
  const isDecided  = app.status === 'ACCEPTED' || app.status === 'DECLINED'

  return (
    <div className="min-h-full bg-light-bg dark:bg-dark-bg py-10 px-6">
      <div className="max-w-4xl mx-auto">

        {/* ── Back + header ── */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard/teacher/applications')}
            className="w-9 h-9 rounded-lg flex items-center justify-center border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-2xl font-bold text-light-text dark:text-dark-text">
                Application Review
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

        {/* ── Success banner after marking under review ── */}
        {submitted && (
          <div className="flex items-center gap-3 mb-6 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                Recommendation submitted successfully.
              </p>
              <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                The admin has been notified and will make the final decision.
              </p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">

          {/* ── Left: status + review panel ── */}
          <div className="md:col-span-1 space-y-4">

            {/* Current status */}
            <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6">
              <p className="text-xs font-semibold text-light-muted dark:text-dark-muted uppercase tracking-widest mb-3">
                Current Status
              </p>
              <div className="flex items-center gap-3">
                {isPending  && <FiClock       className="w-7 h-7 text-yellow-500" />}
                {isReviewed && <FiFileText    className="w-7 h-7 text-blue-500"   />}
                {app.status === 'ACCEPTED' && <FiCheckCircle className="w-7 h-7 text-green-500" />}
                {app.status === 'DECLINED' && <FiXCircle     className="w-7 h-7 text-red-500"   />}
                <div>
                  <p className="font-semibold text-light-text dark:text-dark-text">{badge.label}</p>
                  <p className="text-xs text-light-muted dark:text-dark-muted">
                    Updated: {app.updatedAt ? app.updatedAt.split('T')[0] : '—'}
                  </p>
                </div>
              </div>

              {/* Show existing note if already reviewed */}
              {app.adminNotes && (
                <div className="mt-4 p-3 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border">
                  <p className="text-xs font-semibold text-light-muted dark:text-dark-muted mb-1">
                    {isDecided ? 'Admin decision note:' : 'Your recommendation:'}
                  </p>
                  <p className="text-sm text-light-text dark:text-dark-text leading-relaxed">
                    {app.adminNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Recommendation panel — only for PENDING applications */}
            {isPending && (
              <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6">
                <p className="text-xs font-semibold text-light-muted dark:text-dark-muted uppercase tracking-widest mb-4">
                  Your Recommendation
                </p>
                <p className="text-xs text-light-muted dark:text-dark-muted mb-3 leading-relaxed">
                  After reviewing the child's details and documents, add your recommendation
                  note and mark this application for the admin's final decision.
                </p>

                {/* Note textarea */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5 flex items-center gap-1.5">
                    <FiMessageSquare className="w-3.5 h-3.5" />
                    Recommendation note <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    rows={4}
                    placeholder="e.g. Child meets the academic entry requirements. ID and report card are verified. Recommend for acceptance."
                    className="
                      w-full px-3 py-2.5 rounded-lg text-sm resize-none
                      bg-light-bg dark:bg-dark-bg
                      text-light-text dark:text-dark-text
                      border border-light-border dark:border-dark-border
                      placeholder:text-light-muted dark:placeholder:text-dark-muted
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                    "
                  />
                </div>

                {/* Submit button */}
                <button
                  onClick={handleMarkUnderReview}
                  disabled={submitting || !note.trim()}
                  className="
                    w-full flex items-center justify-center gap-2
                    py-2.5 rounded-lg text-sm font-semibold text-white
                    bg-blue-600 hover:bg-blue-700
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                  "
                >
                  {submitting ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                  ) : (
                    <FiCheckCircle className="w-4 h-4" />
                  )}
                  {submitting ? 'Submitting...' : 'Mark as Under Review'}
                </button>

                <p className="text-xs text-light-muted dark:text-dark-muted mt-3 text-center">
                  The admin will see your note and make the final decision.
                </p>
              </div>
            )}

            {/* Info panel for already-reviewed applications */}
            {(isReviewed || isDecided) && !isPending && (
              <div className={`rounded-2xl p-5 border ${
                isDecided
                  ? 'bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              }`}>
                <p className="text-sm font-medium text-light-text dark:text-dark-text">
                  {isReviewed
                    ? 'You have submitted your recommendation. Awaiting admin decision.'
                    : `This application has been ${app.status.toLowerCase()} by the admin.`
                  }
                </p>
              </div>
            )}
          </div>

          {/* ── Right: application details ── */}
          <div className="md:col-span-2 space-y-4">

            {/* Child details */}
            <Section title="Child's Details" icon={<FiUser className="w-4 h-4" />}>
              <DetailRow label="Full name"       value={`${app.childFirstName} ${app.childLastName}`} />
              <DetailRow label="Date of birth"   value={app.childDob}      />
              <DetailRow label="ID number"       value={app.childIdNumber} />
              <DetailRow label="Grade applying"  value={app.gradeApplying} />
              <DetailRow label="School"          value={app.schoolName}    />
            </Section>

            {/* Parent contact */}
            <Section title="Parent / Guardian" icon={<FiUser className="w-4 h-4" />}>
              <DetailRow label="Full name"    value={`${app.parentFirstName} ${app.parentLastName}`} />
              <DetailRow label="Email"        value={app.parentEmail}   />
              <DetailRow label="Phone"        value={app.parentPhone}   />
              <DetailRow label="Relationship" value={app.relationship}  />
              <DetailRow label="Address"      value={app.address}       />
            </Section>

            {/* Documents — view only, no approve/decline */}
            <Section title="Submitted Documents" icon={<FiPaperclip className="w-4 h-4" />}>
              <p className="text-xs text-light-muted dark:text-dark-muted mb-3">
                Review all documents before submitting your recommendation.
              </p>
              {[
                { label: 'Birth Certificate',    path: app.birthCertificatePath },
                { label: 'Parent / Guardian ID', path: app.parentIdPath         },
                { label: 'Report Card',          path: app.reportCardPath       },
              ].map(doc => {
                // Extract just the filename from the full Windows path
                // e.g. "C:/SchoolApply/uploads/documents/birth-cert_uuid.pdf" → "birth-cert_uuid.pdf"
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
                      <button
                        onClick={async () => {
                          try {
                            const res  = await fetch(viewUrl, { headers })
                            if (!res.ok) throw new Error('File not found')
                            const blob = await res.blob()
                            const url  = URL.createObjectURL(blob)
                            window.open(url, '_blank')
                          } catch {
                            toast.error('Could not load document. Make sure the file exists on the server.')
                          }
                        }}
                        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <FiFileText className="w-3.5 h-3.5" />
                        View
                      </button>
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