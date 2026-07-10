import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff,
  FiAlertCircle, FiFileText, FiTag, FiCalendar
} from 'react-icons/fi'

const CATEGORY_COLORS = {
  Announcement: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Event:        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Update:       'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  General:      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
}

const CATEGORIES = ['Announcement', 'Event', 'Update', 'General']

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-ZA', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

// ── Inline edit modal ─────────────────────────────────────────────
function EditModal({ post, onClose, onSave }) {
  const [form, setForm] = useState({
    title:     post.title,
    content:   post.content,
    summary:   post.summary ?? '',
    category:  post.category,
    published: post.published,
  })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim())   e.title    = 'Title is required'
    if (!form.content.trim()) e.content  = 'Content is required'
    if (!form.category)       e.category = 'Category is required'
    return e
  }

  const handleSubmit = async () => {
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:8080/api/news/admin/${post.id}`, {
        method:  'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to update post')
      const updated = await res.json()
      toast.success('Post updated successfully.')
      onSave(updated)
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
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
        <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border flex-shrink-0">
            <h2 className="font-semibold text-light-text dark:text-dark-text">Edit Post</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-light-muted dark:text-dark-muted hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">Title</label>
              <input type="text" name="title" value={form.title} onChange={handleChange} className={inputClass('title')} />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">Category</label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, category: cat }))}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
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
                Summary <span className="text-light-muted dark:text-dark-muted font-normal">(optional)</span>
              </label>
              <textarea name="summary" value={form.summary} onChange={handleChange}
                rows={2} className={`${inputClass('summary')} resize-none`} />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">Content</label>
              <textarea name="content" value={form.content} onChange={handleChange}
                rows={8} className={`${inputClass('content')} resize-y`} />
              {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
            </div>

            {/* Published toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="published"
                name="published"
                checked={form.published}
                onChange={handleChange}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
              <label htmlFor="published" className="text-sm text-light-text dark:text-dark-text cursor-pointer">
                Published — visible to the public
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-light-border dark:border-dark-border flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:border-red-400 hover:text-red-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────
export default function AdminManageNews() {
  const navigate = useNavigate()

  const [posts,       setPosts]       = useState([])
  const [stats,       setStats]       = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [filterTab,   setFilterTab]   = useState('ALL')  // 'ALL' | 'PUBLISHED' | 'DRAFT'
  const [editingPost, setEditingPost] = useState(null)   // post open in edit modal
  const [deleteTarget,setDeleteTarget]= useState(null)   // post pending delete confirm
  const [toggling,    setToggling]    = useState(null)   // id being toggled

  const token   = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  // ── Fetch all posts + stats ───────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [postsRes, statsRes] = await Promise.all([
          fetch('http://localhost:8080/api/news/admin/all',   { headers }),
          fetch('http://localhost:8080/api/news/admin/stats', { headers }),
        ])
        if (!postsRes.ok) throw new Error('Failed to load posts')
        setPosts(await postsRes.json())
        if (statsRes.ok) setStats(await statsRes.json())
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  // ── Toggle publish/unpublish ──────────────────────────────────
  const handleToggle = async (id) => {
    setToggling(id)
    try {
      const res = await fetch(`http://localhost:8080/api/news/admin/${id}/toggle`, {
        method: 'PATCH', headers,
      })
      if (!res.ok) throw new Error('Failed to toggle status')
      const updated = await res.json()
      setPosts(prev => prev.map(p => p.id === id ? updated : p))
      setStats(prev => prev ? {
        ...prev,
        published: updated.published ? prev.published + 1 : prev.published - 1,
        drafts:    updated.published ? prev.drafts - 1    : prev.drafts + 1,
      } : prev)
      toast.success(updated.published ? 'Post published.' : 'Post moved to drafts.')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setToggling(null)
    }
  }

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/api/news/admin/${id}`, {
        method: 'DELETE', headers,
      })
      if (!res.ok) throw new Error('Failed to delete post')
      setPosts(prev => prev.filter(p => p.id !== id))
      setStats(prev => prev ? { ...prev, total: prev.total - 1 } : prev)
      setDeleteTarget(null)
      toast.success('Post deleted.')
    } catch (err) {
      toast.error(err.message)
    }
  }

  // ── After edit save ───────────────────────────────────────────
  const handleEditSave = (updated) => {
    setPosts(prev => prev.map(p => p.id === updated.id ? updated : p))
    setEditingPost(null)
  }

  // ── Derived filtered list ─────────────────────────────────────
  const filtered = posts.filter(p => {
    if (filterTab === 'PUBLISHED') return p.published
    if (filterTab === 'DRAFT')     return !p.published
    return true
  })

  if (loading) return (
    <div className="min-h-full bg-light-bg dark:bg-dark-bg flex items-center justify-center">
      <div className="flex items-center gap-3 text-light-muted dark:text-dark-muted">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        Loading posts...
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-full bg-light-bg dark:bg-dark-bg flex items-center justify-center px-6">
      <div className="text-center">
        <FiAlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <p className="text-red-500 text-sm mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
          Try Again
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-full bg-light-bg dark:bg-dark-bg py-10 px-6">
      <div className="max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-light-text dark:text-dark-text">
              Manage News
            </h1>
            <p className="text-light-muted dark:text-dark-muted text-sm mt-1">
              Create, edit, publish or delete school news posts.
            </p>
          </div>
          <Link
            to="/dashboard/admin/news/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            New Post
          </Link>
        </div>

        {/* ── Stats strip ── */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Posts',  value: stats.total,     color: 'text-light-text dark:text-dark-text'  },
              { label: 'Published',   value: stats.published, color: 'text-green-600 dark:text-green-400'   },
              { label: 'Drafts',      value: stats.drafts,    color: 'text-yellow-600 dark:text-yellow-400' },
            ].map(stat => (
              <div key={stat.label} className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-light-muted dark:text-dark-muted mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Filter tabs ── */}
        <div className="flex gap-1 mb-6 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-1 w-fit">
          {[
            { key: 'ALL',       label: `All (${posts.length})`                       },
            { key: 'PUBLISHED', label: `Published (${posts.filter(p => p.published).length})`  },
            { key: 'DRAFT',     label: `Drafts (${posts.filter(p => !p.published).length})`    },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterTab(tab.key)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${filterTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Posts list ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl">
            <FiFileText className="w-10 h-10 text-light-muted dark:text-dark-muted mx-auto mb-3" />
            <p className="text-light-muted dark:text-dark-muted text-sm">No posts here yet.</p>
            <Link to="/dashboard/admin/news/new" className="inline-block mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Write your first post →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(post => {
              const categoryColor = CATEGORY_COLORS[post.category] ?? CATEGORY_COLORS.General
              const isToggling    = toggling === post.id

              return (
                <div
                  key={post.id}
                  className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-4">

                    {/* Post info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {/* Published / Draft badge */}
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${post.published ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                        {/* Category badge */}
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${categoryColor}`}>
                          <FiTag className="w-3 h-3" />
                          {post.category}
                        </span>
                      </div>

                      <h3 className="font-semibold text-light-text dark:text-dark-text mb-1 truncate">
                        {post.title}
                      </h3>

                      <p className="text-sm text-light-muted dark:text-dark-muted line-clamp-2 mb-3">
                        {post.summary}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-light-muted dark:text-dark-muted">
                        <span className="flex items-center gap-1">
                          <FiCalendar className="w-3.5 h-3.5" />
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">

                      {/* Toggle publish */}
                      <button
                        onClick={() => handleToggle(post.id)}
                        disabled={isToggling}
                        title={post.published ? 'Unpublish' : 'Publish'}
                        className={`
                          w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                          ${post.published
                            ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                            : 'text-light-muted dark:text-dark-muted hover:bg-light-bg dark:hover:bg-dark-bg hover:text-green-600 dark:hover:text-green-400'
                          }
                          disabled:opacity-40
                        `}
                      >
                        {isToggling
                          ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                          : post.published ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />
                        }
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => setEditingPost(post)}
                        title="Edit"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-light-muted dark:text-dark-muted hover:bg-light-bg dark:hover:bg-dark-bg hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteTarget(post)}
                        title="Delete"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-light-muted dark:text-dark-muted hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Edit modal ── */}
      {editingPost && (
        <EditModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSave={handleEditSave}
        />
      )}

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <>
          <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40" onClick={() => setDeleteTarget(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <FiTrash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-semibold text-light-text dark:text-dark-text text-center mb-2">Delete Post?</h3>
              <p className="text-sm text-light-muted dark:text-dark-muted text-center mb-6">
                "<span className="font-medium text-light-text dark:text-dark-text">{deleteTarget.title}</span>" will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteTarget.id)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  )
}