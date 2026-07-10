import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiCalendar, FiUser, FiTag, FiSearch, FiAlertCircle, FiArrowLeft, FiChevronRight } from 'react-icons/fi'

const CATEGORIES = ['All', 'Announcement', 'Event', 'Update', 'General']

const CATEGORY_COLORS = {
  Announcement: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Event:        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Update:       'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  General:      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
}

// Formats a LocalDateTime string from the backend e.g. "2025-03-01T10:30:00" → "01 Mar 2025"
function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-ZA', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

// ── News card shown in the list ───────────────────────────────────
function NewsCard({ post, onClick }) {
  const categoryColor = CATEGORY_COLORS[post.category] ?? CATEGORY_COLORS.General

  return (
    <div
      onClick={onClick}
      className="
        bg-light-surface dark:bg-dark-surface
        border border-light-border dark:border-dark-border
        rounded-2xl p-6 cursor-pointer group
        hover:border-blue-300 dark:hover:border-blue-700
        hover:shadow-md transition-all
      "
    >
      {/* Category badge */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 ${categoryColor}`}>
          <FiTag className="w-3 h-3" />
          {post.category}
        </span>
        <FiChevronRight className="w-4 h-4 text-light-muted dark:text-dark-muted opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Title */}
      <h3 className="font-display text-lg font-bold text-light-text dark:text-dark-text mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {post.title}
      </h3>

      {/* Summary */}
      <p className="text-light-muted dark:text-dark-muted text-sm leading-relaxed mb-4 line-clamp-3">
        {post.summary}
      </p>

      {/* Footer meta */}
      <div className="flex items-center gap-4 text-xs text-light-muted dark:text-dark-muted">
        <span className="flex items-center gap-1">
          <FiCalendar className="w-3.5 h-3.5" />
          {formatDate(post.createdAt)}
        </span>
        <span className="flex items-center gap-1">
          <FiUser className="w-3.5 h-3.5" />
          {post.postedBy}
        </span>
      </div>
    </div>
  )
}

// ── Full post detail view ─────────────────────────────────────────
function NewsDetail({ post, onBack }) {
  const categoryColor = CATEGORY_COLORS[post.category] ?? CATEGORY_COLORS.General

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-light-muted dark:text-dark-muted hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-8"
      >
        <FiArrowLeft className="w-4 h-4" />
        Back to News
      </button>

      {/* Category */}
      <span className={`text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1 mb-4 ${categoryColor}`}>
        <FiTag className="w-3 h-3" />
        {post.category}
      </span>

      {/* Title */}
      <h1 className="font-display text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text mb-4">
        {post.title}
      </h1>

      {/* Meta */}
      <div className="flex items-center gap-5 text-sm text-light-muted dark:text-dark-muted mb-8 pb-8 border-b border-light-border dark:border-dark-border">
        <span className="flex items-center gap-1.5">
          <FiCalendar className="w-4 h-4" />
          {formatDate(post.createdAt)}
        </span>
        <span className="flex items-center gap-1.5">
          <FiUser className="w-4 h-4" />
          Posted by {post.postedBy}
        </span>
      </div>

      {/* Content — preserve line breaks */}
      <div className="prose prose-sm max-w-none">
        {post.content.split('\n').map((paragraph, i) => (
          paragraph.trim() ? (
            <p key={i} className="text-light-text dark:text-dark-text leading-relaxed mb-4">
              {paragraph}
            </p>
          ) : <br key={i} />
        ))}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────
export default function NewsPage() {
  const navigate = useNavigate()

  const [posts,          setPosts]         = useState([])
  const [loading,        setLoading]       = useState(true)
  const [error,          setError]         = useState(null)
  const [search,         setSearch]        = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedPost,   setSelectedPost]  = useState(null)  // opens detail view

  // ── Fetch published posts — no token needed ───────────────────
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/news/public')
        if (!res.ok) throw new Error('Failed to load news')
        const data = await res.json()
        setPosts(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchNews()
  }, [])

  // ── Derived filtered list ─────────────────────────────────────
  const filtered = posts.filter(post => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory
    const q = search.toLowerCase()
    const matchesSearch =
      post.title.toLowerCase().includes(q) ||
      post.summary?.toLowerCase().includes(q) ||
      post.postedBy?.toLowerCase().includes(q)
    return matchesCategory && matchesSearch
  })

  // ── Detail view ───────────────────────────────────────────────
  if (selectedPost) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-6 bg-light-bg dark:bg-dark-bg">
        <NewsDetail post={selectedPost} onBack={() => setSelectedPost(null)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-6 bg-light-bg dark:bg-dark-bg">
      <div className="max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-12">
          <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold tracking-widest uppercase mb-3">
            Stay Informed
          </p>
          <h1 className="font-display text-4xl font-bold text-light-text dark:text-dark-text mb-4">
            School News & Affairs
          </h1>
          <p className="text-light-muted dark:text-dark-muted text-lg max-w-xl mx-auto">
            The latest announcements, events, and updates from SchoolApply partner schools.
          </p>
        </div>

        {/* ── Search ── */}
        <div className="relative max-w-md mx-auto mb-8">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-muted dark:text-dark-muted" />
          <input
            type="text"
            placeholder="Search news..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="
              w-full pl-9 pr-4 py-2.5 rounded-xl text-sm
              bg-light-surface dark:bg-dark-surface
              text-light-text dark:text-dark-text
              border border-light-border dark:border-dark-border
              placeholder:text-light-muted dark:placeholder:text-dark-muted
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
              transition-colors
            "
          />
        </div>

        {/* ── Category filter ── */}
        <div className="flex gap-2 flex-wrap justify-center mb-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${activeCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-3 text-light-muted dark:text-dark-muted">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Loading news...
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="text-center py-20">
            <FiAlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-light-muted dark:text-dark-muted text-sm">
              {posts.length === 0
                ? 'No news has been posted yet. Check back soon.'
                : 'No posts match your search.'
              }
            </p>
          </div>
        )}

        {/* ── News grid ── */}
        {!loading && !error && filtered.length > 0 && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(post => (
                <NewsCard
                  key={post.id}
                  post={post}
                  onClick={() => setSelectedPost(post)}
                />
              ))}
            </div>

            {/* Post count */}
            <p className="text-center text-xs text-light-muted dark:text-dark-muted mt-8">
              Showing {filtered.length} of {posts.length} posts
            </p>
          </>
        )}

      </div>
    </div>
  )
}