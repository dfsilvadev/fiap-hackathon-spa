import { useNavigate, useLocation } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { RolesRoutes, UserRole } from '../../router/private/rolesRoutes'
import { HorizontalLogo } from '../logo/horizontalLogo'
import { UserCircle, SignOut } from '@phosphor-icons/react'

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, me, logout } = useAuth()

  const filteredLinks = RolesRoutes.filter((item) => {
    if (!me?.role) return false

    return item.roles.includes(me.role as UserRole)
  })

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

        <div className="px-5 flex-grow">
          <nav className="space-y-1">
            {filteredLinks.map((link) => {
              const isActive = location.pathname === link.path

              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`w-full text-left block p-3 rounded-lg transition-all duration-200 font-medium text-sm
                    ${
                      isActive
                        ? 'bg-[#2563EB] text-white'
                        : 'hover:bg-blue-200 hover:text-[#2563EB]'
                    }`}
                >
                  {link.label}
                </button>
              )
            })}
          </nav>
        </div>

        {me && (
          <div className="flex items-center gap-3 p-5 border-t border-gray-150">
            <div className="text-gray-600 flex-shrink-0">
              <UserCircle size={40} />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-[12px] lowercase text-gray-500 truncate">{user?.email}</p>
              <span className="mt-0.5 w-fit px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 rounded">
                {me.role}
              </span>
            </div>
          </div>
        )}
        <div className=" border-b border-gray-150 px-5" />
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 text-left p-5 text-red-500 hover:bg-red-100 transition-colors font-medium text-sm"
        >
          <SignOut size={32} />
          Sair
        </button>
      </aside>
    </div>
  )
}

export default Sidebar
