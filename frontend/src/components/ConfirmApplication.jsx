import { useState } from 'react'

// A reusable summary row — label on the left, value on the right
function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-light-border dark:border-dark-border last:border-0">
      <span className="text-sm text-light-muted dark:text-dark-muted">{label}</span>
      <span className="text-sm font-medium text-light-text dark:text-dark-text text-right max-w-xs">{value}</span>
    </div>
  )
}

// A reusable section card wrapping a group of summary rows
function SummarySection({ title, icon, children }) {
  return (
    <div className="bg-light-bg dark:bg-dark-bg rounded-xl p-4 mb-4">
      <h3 className="text-sm font-semibold text-light-text dark:text-dark-text flex items-center gap-2 mb-3">
        <span>{icon}</span> {title}
      </h3>
      {children}
    </div>
  )
}

export default function StepConfirmation({ data, onBack, onSubmit }) {
  const [loading,  setLoading]  = useState(false)
  const [agreed,   setAgreed]   = useState(false)  // declaration checkbox
  const [error,    setError]    = useState('')

  const handleSubmit = async () => {
    if (!agreed) {
      setError('Please confirm that the information provided is accurate.')
      return
    }
    setLoading(true)
    await onSubmit()
    setLoading(false)
  }

  return (
    <div>
      <h2 className="font-semibold text-lg text-light-text dark:text-dark-text mb-1">
        Review & Confirm
      </h2>
      <p className="text-light-muted dark:text-dark-muted text-sm mb-6">
        Please review all your information before submitting.
      </p>

      {/* ── Child's details summary ── */}
      <SummarySection title="Child's Details" icon="👦">
        <SummaryRow label="Full name"    value={`${data.childFirstName} ${data.childLastName}`} />
        <SummaryRow label="Date of birth" value={data.childDob} />
        <SummaryRow label="ID number"    value={data.childIdNumber} />
        <SummaryRow label="Grade"        value={data.gradeApplying} />
      </SummarySection>

      {/* ── Parent contact summary ── */}
      <SummarySection title="Parent / Guardian" icon="👤">
        <SummaryRow label="Full name"     value={`${data.parentFirstName} ${data.parentLastName}`} />
        <SummaryRow label="Email"         value={data.parentEmail} />
        <SummaryRow label="Phone"         value={data.parentPhone} />
        <SummaryRow label="Relationship"  value={data.relationship} />
        <SummaryRow label="Address"       value={data.address} />
      </SummarySection>

      {/* ── Documents summary ── */}
      <SummarySection title="Documents" icon="📎">
        {[
          { label: 'Birth Certificate',    file: data.birthCertificate },
          { label: 'Parent / Guardian ID', file: data.parentId         },
          { label: 'Report Card',          file: data.recentReportCard },
        ].map(doc => (
          <div key={doc.label} className="flex justify-between py-2.5 border-b border-light-border dark:border-dark-border last:border-0">
            <span className="text-sm text-light-muted dark:text-dark-muted">{doc.label}</span>
            {doc.file ? (
              <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
                {doc.file.name}
              </span>
            ) : (
              <span className="text-sm text-red-500">Missing</span>
            )}
          </div>
        ))}
      </SummarySection>

      {/* ── Declaration checkbox ── */}
      <div className={`
        flex items-start gap-3 p-4 rounded-xl border mt-2
        ${error
          ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
          : 'border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg'
        }
      `}>
        <input
          type="checkbox"
          id="declaration"
          checked={agreed}
          onChange={e => { setAgreed(e.target.checked); setError('') }}
          className="mt-0.5 w-4 h-4 accent-blue-600 cursor-pointer flex-shrink-0"
        />
        <label htmlFor="declaration" className="text-sm text-light-muted dark:text-dark-muted cursor-pointer leading-relaxed">
          I confirm that all the information and documents provided in this application
          are accurate and authentic. I understand that providing false information may
          result in the cancellation of the application.
        </label>
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}

      {/* ── Navigation ── */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          disabled={loading}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
        >
          ← Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          )}
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>
    </div>
  )
}