import { useState } from 'react'

const RELATIONSHIPS = ['Mother', 'Father', 'Legal Guardian', 'Grandparent', 'Other']

export default function StepParentContact({ data, onNext, onBack }) {
  const [form, setForm] = useState({
    parentFirstName: data.parentFirstName,
    parentLastName:  data.parentLastName,
    parentEmail:     data.parentEmail,
    parentPhone:     data.parentPhone,
    relationship:    data.relationship,
    address:         data.address,
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.parentFirstName)                         e.parentFirstName = 'First name is required'
    if (!form.parentLastName)                          e.parentLastName  = 'Last name is required'
    if (!form.parentEmail)                             e.parentEmail     = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.parentEmail))   e.parentEmail     = 'Enter a valid email'
    if (!form.parentPhone)                             e.parentPhone     = 'Phone number is required'
    else if (!/^[0-9+\s]{10,15}$/.test(form.parentPhone)) e.parentPhone  = 'Enter a valid phone number'
    if (!form.relationship)                            e.relationship    = 'Please select your relationship'
    if (!form.address)                                 e.address         = 'Address is required'
    return e
  }

  const handleNext = () => {
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
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
        Parent / Guardian Contact
      </h2>
      <p className="text-light-muted dark:text-dark-muted text-sm mb-6">
        Your contact details so the school can reach you.
      </p>

      <div className="space-y-5">

        {/* Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">First name</label>
            <input type="text" name="parentFirstName" value={form.parentFirstName}
              onChange={handleChange} placeholder="Nhlamulo" className={inputClass('parentFirstName')} />
            {errors.parentFirstName && <p className="text-red-500 text-xs mt-1">{errors.parentFirstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">Last name</label>
            <input type="text" name="parentLastName" value={form.parentLastName}
              onChange={handleChange} placeholder="Mokwena" className={inputClass('parentLastName')} />
            {errors.parentLastName && <p className="text-red-500 text-xs mt-1">{errors.parentLastName}</p>}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">Email address</label>
          <input type="email" name="parentEmail" value={form.parentEmail}
            onChange={handleChange} placeholder="you@example.com" className={inputClass('parentEmail')} />
          {errors.parentEmail && <p className="text-red-500 text-xs mt-1">{errors.parentEmail}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">Phone number</label>
          <input type="tel" name="parentPhone" value={form.parentPhone}
            onChange={handleChange} placeholder="071 234 5678" className={inputClass('parentPhone')} />
          {errors.parentPhone && <p className="text-red-500 text-xs mt-1">{errors.parentPhone}</p>}
        </div>

        {/* Relationship */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
            Relationship to child
          </label>
          <select name="relationship" value={form.relationship}
            onChange={handleChange} className={inputClass('relationship')}>
            <option value="">Select relationship</option>
            {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          {errors.relationship && <p className="text-red-500 text-xs mt-1">{errors.relationship}</p>}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
            Residential address
          </label>
          <textarea
            name="address" value={form.address} onChange={handleChange}
            placeholder="123 Main Street, Pretoria, 0001"
            rows={3}
            className={`${inputClass('address')} resize-none`}
          />
          {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
        </div>

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
          Next: Documents →
        </button>
      </div>
    </div>
  )
}