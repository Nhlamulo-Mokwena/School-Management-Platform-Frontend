import { useState } from 'react'

// ── Mock data ─────────────────────────────────────────────────────
// Replace with: fetch('/api/children', {
//   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
// })
const MOCK_CHILDREN = [
  {
    id:           1,
    firstName:    'Sipho',
    lastName:     'Mokwena',
    dob:          '2013-04-15',
    idNumber:     '1304155800087',
    gender:       'Male',
    grade:        'Grade 7',
    homeLanguage: 'Sepedi',
    medicalNotes: 'No known allergies.',
  },
  {
    id:           2,
    firstName:    'Lerato',
    lastName:     'Mokwena',
    dob:          '2016-08-22',
    idNumber:     '1608225800083',
    gender:       'Female',
    grade:        'Grade 4',
    homeLanguage: 'Sepedi',
    medicalNotes: 'Mild asthma — has an inhaler.',
  },
]

const GRADES = [
  'Grade R', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4',
  'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9',
  'Grade 10', 'Grade 11', 'Grade 12',
]

const LANGUAGES = [
  'Zulu', 'Xhosa', 'Afrikaans', 'English', 'Sepedi',
  'Tswana', 'Sotho', 'Tsonga', 'Swati', 'Venda', 'Ndebele',
]

const GENDERS = ['Male', 'Female', 'Prefer not to say']

const EMPTY_CHILD = {
  firstName: '', lastName: '', dob: '', idNumber: '',
  gender: '', grade: '', homeLanguage: '', medicalNotes: '',
}

// ── Child avatar initials ─────────────────────────────────────────
function Avatar({ child, size = 'md' }) {
  const initials = `${child.firstName.charAt(0)}${child.lastName.charAt(0)}`
  const sizes = { sm: 'w-10 h-10 text-sm', md: 'w-14 h-14 text-lg' }
  return (
    <div className={`${sizes[size]} rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0`}>
      <span className="text-white font-bold">{initials}</span>
    </div>
  )
}

// ── Child form — used for both Add and Edit ───────────────────────
function ChildForm({ initial, onSave, onCancel, saving }) {
  const [form,   setForm]   = useState(initial)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.firstName)    e.firstName    = 'First name is required'
    if (!form.lastName)     e.lastName     = 'Last name is required'
    if (!form.dob)          e.dob          = 'Date of birth is required'
    if (!form.idNumber)     e.idNumber     = 'ID number is required'
    else if (form.idNumber.length !== 13)  e.idNumber = 'Must be 13 digits'
    if (!form.gender)       e.gender       = 'Required'
    if (!form.grade)        e.grade        = 'Required'
    if (!form.homeLanguage) e.homeLanguage = 'Required'
    return e
  }

  const handleSubmit = () => {
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    onSave(form)
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
    <div className="space-y-5">

      <p className="text-xs font-semibold text-light-muted dark:text-dark-muted uppercase tracking-widest">
        Personal Details
      </p>

      {/* Name row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">First name</label>
          <input type="text" name="firstName" value={form.firstName}
            onChange={handleChange} placeholder="Sipho" className={inputClass('firstName')} />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">Last name</label>
          <input type="text" name="lastName" value={form.lastName}
            onChange={handleChange} placeholder="Mokwena" className={inputClass('lastName')} />
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
        </div>
      </div>

      {/* DOB + Gender */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">Date of birth</label>
          <input type="date" name="dob" value={form.dob}
            onChange={handleChange} className={inputClass('dob')} />
          {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">Gender</label>
          <select name="gender" value={form.gender} onChange={handleChange} className={inputClass('gender')}>
            <option value="">Select</option>
            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
        </div>
      </div>

      {/* ID Number */}
      <div>
        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">SA ID number</label>
        <input type="text" name="idNumber" value={form.idNumber}
          onChange={handleChange} maxLength={13} placeholder="13-digit ID number"
          className={inputClass('idNumber')} />
        {errors.idNumber && <p className="text-red-500 text-xs mt-1">{errors.idNumber}</p>}
      </div>

      <p className="text-xs font-semibold text-light-muted dark:text-dark-muted uppercase tracking-widest pt-2">
        School Details
      </p>

      {/* Grade + Language */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">Current grade</label>
          <select name="grade" value={form.grade} onChange={handleChange} className={inputClass('grade')}>
            <option value="">Select grade</option>
            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          {errors.grade && <p className="text-red-500 text-xs mt-1">{errors.grade}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">Home language</label>
          <select name="homeLanguage" value={form.homeLanguage} onChange={handleChange} className={inputClass('homeLanguage')}>
            <option value="">Select language</option>
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          {errors.homeLanguage && <p className="text-red-500 text-xs mt-1">{errors.homeLanguage}</p>}
        </div>
      </div>

      <p className="text-xs font-semibold text-light-muted dark:text-dark-muted uppercase tracking-widest pt-2">
        Medical Notes
      </p>

      <div>
        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
          Allergies / medical conditions
          <span className="text-light-muted dark:text-dark-muted font-normal ml-1">(optional)</span>
        </label>
        <textarea name="medicalNotes" value={form.medicalNotes} onChange={handleChange}
          rows={3} placeholder="e.g. Asthmatic, allergic to penicillin..."
          className={`${inputClass('medicalNotes')} resize-none`} />
      </div>

      {/* Form actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-light-border dark:border-dark-border">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:border-red-400 hover:text-red-500 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {saving && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          )}
          {saving ? 'Saving...' : 'Save Child'}
        </button>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────
export default function ChildInfo() {
  const [children,    setChildren]    = useState(MOCK_CHILDREN)
  const [mode,        setMode]        = useState('list')   // 'list' | 'add' | 'edit'
  const [activeChild, setActiveChild] = useState(null)     // child being edited
  const [saving,      setSaving]      = useState(false)
  const [savedId,     setSavedId]     = useState(null)     // shows success badge on card
  const [deleteId,    setDeleteId]    = useState(null)     // confirms deletion

  // ── Add new child ──────────────────────────────────────────────
  const handleAdd = async (formData) => {
    setSaving(true)
    try {
      // TODO: POST /api/children
      // const res = await fetch('/api/children', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      //   body: JSON.stringify(formData),
      // })
      // const newChild = await res.json()
      await new Promise(r => setTimeout(r, 800))
      const newChild = { ...formData, id: Date.now() }
      setChildren(prev => [...prev, newChild])
      setSavedId(newChild.id)
      setMode('list')
      setTimeout(() => setSavedId(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  // ── Update existing child ──────────────────────────────────────
  const handleEdit = async (formData) => {
    setSaving(true)
    try {
      // TODO: PUT /api/children/{activeChild.id}
      await new Promise(r => setTimeout(r, 800))
      setChildren(prev => prev.map(c => c.id === activeChild.id ? { ...formData, id: c.id } : c))
      setSavedId(activeChild.id)
      setMode('list')
      setActiveChild(null)
      setTimeout(() => setSavedId(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  // ── Delete child ───────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      // TODO: DELETE /api/children/{id}
      await new Promise(r => setTimeout(r, 500))
      setChildren(prev => prev.filter(c => c.id !== id))
      setDeleteId(null)
    } catch {
      alert('Failed to remove child. Please try again.')
    }
  }

  // ── List view ──────────────────────────────────────────────────
  if (mode === 'list') return (
    <div className="min-h-full bg-light-bg dark:bg-dark-bg py-10 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-light-text dark:text-dark-text">
              Children
            </h1>
            <p className="text-light-muted dark:text-dark-muted text-sm mt-1">
              Manage your children's details. These pre-fill new applications.
            </p>
          </div>
          <button
            onClick={() => setMode('add')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Add Child
          </button>
        </div>

        {/* Children cards */}
        {children.length === 0 ? (
          <div className="text-center py-16 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl">
            <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <p className="text-light-text dark:text-dark-text font-medium mb-1">No children added yet</p>
            <p className="text-light-muted dark:text-dark-muted text-sm mb-4">Add a child to get started with applications.</p>
            <button
              onClick={() => setMode('add')}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Add First Child
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {children.map(child => (
              <div
                key={child.id}
                className={`
                  bg-light-surface dark:bg-dark-surface
                  border rounded-2xl p-5 transition-all
                  ${savedId === child.id
                    ? 'border-green-400 dark:border-green-600'
                    : 'border-light-border dark:border-dark-border'
                  }
                `}
              >
                {/* Card header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar child={child} size="sm" />
                    <div>
                      <p className="font-semibold text-light-text dark:text-dark-text">
                        {child.firstName} {child.lastName}
                      </p>
                      <p className="text-xs text-light-muted dark:text-dark-muted">
                        {child.grade} · DOB: {child.dob}
                      </p>
                    </div>
                  </div>

                  {/* Saved badge or action buttons */}
                  {savedId === child.id ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                      </svg>
                      Saved
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      {/* Edit */}
                      <button
                        onClick={() => { setActiveChild(child); setMode('edit') }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-light-muted dark:text-dark-muted hover:bg-light-bg dark:hover:bg-dark-bg hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => setDeleteId(child.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-light-muted dark:text-dark-muted hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Gender',        value: child.gender       },
                    { label: 'ID Number',     value: child.idNumber     },
                    { label: 'Home Language', value: child.homeLanguage },
                    { label: 'Medical',       value: child.medicalNotes || '—' },
                  ].map(item => (
                    <div key={item.label} className="bg-light-bg dark:bg-dark-bg rounded-lg px-3 py-2">
                      <p className="text-xs text-light-muted dark:text-dark-muted">{item.label}</p>
                      <p className="text-xs font-medium text-light-text dark:text-dark-text mt-0.5 truncate">{item.value}</p>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-light-muted dark:text-dark-muted mt-6 text-center">
          Changes here do not update already submitted applications.
        </p>

      </div>

      {/* ── Delete confirmation modal ── */}
      {deleteId && (
        <>
          <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40" onClick={() => setDeleteId(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </div>
              <h3 className="font-semibold text-light-text dark:text-dark-text text-center mb-2">Remove Child?</h3>
              <p className="text-sm text-light-muted dark:text-dark-muted text-center mb-6">
                This will remove the child's profile. Submitted applications will not be affected.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  )

  // ── Add / Edit form view ───────────────────────────────────────
  return (
    <div className="min-h-full bg-light-bg dark:bg-dark-bg py-10 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => { setMode('list'); setActiveChild(null) }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-light-muted dark:text-dark-muted hover:bg-light-surface dark:hover:bg-dark-surface border border-light-border dark:border-dark-border transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-light-text dark:text-dark-text">
              {mode === 'add' ? 'Add a Child' : `Edit — ${activeChild.firstName} ${activeChild.lastName}`}
            </h1>
            <p className="text-light-muted dark:text-dark-muted text-sm mt-0.5">
              {mode === 'add' ? 'Fill in your child\'s details below.' : 'Update the details below.'}
            </p>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6 md:p-8">
          <ChildForm
            initial={mode === 'add' ? EMPTY_CHILD : activeChild}
            onSave={mode === 'add' ? handleAdd : handleEdit}
            onCancel={() => { setMode('list'); setActiveChild(null) }}
            saving={saving}
          />
        </div>

      </div>
    </div>
  )
}