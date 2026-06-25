import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserRole, isLoggedIn } from '../hooks/Auth'
import ParentDashboard from '../pages/ParentDashboardPage'
import AdminDashboard from '../pages/AdminDashboardPage'

// Dashboard is a "router" component — it doesn't render any UI itself.
// It checks who is logged in and which role they have, then renders
// the correct dashboard. This keeps each role's UI in its own file.
export default function Dashboard() {
  const navigate  = useNavigate()
  const role      = getUserRole()   // e.g. "ROLE_ADMIN" or "ROLE_PARENT"

  useEffect(() => {
    // If there's no valid token, redirect to login immediately.
    // This protects the dashboard from unauthenticated access.
    if (!isLoggedIn()) {
      navigate('/login')
    }
  }, [navigate])

  // While the effect runs on first render, don't flash anything
  if (!isLoggedIn()) return null

  // Render the correct dashboard based on role
  if (role === 'ROLE_ADMIN')  return <AdminDashboard />
  if (role === 'ROLE_PARENT') return <ParentDashboard />

  // Fallback for unexpected roles
  return (
    <div className="min-h-screen pt-16 bg-light-bg dark:bg-dark-bg flex items-center justify-center">
      <p className="text-light-muted dark:text-dark-muted">Unknown role. Please contact support.</p>
    </div>
  )
}