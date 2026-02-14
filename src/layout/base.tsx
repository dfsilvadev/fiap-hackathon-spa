import Sidebar from '../components/menu/sidebar'
import { Outlet } from 'react-router'

const Base = () => {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 flex-shrink-0">
        <Sidebar />
      </aside>

      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  )
}

export default Base
