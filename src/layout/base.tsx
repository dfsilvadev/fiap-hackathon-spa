import Sidebar from '../components/menu/sidebar'
import { Outlet } from 'react-router'

const Base = () => {
  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 ml-64 min-h-screen bg-[#f8fafc]">
        <Outlet />
      </div>
    </div>
  )
}

export default Base
