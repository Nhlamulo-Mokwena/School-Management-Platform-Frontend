import { useState } from 'react'

// Documents required — label shown to the user, key matches formData field
const REQUIRED_DOCS = [
  {
    key:         'birthCertificate',
    label:       'Birth Certificate',
    description: 'Unabridged or abridged birth certificate of the child.',
    accept:      '.pdf,.jpg,.jpeg,.png',
  },
  {
    key:         'parentId',
    label:       'Parent / Guardian ID',
    description: 'SA ID document or passport of the parent or guardian.',
    accept:      '.pdf,.jpg,.jpeg,.png',
  },
  {
    key:         'recentReportCard',
    label:       'Most Recent Report Card',
    description: 'Latest school report (not older than 1 year).',
    accept:      '.pdf,.jpg,.jpeg,.png',
  },
]

export default function StepDocuments({ data, onNext, onBack }) {
  // files holds the actual File objects selected by the user
  const [files, setFiles] = useState({
    birthCertificate: data.birthCertificate ?? null,
    parentId:         data.parentId         ?? null,
    recentReportCard: data.recentReportCard ?? null,
  })

  const [errors, setErrors] = useState({})

  const handleFileChange = (key, e) => {
    const file = e.target.files[0] ?? null
    setFiles(prev => ({ ...prev, [key]: file }))
    setErrors(prev => ({ ...prev, [key]: '' }))
  }

  const validate = () => {
    const e = {}
    // All three documents are required
    REQUIRED_DOCS.forEach(doc => {
      if (!files[doc.key]) e[doc.key] = `${doc.label} is required`
    })
    return e
  }

  const handleNext = () => {
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    onNext(files)
  }

  return (
    <div>
      <h2 className="font-semibold text-lg text-light-text dark:text-dark-text mb-1">
        Document Uploads
      </h2>
      <p className="text-light-muted dark:text-dark-muted text-sm mb-6">
        Upload clear copies. Accepted formats: PDF, JPG, PNG.
      </p>

      <div className="space-y-5">
        {REQUIRED_DOCS.map(doc => (
          <div key={doc.key}>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
              {doc.label} <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-light-muted dark:text-dark-muted mb-2">{doc.description}</p>

            {/* Custom file upload area */}
            <label className={`
              flex flex-col items-center justify-center w-full px-4 py-5 rounded-xl cursor-pointer
              border-2 border-dashed transition-colors
              ${errors[doc.key]
                ? 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/10'
                : files[doc.key]
                  ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/10'
                  : 'border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10'
              }
            `}>
              <input
                type="file"
                accept={doc.accept}
                onChange={e => handleFileChange(doc.key, e)}
                className="hidden"
              />

              {files[doc.key] ? (
                // Show filename when a file is selected
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>
                  <span className="text-sm font-medium truncate max-w-xs">{files[doc.key].name}</span>
                </div>
              ) : (
                // Upload prompt
                <div className="text-center">
                  <svg className="w-8 h-8 text-light-muted dark:text-dark-muted mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                  <p className="text-sm text-light-muted dark:text-dark-muted">
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-light-muted dark:text-dark-muted mt-1">PDF, JPG or PNG</p>
                </div>
              )}
            </label>

            {errors[doc.key] && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors[doc.key]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Next: Review & Confirm →
        </button>
      </div>
    </div>
  )
}