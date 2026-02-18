import {
  BookOpen,
  CaretRightIcon,
  ClipboardText,
  Lightbulb,
  MagnifyingGlass,
} from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

import { DashboardStudent as DashboardType } from '../components/ui/dashboard'
import { SUMMARY_CONFIG } from '../constant/summary'
import { getByUser } from '../resources/dashboardResources'
import { Routes } from '../router/constants/routesMap'

const DashboardStudent = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [studentDashboard, setStudentDashboard] = useState<DashboardType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        const response = await getByUser()
        const data = response.data as unknown as DashboardType
        setStudentDashboard(data)
      } catch (error) {
        console.error('Erro ao buscar dashboard:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const renderedSummary = useMemo(() => {
    return SUMMARY_CONFIG.map((item) => {
      let value = 0

      if (studentDashboard) {
        switch (item.key) {
          case 'activePaths':
            value = studentDashboard.pathsBySubject?.length ?? 0
            break

          case 'completedContents':
            value =
              studentDashboard.pathsBySubject?.reduce(
                (acc, curr) => acc + (curr.completedCount ?? 0),
                0
              ) ?? 0
            break

          case 'recommendations':
            value = studentDashboard.pendingRecommendations?.length ?? 0
            break

          case 'availableContents':
            value =
              studentDashboard.pathsBySubject?.reduce((acc, path) => {
                const countAvailable =
                  path.contents?.filter((c) => c.status === 'available').length ?? 0
                return acc + countAvailable
              }, 0) ?? 0
            break
        }
      }

      return { ...item, value: value.toString() }
    })
  }, [studentDashboard])

  if (loading)
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F8FAFC]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
      </div>
    )

  const hasPaths = (studentDashboard?.pathsBySubject?.length ?? 0) > 0
  const hasRecommendations = (studentDashboard?.pendingRecommendations?.length ?? 0) > 0

  return (
    <main className="p-10 w-full animate-in fade-in duration-500 bg-[#F8FAFC]">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[#1E293B]">Olá, {user?.name}! 👋</h1>
        <p className="text-gray-500 mt-2">
          Série:{' '}
          <strong className="font-semibold text-gray-700">{studentDashboard?.grade}º ano</strong> •
          Continue sua jornada de aprendizado
        </p>
      </header>

      <section aria-label="Resumo de atividades">
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderedSummary.map((stat) => (
            <li
              key={stat.key}
              className="bg-white border border-gray-200 rounded-2xl py-3 px-2 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`${stat.bg} ${stat.color} p-3 rounded-xl flex items-center justify-center`}
                >
                  <stat.icon size={26} weight="bold" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{stat.value}</h2>
                  <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        <section className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm flex flex-col min-h-[500px]">
          <header className="flex items-center gap-3 mb-8 text-gray-900 font-bold">
            <BookOpen size={24} /> <h2>Progresso por Matéria</h2>
          </header>

          <div className="space-y-6 overflow-y-auto">
            {hasPaths ? (
              studentDashboard?.pathsBySubject.map((path) => (
                <div key={path.pathId} className="group cursor-default">
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-bold text-gray-700">{path.category.name}</span>
                    <span className="text-[10px] font-bold text-gray-400">
                      {path.completedCount} / {path.totalContents}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 transition-all duration-700"
                      style={{ width: `${path.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-gray-400">
                <ClipboardText size={40} className="mx-auto mb-2 opacity-30" /> Sem trilhas.
              </div>
            )}
          </div>
          <footer className="flex mt-auto pt-6 border-t border-gray-100 justify-center">
            <button
              type="button"
              onClick={() => navigate(Routes.STUDENT_TRIALS)}
              className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-700 hover:font-bold transition-all"
            >
              <span>Ver todas as trilhas</span>
              <CaretRightIcon size={16} />
            </button>
          </footer>
        </section>

        <section className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm flex flex-col min-h-[500px]">
          <header className="flex items-center gap-3 mb-8 text-gray-900 font-bold">
            <Lightbulb size={24} /> <h2>Recomendações</h2>
          </header>

          <div className="space-y-4">
            {hasRecommendations ? (
              studentDashboard?.pendingRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl border border-amber-100 bg-amber-50/50 hover:bg-amber-50 transition-colors"
                >
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tighter">
                    Motivo: {rec.reason}
                  </span>
                  <h3 className="font-bold text-gray-800 text-sm mt-1">{rec.content.title}</h3>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-blue-400">
                <MagnifyingGlass size={40} className="mx-auto mb-2 opacity-30" /> Tudo em dia!
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default DashboardStudent
