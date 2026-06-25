import React from 'react'
import { ToastContainer } from 'react-toastify'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div>
        <ToastContainer/>
        <Outlet/>
    </div>
  )
}

export default MainLayout