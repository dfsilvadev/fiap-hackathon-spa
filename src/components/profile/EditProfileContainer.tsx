import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { User } from '../ui/user'

interface EditProfileContainerProps {
  children: (props: { initialValues: User }) => React.ReactNode
}

export function EditProfileContainer({ children }: EditProfileContainerProps) {
  const { user: authUser } = useAuth()

  if (!authUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f1f5f9]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-bold text-xl tracking-tight">
            Aguardando autenticação...
          </p>
        </div>
      </div>
    )
  }

  const initialValues: User = {
    ...authUser,
    name: authUser.name ?? '',
    email: authUser.email ?? '',
    dateOfBirth: authUser.dateOfBirth ? authUser.dateOfBirth.split('T')[0] : '',
    phone: authUser.phone ?? '',
    currentGrade: authUser.currentGrade ?? '',
    guardians: authUser.guardians ?? [],
  } as User

  return <>{children({ initialValues })}</>
}
