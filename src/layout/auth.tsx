import { Outlet } from 'react-router'
import HorizontalLogo from '../components/logo/horizontalLogo'

const Auth = () => {
  return (
    <div className="min-h-screen flex">
      <div className="bg-[#234BB5] w-1/2 flex flex-col justify-between pt-8 pl-8 pb-8 pr-32">
        <div className="flex flex-row">
          <HorizontalLogo sizeIcon={24} sizeText={20} />
        </div>
        <div className="flex flex-col gap-6 max-w-3xl">
          <h1 className="text-white text-left text-4xl font-bold">
            Aprendizado adaptativo para cada aluno
          </h1>
          <p className="text-white text-left text-lg font-light">
            Trilhas personalizadas, avaliações inteligentes e recomendações que se adaptam ao ritmo
            de cada estudante.
          </p>
        </div>
        <p className="text-white text-sm font-light">
          © 2024 EduPlatform. Todos os direitos reservados.
        </p>
      </div>
      <div className="w-1/2 bg-[#F8F9FA]">
        <Outlet />
      </div>
    </div>
  )
}

export default Auth
