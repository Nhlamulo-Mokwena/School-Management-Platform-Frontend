import { useState } from 'react'

// Grade options for South African primary and high schools
const GRADES = [
  'Grade R', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4',
  'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9',
  'Grade 10', 'Grade 11', 'Grade 12',
]

export default function StepChildDetails({ data, onNext }) {
  const [form, setForm] = useState({
    childFirstName: data.childFirstName,
    childLastName:  data.childLastName,
    childDob:       data.childDob,
    childIdNumber:  data.childIdNumber,
    gradeApplying:  data.gradeApplying,
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.childFirstName) e.childFirstName = 'First name is required'
    if (!form.childLastName)  e.childLastName  = 'Last name is required'
    if (!form.childDob)       e.childDob       = 'Date of birth is required'
    if (!form.childIdNumber)  e.childIdNumber  = 'ID number is required'
    else if (form.childIdNumber.length !== 13) e.childIdNumber = 'SA ID number must be 13 digits'
    if (!form.gradeApplying)  e.gradeApplying  = 'Please select a grade'
    return e
  }

  const handleNext = () => {
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    // Pass this step's data up to Apply.jsx
    onNext(form)
  }

  const inputClass = (field) => `
    w-full px-4 py-2.5 rounded-lg text-sm
    bg-light-bg dark:bg-dark-bg
    text-light-text dark:text-dark-text
    border transition-colors outline-none
    placeholder:text-light-muted dark:placeholder:text-dark-muted
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${errors[field] ? 'border-red-400 dark:border-red-600' : 'border-light-border dark:border-dark-border'}
  `

  return (
    <div>
      <h2 className="font-semibold text-lg text-light-text dark:text-dark-text mb-1">
        Child's Details
      </h2>
      <p className="text-light-muted dark:text-dark-muted text-sm mb-6">
        Enter the details of the child you are applying for.
      </p>

      <div className="space-y-5">

        {/* First + Last name side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
              First name
            </label>
            <input
              type="text" name="childFirstName"
              value={form.childFirstName} onChange={handleChange}
              placeholder="Sipho" className={inputClass('childFirstName')}
            />
            {errors.childFirstName && <p className="text-red-500 text-xs mt-1">{errors.childFirstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
              Last name
            </label>
            <input
              type="text" name="childLastName"
              value={form.childLastName} onChange={handleChange}
              placeholder="Mokwena" className={inputClass('childLastName')}
            />
            {errors.childLastName && <p className="text-red-500 text-xs mt-1">{errors.childLastName}</p>}
          </div>
        </div>

        {/* Date of birth */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
            Date of birth
          </label>
          <input
            type="date" name="childDob"
            value={form.childDob} onChange={handleChange}
            className={inputClass('childDob')}
          />
          {errors.childDob && <p className="text-red-500 text-xs mt-1">{errors.childDob}</p>}
        </div>

        {/* SA ID number */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
            SA ID number
          </label>
          <input
            type="text" name="childIdNumber"
            value={form.childIdNumber} onChange={handleChange}
            placeholder="13-digit ID number" maxLength={13}
            className={inputClass('childIdNumber')}
          />
          {errors.childIdNumber && <p className="text-red-500 text-xs mt-1">{errors.childIdNumber}</p>}
        </div>

        {/* Grade applying for */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
            Grade applying for
          </label>
          <select
            name="gradeApplying" value={form.gradeApplying} onChange={handleChange}
            className={inputClass('gradeApplying')}
          >
            <option value="">Select a grade</option>
            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          {errors.gradeApplying && <p className="text-red-500 text-xs mt-1">{errors.gradeApplying}</p>}
        </div>

      </div>

      {/* Navigation */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleNext}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Next: Parent Contact →
        </button>
      </div>
    </div>
  )
}