import { Outlet } from 'react-router'
import Sidebar from '../components/menu/sidebar'

const Base = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 flex-shrink-0">
        <Sidebar />
      </aside>

      <main className="flex-grow p-4">
        <Outlet />
      </main>
    </div>
  )
}

export default Base
