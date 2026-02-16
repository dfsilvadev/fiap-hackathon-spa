import Sidebar from '../components/menu/sidebar'
import { Outlet } from 'react-router' // Certifique-se de que é 'react-router' ou 'react-router-dom'

const Base = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 flex-shrink-0">
        <Sidebar />
      </aside>

      <main className="flex-grow p-4">
        {/* O Outlet é o que "renderiza" a sua ContentsPage aqui dentro */}
        <Outlet />
      </main>
    </div>
  )
}

export default Base