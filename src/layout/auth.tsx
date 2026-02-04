import { Outlet } from 'react-router'
import { Student } from '@phosphor-icons/react'

const Auth = () => {
  return (
    <div className="min-h-screen flex">
      <div className="bg-[#234BB5] w-1/2 flex flex-col justify-between p-16">
        <div className="flex flex-row">
          <div className="flex items-center gap-4">
            <div className="bg-[#4F6FC4] w-10 h-10 flex items-center justify-center rounded-xl">
              <Student size={24} color="white" />
            </div>
            <h1 className="text-white text-xl font-bold">EduPlatform</h1>
          </div>
        </div>
        <div className="flex flex-col gap-6 max-w-3xl">
          <h1 className="text-white text-left text-4xl font-bold">
            Aprendizado adaptativo para cada aluno
          </h1>
          <p className="text-white text-left text-md font-light">
            Trilhas personalizadas, avaliações inteligentes e recomendações que se adaptam ao ritmo
            de cada estudante.
          </p>
        </div>
        <p className="text-white text-sm font-light">
          © 2024 EduPlatform. Todos os direitos reservados.
        </p>
      </div>
      <div className="w-1/2">
        <Outlet />
      </div>
    </div>
  )
}

export default Auth
