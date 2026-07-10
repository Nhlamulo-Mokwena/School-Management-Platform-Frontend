import { RouterProvider, Route, Outlet, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import { useDarkMode } from './hooks/useDarkMode'
import { isLoggedIn } from './hooks/Auth'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/ReactToastify.css'  // fixed path — was missing /dist/

import Navbar  from './components/Navbar'
import Sidebar from './components/Sidebar'

import Home                    from './pages/HomePage'
import Login                   from './pages/LoginPage'
import Register                from './pages/RegisterPage'
import Dashboard               from './components/Dashboard'
import Apply                   from './pages/ApplicationPage'
import ParentApplications      from './pages/ParentApplicationPage'
import ChildInfo               from './pages/ChildInfoPage'
import AdminApplications       from './pages/AdminApplicationPage'
import AdminApplicationDetail  from './pages/AdminApplicationDetailPage'
import TeacherApplications     from './pages/TeacherApplicationPage'
import TeacherApplicationDetail from './pages/TeacherApplicationDetailPage'
import AdminUsers              from './pages/AdminUsersPage'
import NewsPage               from './pages/NewsPage'
import AdminPostNews          from './pages/AdminPostNewsPage'
import AdminManageNews from './pages/AdminManageNewsPage'

// ── Public layout ────────────────────────────────────────────────
function PublicLayout() {
  const { isDark, toggle } = useDarkMode()
  return (
    <>
      <Navbar isDark={isDark} toggle={toggle} />
      <Outlet />
    </>
  )
}

// ── Dashboard layout ─────────────────────────────────────────────
function DashboardLayout() {
  const { isDark, toggle } = useDarkMode()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoggedIn()) navigate('/login')
  }, [navigate])

  if (!isLoggedIn()) return null

  return (
    <div className="flex min-h-screen bg-light-bg dark:bg-dark-bg">
      <Sidebar isDark={isDark} toggle={toggle} />
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
        <Route path="news"     element={<NewsPage />} />
      </Route>

      {/* Dashboard pages — sidebar, no top navbar */}
      <Route element={<DashboardLayout />}>
        <Route path="dashboard"                              element={<Dashboard />}               />
        <Route path="dashboard/apply"                        element={<Apply />}                   />
        <Route path="dashboard/applications"                 element={<ParentApplications />}      />
        <Route path="dashboard/child"                        element={<ChildInfo />}               />
        <Route path="dashboard/admin/applications"           element={<AdminApplications />}       />
        <Route path="dashboard/admin/applications/:id"       element={<AdminApplicationDetail />}  />
        <Route path="dashboard/users"                        element={<AdminUsers />}              />
        <Route path="dashboard/teacher/applications"         element={<TeacherApplications />}     />
        <Route path="dashboard/teacher/applications/:id"     element={<TeacherApplicationDetail />}/>
        <Route path="/dashboard/admin/news/post"             element={<AdminPostNews />}            />
        <Route path="dashboard/admin/news/manage"            element={<AdminManageNews/>}           />
      </Route>
    </>
  )
)

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      {/* ToastContainer is here once at the root so toasts work on every page */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />
    </>
  )
}