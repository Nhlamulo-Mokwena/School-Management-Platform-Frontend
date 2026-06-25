import { RouterProvider, Route, Outlet, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import { useDarkMode } from './hooks/UseDarkmode'
import { isLoggedIn } from './hooks/Auth'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

import Navbar  from './components/Navbar'
import Sidebar from './components/Sidebar'

import Home      from './pages/HomePage'
import Login     from './pages/LoginPage'
import Register  from './pages/RegisterPage'
import Dashboard from './components/Dashboard'
import Apply     from './pages/ApplicationPage'
import ParentApplications from './pages/ParentApplicationPage'
import ChildInfo from './pages/ChildInfoPage'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/ReactToastify.css'

// ── Public layout ────────────────────────────────────────────────
// Used for Home, Login, Register — shows the top Navbar only.
function PublicLayout() {
  const { isDark, toggle } = useDarkMode()
  return (
    <>
      <Navbar isDark={isDark} toggle={toggle} />
      <Outlet />
      <ToastContainer/>
    </>
  )
}

// ── Dashboard layout ─────────────────────────────────────────────
// Used for all /dashboard/* routes.
// Shows the Sidebar instead of the top Navbar.
// Redirects to /login if no valid token is found.
function DashboardLayout() {
  const { isDark, toggle } = useDarkMode()
  const navigate = useNavigate()

  useEffect(() => {
    // Guard: if the user is not logged in, send them to login
    if (!isLoggedIn()) navigate('/login')
  }, [navigate])

  if (!isLoggedIn()) return null

  return (
    // flex row: sidebar on the left, page content on the right
    <div className="flex min-h-screen bg-light-bg dark:bg-dark-bg">
      <Sidebar isDark={isDark} toggle={toggle} />
      {/* Main content area — takes up remaining space */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}

// ── Router ───────────────────────────────────────────────────────
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public pages — top navbar */}
      <Route element={<PublicLayout />}>
        <Route index           element={<Home />}     />
        <Route path="login"    element={<Login />}    />
        <Route path="register" element={<Register />} />
      </Route>

      {/* Dashboard pages — sidebar, no top navbar */}
      <Route element={<DashboardLayout />}>
        <Route path="dashboard"       element={<Dashboard />} />
        <Route path="dashboard/apply" element={<Apply />}     />
        <Route path="dashboard/applications" element={<ParentApplications />} />
        <Route path="dashboard/child" element={<ChildInfo />}    />
        {/* Add more protected routes here as you build them:
            <Route path="dashboard/applications" element={<Applications />} />
            <Route path="dashboard/child"        element={<ChildInfo />}    />
            <Route path="dashboard/users"        element={<Users />}        />
        */}
      </Route>
    </>
  )
)

export default function App() {
  return <RouterProvider router={router} />
}