import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StepChildDetails   from '../components/ChildDetailForm'
import StepParentContact  from '../components/ParentContactDetailForm'
import StepDocuments      from '../components/DocumentsDetailForm'
import StepConfirmation   from '../components/ConfirmApplication'
import { toast } from 'react-toastify'

// The steps in order — label is shown in the progress bar
const STEPS = [
  { id: 1, label: "Child's Details"  },
  { id: 2, label: 'Parent Contact'   },
  { id: 3, label: 'Documents'        },
  { id: 4, label: 'Confirmation'     },
]

// Apply.jsx owns all the form data and the current step.
// Each step component receives the data + an onNext callback.
// This keeps each step simple — they just fill in their section
// and call onNext when done.
export default function Apply() {
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState(1)

  // All form data lives here in one object.
  // Each step merges its fields in when it calls onNext.
  const [formData, setFormData] = useState({
    // Step 1 — child
    childFirstName: '',
    childLastName:  '',
    childDob:       '',
    childIdNumber:  '',
    gradeApplying:  '',
    // Step 2 — parent
    parentFirstName: '',
    parentLastName:  '',
    parentEmail:     '',
    parentPhone:     '',
    relationship:    '',
    address:         '',
    // Step 3 — documents
    birthCertificate: null,
    parentId:         null,
    recentReportCard: null,
  })

  // Called by each step with its filled-in fields.
  // Merges into formData and advances to the next step.
  const handleNext = (stepData) => {
    setFormData(prev => ({ ...prev, ...stepData }))
    setCurrentStep(prev => prev + 1)
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  // Called from the confirmation page when the parent hits Submit.
  // The backend expects multipart/form-data with two kinds of parts:
  //   - "data"             → JSON string of all the form fields
  //   - "birthCertificate" → the actual File object
  //   - "parentId"         → the actual File object
  //   - "reportCard"       → the actual File object
  // We use FormData to bundle all of these into one request.
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token')

      // Build the JSON payload — only the text fields, no files
      const jsonData = {
        childFirstName:  formData.childFirstName,
        childLastName:   formData.childLastName,
        childDob:        formData.childDob,         // "2013-04-15" — matches LocalDate on backend
        childIdNumber:   formData.childIdNumber,
        gradeApplying:   formData.gradeApplying,
        parentFirstName: formData.parentFirstName,
        parentLastName:  formData.parentLastName,
        parentEmail:     formData.parentEmail,
        parentPhone:     formData.parentPhone,
        relationship:    formData.relationship,
        address:         formData.address,
        schoolName:      formData.schoolName ?? '', // add schoolName to formData if not yet present
      }

      // FormData lets us send JSON + files in one multipart request.
      // The backend uses @RequestPart to read each named part separately.
      const payload = new FormData()

      // "data" part — must be a Blob with type application/json so Spring
      // knows to deserialize it as ApplicationRequest, not a plain string.
      payload.append('data', new Blob([JSON.stringify(jsonData)], {
        type: 'application/json'
      }))

      // File parts — names must match @RequestPart("...") in the controller
      payload.append('birthCertificate', formData.birthCertificate)
      payload.append('parentId',         formData.parentId)
      payload.append('reportCard',       formData.recentReportCard)

      const res = await fetch('http://localhost:8080/api/applications/submit', {
        method: 'POST',
        headers: {
          // Do NOT set Content-Type manually for multipart/form-data —
          // the browser sets it automatically with the correct boundary string.
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      })

      if (!res.ok) {
        // Try to read the error message from the response body
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message ?? 'Submission failed')
      }

      // Navigate to applications page so the parent sees their new submission
      toast.success('Application successfully submited!');
      navigate('/dashboard/applications')

    } catch (err) {
      toast.error('Submission failed. Please try again.')
    }
  }

  return (
    <div className="min-h-full bg-light-bg dark:bg-dark-bg py-10 px-6">
      <div className="max-w-2xl mx-auto">

        {/* ── Page header ── */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-light-text dark:text-dark-text">
            New Application
          </h1>
          <p className="text-light-muted dark:text-dark-muted text-sm mt-1">
            Complete all steps to submit your school application.
          </p>
        </div>

        {/* ── Step progress bar ── */}
        <div className="flex items-center mb-10">
          {STEPS.map((step, i) => {
            const isCompleted = currentStep > step.id
            const isActive    = currentStep === step.id
            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">

                {/* Circle + label */}
                <div className="flex flex-col items-center gap-1">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                    transition-colors
                    ${isCompleted
                      ? 'bg-green-500 text-white'          // done — green tick
                      : isActive
                        ? 'bg-blue-600 text-white'         // current — blue
                        : 'bg-light-border dark:bg-dark-border text-light-muted dark:text-dark-muted'
                    }
                  `}>
                    {isCompleted
                      ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                        </svg>
                      : step.id
                    }
                  </div>
                  <span className={`text-xs font-medium hidden sm:block
                    ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-light-muted dark:text-dark-muted'}
                  `}>
                    {step.label}
                  </span>
                </div>

                {/* Connector line between steps */}
                {i < STEPS.length - 1 && (
                  <div className={`
                    flex-1 h-0.5 mx-2 mb-4 transition-colors
                    ${currentStep > step.id
                      ? 'bg-green-500'
                      : 'bg-light-border dark:bg-dark-border'
                    }
                  `}/>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Step content card ── */}
        <div className="
          bg-light-surface dark:bg-dark-surface
          border border-light-border dark:border-dark-border
          rounded-2xl p-6 md:p-8
        ">
          {currentStep === 1 && (
            <StepChildDetails
              data={formData}
              onNext={handleNext}
            />
          )}
          {currentStep === 2 && (
            <StepParentContact
              data={formData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <StepDocuments
              data={formData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 4 && (
            <StepConfirmation
              data={formData}
              onBack={handleBack}
              onSubmit={handleSubmit}
            />
          )}
        </div>

      </div>
    </div>
  )
}