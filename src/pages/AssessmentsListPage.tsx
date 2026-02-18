import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChartLineUp,
  ClipboardText,
  Clock,
  FunnelSimple,
  MagnifyingGlass,
  PencilSimple,
  Play,
  Plus,
} from '@phosphor-icons/react'

import { useAuth } from '@/hooks/useAuth'
import {
  assessmentService,
  type AssessmentListItem,
  type AssessmentsListParams,
} from '@/services/assessmentService'
import { contentService, type CategoryDto } from '@/services/contentService'
import { getTeacherSubjects } from '@/resources/teacherSubjectsResources'
import { ASSESSMENT_LEVEL_OPTIONS } from '@/constants/assessment'
import { Routes } from '@/router/constants/routesMap'

const allowedRoles = ['teacher', 'coordinator']
const DEFAULT_LIMIT = 20

export default function AssessmentsListPage() {
  const navigate = useNavigate()
  const { isLoggedIn, me } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [forbiddenMessage, setForbiddenMessage] = useState<string | null>(null)
  const [assessments, setAssessments] = useState<AssessmentListItem[]>([])
  const [total, setTotal] = useState(0)
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [searchTitle, setSearchTitle] = useState('')
  const [filters, setFilters] = useState<AssessmentsListParams>({
    categoryId: '',
    level: '',
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
    const load = async () => {
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
    load()
  }, [me])

  useEffect(() => {
    if (!me || !allowedRoles.includes(me.role)) return
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        setForbiddenMessage(null)
        const params: AssessmentsListParams = {
          page: filters.page,
          limit: filters.limit,
        }
        if (filters.categoryId) params.categoryId = filters.categoryId
        if (filters.level) params.level = filters.level
        const data = await assessmentService.getList(params)
        setAssessments(data.assessments ?? [])
        setTotal(data.total ?? 0)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        if (message.includes('403') || message.toLowerCase().includes('only manage')) {
          setForbiddenMessage('Você só pode gerenciar avaliações das matérias que leciona.')
        } else {
          setError('Não foi possível carregar as avaliações.')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [me, filters.page, filters.limit, filters.categoryId, filters.level])

  const filteredBySearch = useMemo(() => {
    if (!searchTitle.trim()) return assessments
    const q = searchTitle.trim().toLowerCase()
    return assessments.filter((a) => a.title?.toLowerCase().includes(q))
  }, [assessments, searchTitle])

  const stats = useMemo(() => {
    const active = assessments.filter((a) => a.isActive !== false).length
    const pending = assessments.filter((a) => a.isActive === false).length
    return { total: assessments.length, active, pending }
  }, [assessments])

  const totalPages = Math.max(1, Math.ceil(total / (filters.limit ?? DEFAULT_LIMIT)))

  const handleFilterChange = (
    key: keyof AssessmentsListParams,
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
              Avaliações
            </h1>
            <p className="mt-2 text-sm text-slate-600">Gerencie todas as avaliações do sistema</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(Routes.ASSESSMENTS_NEW)}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus size={20} weight="bold" />
            Nova Avaliação
          </button>
        </header>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-2.5">
                <ClipboardText size={24} className="text-slate-600" weight="bold" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Total de Avaliações</p>
                <p className="text-2xl font-bold text-slate-900">{total}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-2.5">
                <ChartLineUp size={24} className="text-emerald-600" weight="bold" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Nota Média</p>
                <p className="text-2xl font-bold text-slate-900">—</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-100 p-2.5">
                <Clock size={24} className="text-amber-600" weight="bold" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Pendentes</p>
                <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-2.5">
                <Play size={24} className="text-emerald-600" weight="bold" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Ativas</p>
                <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
              </div>
            </div>
          </div>
        </div>

        <section className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              <FunnelSimple size={16} />
              <span>Filtros</span>
            </div>
            <div className="relative min-w-[200px] flex-1">
              <MagnifyingGlass
                size={18}
                weight="bold"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                placeholder="Buscar avaliações..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <select
              value={filters.categoryId ?? ''}
              onChange={(e) => handleFilterChange('categoryId', e.target.value || undefined)}
              className="h-10 min-w-[160px] rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Todas as matérias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={filters.level ?? ''}
              onChange={(e) => handleFilterChange('level', e.target.value || undefined)}
              className="h-10 min-w-[140px] rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Todos os níveis</option>
              {ASSESSMENT_LEVEL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
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

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 p-8">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
              <p className="text-sm text-slate-500">Carregando avaliações...</p>
            </div>
          ) : filteredBySearch.length === 0 ? (
            <div className="rounded-2xl p-12 text-center">
              <ClipboardText size={48} className="mx-auto text-slate-300" weight="light" />
              <p className="mt-3 text-sm text-slate-500">Nenhuma avaliação encontrada.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead>
                  <tr className="bg-slate-50/80">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Avaliação
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Matéria
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Questões
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Nota Mín.
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBySearch.map((a) => (
                    <tr key={a.id} className="transition-colors hover:bg-slate-50/60">
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-900">{a.title}</span>
                        {a.description && (
                          <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                            {a.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                          {a.category?.name ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            a.isActive !== false
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              a.isActive !== false ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {a.isActive !== false ? 'Ativa' : 'Inativa'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">—</td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {a.minScore != null ? `${a.minScore}%` : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(Routes.ASSESSMENTS_QUESTIONS.replace(':id', a.id))
                            }
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            Abrir
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(Routes.ASSESSMENTS_EDIT.replace(':id', a.id))}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
                          >
                            <PencilSimple size={16} weight="bold" />
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
              <p className="text-xs text-slate-500">
                Página {filters.page ?? 1} de {totalPages} • {total} no total
              </p>
              <div className="flex gap-1">
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
