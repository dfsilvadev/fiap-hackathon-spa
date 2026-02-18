import { Play, CheckCircle, Lock } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'
import { getForStudent, LearningPath } from '@/resources/learningPathResources'
import { Routes } from '@/router/constants/routesMap'

interface Category {
  id: string
  name: string
}

const StudentTrailsPage = () => {
  const navigate = useNavigate()
  const { isLoggedIn, me } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([])

  const categories: Category[] = [
    { name: 'Português', id: '5677af84-cccc-476f-ab5e-e4789e18ee85' },
    { name: 'Matemática', id: '8db6ca2e-0da4-4ac4-ba2e-0adfb7f01275' },
    { name: 'Ciências', id: '7f2a1f19-d1aa-4bad-89e5-fc7d22c66bf2' },
    { name: 'História', id: '46c7096e-8c05-4d2a-8cb2-2fa6ff88f187' },
    { name: 'Geografia', id: 'c32e3cf1-32aa-4830-9662-3c3718d5a251' },
  ]

  useEffect(() => {
    if (!isLoggedIn) {
      navigate(Routes.SIGN_IN)
      return
    }

    if (me && me.role !== 'student') {
      navigate(Routes.HOME)
      return
    }

    if (me?.sub) {
      fetchLearningPaths(categories)
    }
  }, [isLoggedIn, me])

  const fetchLearningPaths = async (categories: { id: string; name: string }[]) => {
    setLoading(true)
    setError(null)

    try {
      const allLearningPaths: LearningPath[] = []

      for (const category of categories) {
        try {
          const response = await getForStudent(category.id)

          const paths: LearningPath[] = response.data ? [response.data] : []
          allLearningPaths.push(...paths)
        } catch (err) {
          console.error(`Erro ao carregar trilhas da categoria ${category.name}`, err)
        }
      }

      const uniquePaths = Array.from(
        new Map(allLearningPaths.map((item) => [item.id, item])).values()
      )
      setLearningPaths(uniquePaths)
    } catch (err) {
      setError('Não foi possível carregar suas trilhas de aprendizado.' + err)
      setLearningPaths([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-300 text-green-700'
      case 'available':
        return 'bg-blue-100 border-blue-300 text-blue-700'
      case 'blocked':
        return 'bg-slate-100 border-slate-300 text-slate-700'
      default:
        return ''
    }
  }

  const getStatusName = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponível'
      case 'completed':
        return 'Concluído'
      case 'blocked':
        return 'Bloqueado'
      default:
        return status
    }
  }

  if (!isLoggedIn) return null

  return (
    <main className="p-10 w-full bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Minhas Trilhas</h1>
        <h2 className="text-slate-500">Acompanhe seu progresso em cada matéria</h2>
      </header>

      {loading && <p>Carregando...</p>}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && (
        <section className="mt-4 grid grid-cols-1 gap-6">
          {categories.map((category) => {
            const lp = learningPaths.find((lp) => lp.category.id === category.id)
            return (
              <div
                key={category.id}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100"
              >
                <div className="grid grid-cols-2 items-start justify-between">
                  <h2 className="text-lg font-bold text-slate-900">
                    {lp ? lp.category.name : category.name}
                  </h2>

                  <div className="flex flex-col items-end">
                    <button
                      type="button"
                      className="text-sm mb-1 bg-blue-600 hover:bg-blue-700 font-medium text-white leading-5 py-2.5 px-4 rounded-full w-20"
                      disabled
                    >
                      Nível
                    </button>
                  </div>
                </div>

                <div className="flex justify-between mb-4 items-center">
                  <p className="text-sm text-slate-500">
                    {lp?.description ?? 'Nenhuma trilha disponível para esta categoria.'}
                  </p>
                  {lp && (
                    <p className="text-xs text-slate-500 whitespace-nowrap">
                      {lp.contents?.filter((c) => c.status === 'completed').length ?? 0}/
                      {lp.contents?.length ?? 0} concluídos
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {lp?.contents?.length
                    ? lp.contents.map((content) => (
                        <div
                          key={content.id}
                          className={`rounded-lg border border-slate-200 px-4 py-4 shadow-sm flex items-center justify-between
                          ${
                            content.status === 'blocked'
                              ? 'bg-blue-50 cursor-not-allowed grayscale opacity-60'
                              : 'bg-blue-50 hover:bg-blue-100'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <span className="flex items-center justify-center w-10 h-10 text-sm font-semibold border border-blue-300 rounded-full bg-white">
                              {content.orderNumber}
                            </span>

                            <div className="flex flex-col">
                              <p className="font-medium text-slate-800">{content.title}</p>

                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-700 border border-gray-200">
                                  Nível {content.level}
                                </span>

                                <div
                                  className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded border ${getStatusStyle(
                                    content.status
                                  )}`}
                                >
                                  {content.status === 'completed' && <CheckCircle size={14} />}
                                  {content.status === 'available' && <Play size={14} />}
                                  {content.status === 'blocked' && <Lock size={14} />}
                                  <span>{getStatusName(content.status)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {content.status !== 'blocked' && (
                            <button
                              type="button"
                              className="text-sm font-medium py-2 px-5 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition"
                              onClick={() => navigate(`/content/${content.id}`)}
                            >
                              Estudar
                            </button>
                          )}
                        </div>
                      ))
                    : !lp && (
                        <div className="text-sm text-gray-500 py-2 text-center">
                          Nenhum conteúdo nesta categoria
                        </div>
                      )}
                </div>
              </div>
            )
          })}
        </section>
      )}
    </main>
  )
}

export default StudentTrailsPage
