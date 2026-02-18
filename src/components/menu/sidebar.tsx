import { useNavigate, useLocation } from 'react-router'
import { UserCircle, SignOut } from '@phosphor-icons/react'
import { useAuth } from '../../hooks/useAuth'
import HorizontalLogo from '../logo/horizontalLogo'
import { Routes } from '../../router/constants/routesMap'
import { RolesRoutes, UserRole } from '../../router/private/rolesRoutes'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, me, logout } = useAuth()

  const filteredLinks = RolesRoutes.filter((link) =>
    me ? link.roles.includes(me.role as UserRole) : false
  )

  return (
    <div className="flex">
      <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-100 text-[#4B5563] flex flex-col">
        <div className="my-6 pb-4 border-b border-gray-150 px-5">
          <HorizontalLogo
            sizeIcon={24}
            sizeText={20}
            textColor="#000"
            iconColor="#FFFFFF"
            bgColor="#2563EB"
          />
        </div>

        <div className="px-5 flex-grow overflow-y-auto">
          <nav className="space-y-1">
            {filteredLinks.map((link) => {
              const isActive = location.pathname === link.path
              const IconComponent = link.icon

              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 font-medium text-sm
                    ${
                      isActive
                        ? 'bg-[#2563EB] text-white'
                        : 'text-gray-500 hover:bg-blue-50 hover:text-[#2563EB]'
                    }`}
                >
                  <IconComponent size={22} weight={isActive ? 'fill' : 'regular'} />
                  {link.label}
                </button>
              )
            })}
          </nav>
        </div>

        {me && (
          <button
            className="flex items-center gap-3 w-full p-4 border-t border-gray-200 bg-gray-50/50 hover:bg-gray-100 transition-colors"
            onClick={() => navigate(Routes.PERFIL)}
          >
            <div className="text-gray-400 flex-shrink-0">
              <UserCircle size={40} weight="light" />
            </div>

            <div className="flex flex-col items-start min-w-0 text-left">
              <p className="text-sm font-bold text-gray-900 truncate w-full leading-tight">
                {user?.name || 'Usuário'}
              </p>

              <p className="text-[11px] lowercase text-gray-500 truncate w-full leading-tight">
                {user?.email}
              </p>

              <span className="mt-1.5 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 rounded">
                {me.role}
              </span>
            </div>
          </button>
        )}

        <div className="px-5 pb-5 border-t border-gray-200">
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors font-semibold text-sm mt-2"
          >
            <SignOut size={24} weight="bold" />
            <span>Sair da conta</span>
          </button>
        </div>
      </aside>
    </div>
  )
}
