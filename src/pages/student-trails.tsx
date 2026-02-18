/* eslint-disable @typescript-eslint/no-explicit-any */
import { BookOpen, CheckCircle, Lock, Play } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { subjects } from '@/constant/category'
import { useAuth } from '@/hooks/useAuth'
import {
  getForStudent,
  LearningPath,
  LearningPathContentStatus,
} from '@/resources/learningPathResources'
import { Routes } from '@/router/constants/routesMap'
import { contentService, type CategoryDto } from '@/services/contentService'

const StudentTrailsPage = () => {
  const navigate = useNavigate()
  const { isLoggedIn, me } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([])

  useEffect(() => {
    if (!isLoggedIn) {
      navigate(Routes.SIGN_IN)
      return
    }

    if (me && me.role !== 'student') {
      navigate(Routes.HOME)
      return
    }

    const fetchAll = async () => {
      setLoading(true)
      setError(null)

      try {
        const apiCategories = await contentService.getCategories()
        setCategories(apiCategories)

        const all: LearningPath[] = []

        for (const subjectName of subjects) {
          const category = apiCategories.find((c) => c.name === subjectName)
          if (!category) continue

          try {
            const response = await getForStudent(category.id)
            const data = response.data as
              | LearningPath
              | LearningPath[]
              | { learningPaths: LearningPath[] }

            let path: LearningPath | null = null

            if (Array.isArray(data)) {
              path = data[0] ?? null
            } else if (data && 'learningPaths' in data && Array.isArray(data.learningPaths)) {
              path = data.learningPaths[0] ?? null
            } else {
              path = data as LearningPath
            }

            if (path) {
              all.push(path)
            }
          } catch (err: any) {
            if (err?.response?.status !== 404) {
              console.error('Erro ao carregar trilha da categoria', category.name, err)
            }
          }
        }

        setLearningPaths(all)
      } catch {
        setError('Não foi possível carregar suas trilhas de aprendizado.')
        setLearningPaths([])
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [isLoggedIn, me, navigate])

  const getStatusStyle = (status: LearningPathContentStatus) => {
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

  const getStatusName = (status: LearningPathContentStatus) => {
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

      {loading && (
        <p className="text-sm text-slate-500 py-4">Carregando suas trilhas de aprendizado...</p>
      )}

      {!loading && error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && (
        <section className="mt-4 grid grid-cols-1 gap-6">
          {subjects.map((subjectName) => {
            const category = categories.find((c) => c.name === subjectName) ?? null

            const lp =
              learningPaths.find(
                (item) =>
                  (category && item.categoryId === category.id) ||
                  (category && item.category?.id === category.id) ||
                  item.category?.name === subjectName
              ) ?? null

            const categoryCompleted =
              lp?.contents?.filter((c) => c.status === 'completed').length ?? 0
            const categoryTotal = lp?.contents?.length ?? 0

            return (
              <div
                key={subjectName}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <BookOpen size={18} className="text-slate-600" />
                      {lp ? lp.category.name : subjectName}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {lp
                        ? `Trilha de ${lp.category.name} • ${lp.grade}º Ano`
                        : 'Nenhuma trilha disponível'}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="text-xs bg-blue-600 hover:bg-blue-700 font-semibold text-white leading-5 py-1.5 px-4 rounded-full"
                    disabled
                  >
                    Nível 1
                  </button>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <div className="h-1 w-full bg-emerald-100 rounded-full overflow-hidden mr-4">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-700"
                      style={{
                        width:
                          categoryTotal > 0
                            ? `${Math.round((categoryCompleted / categoryTotal) * 100)}%`
                            : '0%',
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">
                    {categoryCompleted}/{categoryTotal} concluídos
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {lp?.contents?.length ? (
                    lp.contents.map((content) => (
                      <div
                        key={content.contentId}
                        className={`rounded-lg border border-slate-200 px-4 py-4 shadow-sm flex items-center justify-between ${
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
                            onClick={() =>
                              navigate(
                                Routes.CONTENT_DETAILS.replace(':id', content.contentId.toString())
                              )
                            }
                          >
                            Estudar
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-slate-400 py-4 text-center">
                      Nenhum conteúdo na trilha ainda
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
