import { useAuth } from '../hooks/useAuth'
import { Lightbulb, BookOpen, CaretRightIcon } from '@phosphor-icons/react'

import { SUMMARY } from '../constant/summary'
import { subjects } from '../constant/category'

const DashboardStudent = () => {
  const { user } = useAuth()

  return (
    <main className="p-10 w-full animate-in fade-in duration-500 bg-[#F8FAFC]">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[#1E293B]">Olá, {user?.name}! 👋</h1>
        <p className="text-gray-500 mt-2">
          Série: <strong className="font-semibold text-gray-700">{user?.currentGrade}º ano</strong>{' '}
          • Continue sua jornada de aprendizado
        </p>
      </header>

      <section aria-label="Resumo de atividades">
        <ul className="flex flex-row gap-6 2xl:gap-8 overflow-x-auto">
          {SUMMARY.map((stat, index) => (
            <li
              key={index}
              className="bg-white border border-gray-200 rounded-2xl py-5 px-3 flex-1"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`${stat.bg} ${stat.color} p-3 rounded-xl flex items-center justify-center`}
                >
                  <stat.icon size={24} weight="bold" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{stat.value}</h2>
                  <p className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <article className="flex flex-col lg:flex-row gap-6 xl:gap-12 mt-10 items-stretch">
        <section className="flex-1 flex flex-col bg-white border border-gray-200 p-8 rounded-2xl min-h-[550px]">
          <header className="flex items-start gap-4 mb-8">
            <div className="bg-gray-100 text-gray-600 p-3 rounded-xl">
              <BookOpen size={28} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Progresso por Matéria</h2>
              <p className="text-xs text-gray-500">Seu avanço em cada disciplina</p>
            </div>
          </header>

          <div className="flex-1 space-y-6 mt-4">
            {subjects.map((subject) => {
              const stepsCompleted = 2
              const totalSteps = 3

              const progressPercentage = (stepsCompleted / totalSteps) * 100

              return (
                <div key={subject} className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <div className="flex gap-2">
                      <span className="text-md font-bold text-gray-700 italic">{subject}</span>
                      <span className="bg-blue-600 rounded-2xl py-1 px-3 text-[10px] text-white">
                        Nível 1
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                      {stepsCompleted} / {totalSteps}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#14B8A6] rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <footer className="flex mt-auto pt-6 border-t border-gray-100 justify-center">
            <button className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-700 hover:font-bold transition-all">
              <span>Ver todas as trilhas</span>
              <CaretRightIcon size={16} />
            </button>
          </footer>
        </section>

        <section className="flex-1 flex flex-col bg-white border border-gray-200 p-8 rounded-2xl min-h-[550px]">
          <header className="flex items-start gap-4 mb-8">
            <div className="bg-gray-100 text-gray-600 p-3 rounded-xl">
              <Lightbulb size={28} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Recomendações de Reforço</h2>
              <p className="text-xs text-gray-500">Conteúdos sugeridos para você</p>
            </div>
          </header>
        </section>
      </article>
    </main>
  )
}

export default DashboardStudent
