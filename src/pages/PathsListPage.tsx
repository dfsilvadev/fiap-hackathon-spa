import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CaretRight,
  FunnelSimple,
  Path as PathIcon,
  PencilSimple,
  Plus,
} from '@phosphor-icons/react'

import { useAuth } from '@/hooks/useAuth'
import {
  learningPathService,
  type LearningPathListItem,
  type LearningPathsListParams,
} from '@/services/learningPathService'
import { contentService, type CategoryDto } from '@/services/contentService'
import { getTeacherSubjects } from '@/resources/teacherSubjectsResources'
import { CONTENT_GRADE_OPTIONS } from '@/constants/content'
import { Routes } from '@/router/constants/routesMap'

const allowedRoles = ['teacher', 'coordinator']
const DEFAULT_LIMIT = 20

function getGradeLabel(grade?: string) {
  if (!grade) return '—'
  const opt = CONTENT_GRADE_OPTIONS.find((o) => o.value === grade)
  return opt?.label ?? grade
}

export default function PathsListPage() {
  const navigate = useNavigate()
  const { isLoggedIn, me } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [forbiddenMessage, setForbiddenMessage] = useState<string | null>(null)
  const [paths, setPaths] = useState<LearningPathListItem[]>([])
  const [total, setTotal] = useState(0)
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [filters, setFilters] = useState<LearningPathsListParams>({
    categoryId: '',
    grade: '',
    page: 1,
    limit: DEFAULT_LIMIT,
  })

  useEffect(() => {
    if (!isLoggedIn) {
      navigate(Routes.SIGN_IN)
      return
    }
    if (me && !allowedRoles.includes(me.role)) {
      navigate(Routes.HOME)
    }
  }, [isLoggedIn, me, navigate])

  useEffect(() => {
    if (!me || !allowedRoles.includes(me.role)) return

    const loadCategories = async () => {
      try {
        if (me.role === 'coordinator') {
          const list = await contentService.getCategories()
          setCategories(list)
        } else {
          const res = await getTeacherSubjects(1, 100)
          setCategories(res.data.subjects.map((s) => ({ id: s.id, name: s.name })))
        }
      } catch {
        setCategories([])
      }
    }
    loadCategories()
  }, [me])

  useEffect(() => {
    if (!me || !allowedRoles.includes(me.role)) return

    const loadPaths = async () => {
      try {
        setLoading(true)
        setError(null)
        setForbiddenMessage(null)
        const params: LearningPathsListParams = {
          page: filters.page,
          limit: filters.limit,
        }
        if (filters.categoryId) params.categoryId = filters.categoryId
        if (filters.grade) params.grade = filters.grade
        const data = await learningPathService.getList(params)
        setPaths(data.paths)
        setTotal(data.total)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        if (message.includes('403') || message.toLowerCase().includes('only manage')) {
          setForbiddenMessage('Você só pode gerenciar trilhas das matérias que leciona.')
        } else {
          setError('Não foi possível carregar as trilhas.')
        }
      } finally {
        setLoading(false)
      }
    }
    loadPaths()
  }, [me, filters.page, filters.limit, filters.categoryId, filters.grade])

  const totalPages = Math.max(1, Math.ceil(total / (filters.limit ?? DEFAULT_LIMIT)))

  const handleFilterChange = (
    key: keyof LearningPathsListParams,
    value: string | number | undefined
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  if (!isLoggedIn) return null

  return (
    <main className="min-h-screen bg-slate-50/80 p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Trilhas de Aprendizado
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Gerencie as trilhas de conteúdo por matéria e série
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(Routes.TRIALS_NEW)}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus size={20} weight="bold" />
            Nova Trilha
          </button>
        </header>

        <section className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              <FunnelSimple size={16} />
              <span>Filtros</span>
            </div>
            <select
              value={filters.categoryId ?? ''}
              onChange={(e) => handleFilterChange('categoryId', e.target.value || undefined)}
              className="h-10 min-w-[160px] rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Todas as matérias</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              value={filters.grade ?? ''}
              onChange={(e) => handleFilterChange('grade', e.target.value || undefined)}
              className="h-10 min-w-[140px] rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Todas as séries</option>
              {CONTENT_GRADE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {forbiddenMessage && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {forbiddenMessage}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <section className="space-y-4">
          {loading ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-8">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
              <p className="text-sm text-slate-500">Carregando trilhas...</p>
            </div>
          ) : paths.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center">
              <PathIcon size={48} className="mx-auto text-slate-300" weight="light" />
              <p className="mt-3 text-sm text-slate-500">Nenhuma trilha encontrada.</p>
              <p className="mt-1 text-xs text-slate-400">
                Ajuste os filtros ou crie uma nova trilha.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {paths.map((path) => (
                <div
                  key={path.id}
                  className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <h3 className="text-lg font-bold text-slate-900">{path.name}</h3>
                  {path.description && (
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">{path.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {path.category?.name ?? '—'}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {getGradeLabel(path.grade)}
                    </span>
                    {path.isDefault && (
                      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                        Padrão
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    Abra a trilha para ver e gerenciar os conteúdos.
                  </p>
                  <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => navigate(Routes.TRIALS_DETAIL.replace(':id', path.id))}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-blue-500 hover:text-blue-600"
                    >
                      Abrir
                      <CaretRight size={18} weight="bold" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(Routes.TRIALS_EDIT.replace(':id', path.id))}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-800"
                    >
                      <PencilSimple size={18} weight="bold" />
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && paths.length > 0 && totalPages > 1 && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-500">
                Página {filters.page ?? 1} de {totalPages} • {total} no total
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setFilters((f) => ({ ...f, page: Math.max(1, (f.page ?? 1) - 1) }))
                  }
                  disabled={(filters.page ?? 1) <= 1}
                  className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFilters((f) => ({ ...f, page: Math.min(totalPages, (f.page ?? 1) + 1) }))
                  }
                  disabled={(filters.page ?? 1) >= totalPages}
                  className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
