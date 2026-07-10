import { useState, useEffect } from 'react'
import { getCurrentUser } from '../hooks/Auth'
import {
  FiUsers, FiSearch, FiAlertCircle, FiTrash2, FiEdit2
} from 'react-icons/fi'

const ROLE_MAP = {
  ROLE_PARENT:  { label: 'Parent',  color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'         },
  ROLE_TEACHER: { label: 'Teacher', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  ROLE_ADMIN:   { label: 'Admin',   color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'             },
}

const ROLE_OPTIONS = ['PARENT', 'TEACHER', 'ADMIN']

export default function AdminUsers() {
  const currentUser = getCurrentUser()  // decoded JWT — used to block self-edit/delete

  const [users,        setUsers]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [search,       setSearch]       = useState('')
  const [filterRole,   setFilterRole]   = useState('ALL')
  const [editingId,    setEditingId]    = useState(null)  // user being role-edited
  const [savingId,     setSavingId]     = useState(null)  // user currently saving
  const [deleteTarget, setDeleteTarget] = useState(null)  // user pending delete confirmation

  const token   = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  // ── Fetch all users ───────────────────────────────────────────
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/users', { headers })
        if (!res.ok) throw new Error('Failed to load users')
        const data = await res.json()
        setUsers(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  // ── Change a user's role ──────────────────────────────────────
  // PATCH /api/users/{id}/role
  const handleRoleChange = async (id, newRole) => {
    setSavingId(id)
    try {
      const res = await fetch(`http://localhost:8080/api/users/${id}/role`, {
        method:  'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ role: newRole }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message ?? 'Failed to update role')
      }

      const updated = await res.json()
      setUsers(prev => prev.map(u => u.id === id ? updated : u))
      setEditingId(null)
    } catch (err) {
      alert(err.message)
    } finally {
      setSavingId(null)
    }
  }

  // ── Delete a user ─────────────────────────────────────────────
  // DELETE /api/users/{id}
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/api/users/${id}`, {
        method:  'DELETE',
        headers,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message ?? 'Failed to delete user')
      }

      setUsers(prev => prev.filter(u => u.id !== id))
      setDeleteTarget(null)
    } catch (err) {
      alert(err.message)
    }
  }

  // ── Derived filtered list ─────────────────────────────────────
  const filtered = users.filter(u => {
    const matchesRole   = filterRole === 'ALL' || u.role === filterRole
    const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase())
    return matchesRole && matchesSearch
  })

  const roleCounts = {
    total:   users.length,
    parent:  users.filter(u => u.role === 'ROLE_PARENT').length,
    teacher: users.filter(u => u.role === 'ROLE_TEACHER').length,
    admin:   users.filter(u => u.role === 'ROLE_ADMIN').length,
  }

  if (loading) return (
    <div className="min-h-full bg-light-bg dark:bg-dark-bg flex items-center justify-center">
      <div className="flex items-center gap-3 text-light-muted dark:text-dark-muted">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        Loading users...
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-full bg-light-bg dark:bg-dark-bg flex items-center justify-center px-6">
      <div className="text-center">
        <FiAlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <p className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
          Try Again
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-full bg-light-bg dark:bg-dark-bg py-10 px-6">
      <div className="max-w-4xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-light-text dark:text-dark-text">
            Users
          </h1>
          <p className="text-light-muted dark:text-dark-muted text-sm mt-1">
            Manage registered parents, teachers, and admins.
          </p>
        </div>

        {/* ── Stats strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: roleCounts.total,   color: 'text-light-text dark:text-dark-text'  },
            { label: 'Parents',     value: roleCounts.parent,  color: 'text-blue-600 dark:text-blue-400'     },
            { label: 'Teachers',    value: roleCounts.teacher, color: 'text-purple-600 dark:text-purple-400' },
            { label: 'Admins',      value: roleCounts.admin,   color: 'text-red-600 dark:text-red-400'       },
          ].map(stat => (
            <div key={stat.label} className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-light-muted dark:text-dark-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Search + filter ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-muted dark:text-dark-muted" />
            <input
              type="text"
              placeholder="Search by email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="
                w-full pl-9 pr-4 py-2.5 rounded-lg text-sm
                bg-light-surface dark:bg-dark-surface
                text-light-text dark:text-dark-text
                border border-light-border dark:border-dark-border
                placeholder:text-light-muted dark:placeholder:text-dark-muted
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                transition-colors
              "
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['ALL', 'ROLE_PARENT', 'ROLE_TEACHER', 'ROLE_ADMIN'].map(r => (
              <button
                key={r}
                onClick={() => setFilterRole(r)}
                className={`
                  px-3 py-2 rounded-lg text-xs font-semibold transition-colors
                  ${filterRole === r
                    ? 'bg-blue-600 text-white'
                    : 'bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }
                `}
              >
                {r === 'ALL' ? 'All' : ROLE_MAP[r]?.label ?? r}
              </button>
            ))}
          </div>
        </div>

        {/* ── Users list ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl">
            <FiUsers className="w-10 h-10 text-light-muted dark:text-dark-muted mx-auto mb-3" />
            <p className="text-light-muted dark:text-dark-muted text-sm">No users match your search.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(u => {
              const roleBadge = ROLE_MAP[u.role] ?? { label: u.role, color: '' }
              const isSelf    = u.email === currentUser?.sub
              const isEditing = editingId === u.id
              const isSaving  = savingId === u.id

              return (
                <div
                  key={u.id}
                  className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4"
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">

                    {/* User identity */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {u.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-light-text dark:text-dark-text truncate">
                          {u.email}
                          {isSelf && <span className="ml-2 text-xs text-light-muted dark:text-dark-muted font-normal">(you)</span>}
                        </p>
                        <p className="text-xs text-light-muted dark:text-dark-muted">ID: {u.id}</p>
                      </div>
                    </div>

                    {/* Role badge or role selector */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isEditing ? (
                        <>
                          <select
                            defaultValue={u.role.replace('ROLE_', '')}
                            onChange={e => handleRoleChange(u.id, e.target.value)}
                            disabled={isSaving}
                            className="
                              text-xs px-2.5 py-1.5 rounded-lg
                              bg-light-bg dark:bg-dark-bg
                              text-light-text dark:text-dark-text
                              border border-light-border dark:border-dark-border
                              outline-none focus:ring-1 focus:ring-blue-500
                            "
                          >
                            {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                          <button
                            onClick={() => setEditingId(null)}
                            disabled={isSaving}
                            className="text-xs text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${roleBadge.color}`}>
                            {roleBadge.label}
                          </span>

                          {/* Edit role button — disabled for self */}
                          <button
                            onClick={() => setEditingId(u.id)}
                            disabled={isSelf}
                            title={isSelf ? "You can't change your own role" : 'Change role'}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-light-muted dark:text-dark-muted hover:bg-light-bg dark:hover:bg-dark-bg hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button — disabled for self */}
                          <button
                            onClick={() => setDeleteTarget(u)}
                            disabled={isSelf}
                            title={isSelf ? "You can't delete your own account" : 'Remove user'}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-light-muted dark:text-dark-muted hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <>
          <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40" onClick={() => setDeleteTarget(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <FiTrash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-semibold text-light-text dark:text-dark-text text-center mb-2">Remove User?</h3>
              <p className="text-sm text-light-muted dark:text-dark-muted text-center mb-6">
                This will permanently remove <span className="font-medium text-light-text dark:text-dark-text">{deleteTarget.email}</span>. This cannot be undone.
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
                  Remove
                </button>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  )
}