import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  FiArrowLeft, FiSend, FiSave, FiEye, FiEyeOff
} from 'react-icons/fi'

const CATEGORIES = ['Announcement', 'Event', 'Update', 'General']

export default function AdminPostNews() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title:     '',
    content:   '',
    summary:   '',
    category:  '',
    published: false,  // false = save as draft, true = publish immediately
  })

  const [errors,    setErrors]    = useState({})
  const [loading,   setLoading]   = useState(false)
  const [preview,   setPreview]   = useState(false)  // toggles content preview

  const token   = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim())    e.title    = 'Title is required'
    if (!form.content.trim())  e.content  = 'Content is required'
    if (!form.category)        e.category = 'Please select a category'
    return e
  }

  // ── Save as draft ─────────────────────────────────────────────
  const handleSaveDraft = async () => {
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    await submit({ ...form, published: false }, 'Draft saved successfully.')
  }

  // ── Publish immediately ───────────────────────────────────────
  const handlePublish = async () => {
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    await submit({ ...form, published: true }, 'Post published successfully.')
  }

  // ── Shared submit logic ───────────────────────────────────────
  const submit = async (payload, successMessage) => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8080/api/news/admin', {
        method:  'POST',
        headers,
        body:    JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message ?? 'Failed to save post')
      }

      toast.success(successMessage)
      navigate('/dashboard/admin/news/manage')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
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
    <div className="min-h-full bg-light-bg dark:bg-dark-bg py-10 px-6">
      <div className="max-w-3xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard/admin/news')}
            className="w-9 h-9 rounded-lg flex items-center justify-center border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-light-text dark:text-dark-text">
              New Post
            </h1>
            <p className="text-light-muted dark:text-dark-muted text-sm mt-0.5">
              Write and publish a school news post.
            </p>
          </div>
        </div>

        <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6 md:p-8 space-y-6">

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Annual Sports Day 2025"
              className={inputClass('title')}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setForm(prev => ({ ...prev, category: cat }))
                    setErrors(prev => ({ ...prev, category: '' }))
                  }}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${form.category === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'
                    }
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
              Summary
              <span className="text-light-muted dark:text-dark-muted font-normal ml-1">
                (optional — auto-generated from content if left blank)
              </span>
            </label>
            <textarea
              name="summary"
              value={form.summary}
              onChange={handleChange}
              rows={2}
              placeholder="Short description shown on the news card..."
              className={`${inputClass('summary')} resize-none`}
            />
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-light-text dark:text-dark-text">
                Content <span className="text-red-500">*</span>
              </label>
              {/* Toggle between write and preview */}
              <button
                type="button"
                onClick={() => setPreview(p => !p)}
                className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                {preview ? <FiEyeOff className="w-3.5 h-3.5" /> : <FiEye className="w-3.5 h-3.5" />}
                {preview ? 'Edit' : 'Preview'}
              </button>
            </div>

            {preview ? (
              // Preview mode — renders the content as it will appear on the news page
              <div className="
                min-h-48 px-4 py-3 rounded-lg
                bg-light-bg dark:bg-dark-bg
                border border-light-border dark:border-dark-border
              ">
                {form.content.trim() ? (
                  form.content.split('\n').map((para, i) =>
                    para.trim()
                      ? <p key={i} className="text-sm text-light-text dark:text-dark-text leading-relaxed mb-3">{para}</p>
                      : <br key={i} />
                  )
                ) : (
                  <p className="text-light-muted dark:text-dark-muted text-sm italic">Nothing to preview yet...</p>
                )}
              </div>
            ) : (
              // Write mode
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                rows={12}
                placeholder="Write your full post here. Press Enter to start a new paragraph."
                className={`${inputClass('content')} resize-y`}
              />
            )}
            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
          </div>

          {/* Character count hint */}
          <p className="text-xs text-light-muted dark:text-dark-muted -mt-4">
            {form.content.length} characters
          </p>

          {/* ── Action buttons ── */}
          <div className="flex items-center justify-between pt-4 border-t border-light-border dark:border-dark-border">

            {/* Draft info */}
            <p className="text-xs text-light-muted dark:text-dark-muted">
              Save as draft to review before publishing.
            </p>

            <div className="flex gap-3">
              {/* Save as draft */}
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={loading}
                className="
                  flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold
                  border border-light-border dark:border-dark-border
                  text-light-text dark:text-dark-text
                  hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400
                  disabled:opacity-50 transition-colors
                "
              >
                <FiSave className="w-4 h-4" />
                Save Draft
              </button>

              {/* Publish */}
              <button
                type="button"
                onClick={handlePublish}
                disabled={loading}
                className="
                  flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold
                  text-white bg-blue-600 hover:bg-blue-700
                  disabled:opacity-50 transition-colors
                "
              >
                {loading
                  ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                  : <FiSend className="w-4 h-4" />
                }
                {loading ? 'Publishing...' : 'Publish Now'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}