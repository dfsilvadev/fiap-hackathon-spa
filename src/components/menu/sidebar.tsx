import { Link, useLocation } from 'react-router-dom'
import { RolesRoutes } from '@/router/private/rolesRoutes'
import { SignOut } from '@phosphor-icons/react'

export default function Sidebar() {
  const location = useLocation()

  return (
    <div className="flex h-full flex-col bg-white border-r border-slate-200">
      <div className="p-6">
        <div className="flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            E
          </div>
          <span className="text-xl font-bold text-slate-900">EduPlatform</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {RolesRoutes.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors">
          <SignOut size={20} weight="bold" />
          Sair da conta
        </button>
      </div>
    </div>
  )
}