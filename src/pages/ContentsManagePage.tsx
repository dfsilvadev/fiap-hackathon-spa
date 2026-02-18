import {
  Article,
  FunnelSimple,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  Power,
} from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { CONTENT_GRADE_OPTIONS, CONTENT_LEVEL_OPTIONS } from '@/constants/content'
import { useAuth } from '@/hooks/useAuth'
import { getTeacherSubjects } from '@/resources/teacherSubjectsResources'
import { Routes } from '@/router/constants/routesMap'
import {
  Content,
  contentService,
  type CategoryDto,
  type ContentsListParams,
} from '@/services/contentService'

const allowedRoles = ['teacher', 'coordinator']
const DEFAULT_LIMIT = 20

function getGradeLabel(grade?: string) {
  if (!grade) return '—'
  const opt = CONTENT_GRADE_OPTIONS.find((o) => o.value === grade)
  return opt?.label ?? grade
}

function getLevelLabel(level?: string) {
  if (!level) return '—'
  if (level === 'reforco') return 'Reforço'
  return `Nível ${level}`
}

function getLevelPillClass(level?: string) {
  if (!level) return 'bg-slate-100 text-slate-700'
  if (level === '1') return 'bg-blue-100 text-blue-800'
  if (level === '2') return 'bg-emerald-100 text-emerald-800'
  if (level === '3') return 'bg-violet-100 text-violet-800'
  if (level === 'reforco') return 'bg-orange-100 text-orange-800'
  return 'bg-slate-100 text-slate-700'
}

export default function ContentsManagePage() {
  const navigate = useNavigate()
  const { isLoggedIn, me } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [forbiddenMessage, setForbiddenMessage] = useState<string | null>(null)
  const [contents, setContents] = useState<Content[]>([])
  const [total, setTotal] = useState(0)
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [searchTitle, setSearchTitle] = useState('')
  const [filters, setFilters] = useState<ContentsListParams>({
    categoryId: '',
    grade: '',
    level: '',
    isActive: undefined,
    page: 1,
    limit: DEFAULT_LIMIT,
  })
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const filteredContents = useMemo(() => {
    if (!searchTitle.trim()) return contents
    const q = searchTitle.trim().toLowerCase()
    return contents.filter((c) => c.title.toLowerCase().includes(q))
  }, [contents, searchTitle])

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

    const loadContents = async () => {
      try {
        setLoading(true)
        setError(null)
        setForbiddenMessage(null)

        const params: ContentsListParams = {
          page: filters.page,
          limit: filters.limit,
        }
        if (filters.categoryId) params.categoryId = filters.categoryId
        if (filters.grade) params.grade = filters.grade
        if (filters.level) params.level = filters.level
        if (filters.isActive !== undefined) params.isActive = filters.isActive

        const data = await contentService.getContents(params)
        setContents(data.contents)
        setTotal(data.total)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        if (message.includes('403') || message.toLowerCase().includes('only manage')) {
          setForbiddenMessage('Você só pode gerenciar conteúdos das matérias que leciona.')
        } else {
          setError('Não foi possível carregar a lista de conteúdos.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadContents()
  }, [
    me,
    filters.page,
    filters.categoryId,
    filters.grade,
    filters.level,
    filters.isActive,
    filters.limit,
  ])

  const totalPages = Math.max(1, Math.ceil(total / (filters.limit ?? DEFAULT_LIMIT)))

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      setTogglingId(id)
      await contentService.setContentActive(id, !current)
      setContents((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !current } : c)))
    } catch {
      setError('Não foi possível alterar o status do conteúdo.')
    } finally {
      setTogglingId(null)
    }
  }

  const handleFilterChange = (
    key: keyof ContentsListParams,
    value: string | number | boolean | undefined
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  if (!isLoggedIn) return null

  return (
    <main className="min-h-screen bg-slate-50/80 p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Conteúdos
            </h1>
            <p className="mt-2 text-sm text-slate-600">Gerencie os conteúdos pedagógicos</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(Routes.CONTENTS_NEW)}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus size={20} weight="bold" />
            Novo Conteúdo
          </button>
        </header>

        <section className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              <FunnelSimple size={16} />
              <span>Filtros</span>
            </div>
            <div className="relative flex-1 min-w-[200px]">
              <MagnifyingGlass
                size={18}
                weight="bold"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                placeholder="Buscar por título..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
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
            <select
              value={filters.level ?? ''}
              onChange={(e) => handleFilterChange('level', e.target.value || undefined)}
              className="h-10 min-w-[140px] rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Todos os níveis</option>
              {CONTENT_LEVEL_OPTIONS.map((opt) => (
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

        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          {loading ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-3">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
              <p className="text-sm text-slate-500">Carregando conteúdos...</p>
            </div>
          ) : contents.length === 0 ? (
            <div className="rounded-xl bg-slate-50 py-12 text-center">
              <Article size={40} className="mx-auto text-slate-300" weight="light" />
              <p className="mt-2 text-sm text-slate-500">Nenhum conteúdo encontrado.</p>
              <p className="mt-1 text-xs text-slate-400">
                Ajuste os filtros ou crie um novo conteúdo.
              </p>
            </div>
          ) : filteredContents.length === 0 ? (
            <div className="rounded-xl bg-slate-50 py-12 text-center">
              <Article size={40} className="mx-auto text-slate-300" weight="light" />
              <p className="mt-2 text-sm text-slate-500">Nenhum conteúdo corresponde à busca.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {filteredContents.map((content) => {
                const tagsList = Array.isArray(content.tags)
                  ? content.tags
                  : content.tags && typeof content.tags === 'object'
                    ? Object.keys(content.tags)
                    : []
                const excerpt =
                  (content.contentText?.slice(0, 120)?.trim() ?? '') +
                  (content.contentText && content.contentText.length > 120 ? '…' : '')
                return (
                  <div
                    key={content.id}
                    className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-bold text-slate-900">{content.title}</h3>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${
                          content.isActive !== false
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {content.isActive !== false ? 'ATIVO' : 'INATIVO'}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {content.category?.name ?? '—'}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {getGradeLabel(content.grade)}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${getLevelPillClass(
                          content.level
                        )}`}
                      >
                        {getLevelLabel(content.level)}
                      </span>
                    </div>
                    {excerpt && (
                      <p className="mt-3 line-clamp-3 text-sm text-slate-600">{excerpt}</p>
                    )}
                    {tagsList.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {tagsList.slice(0, 5).map((tag) => (
                          <span
                            key={String(tag)}
                            className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"
                          >
                            {String(tag)}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => navigate(Routes.CONTENTS_EDIT.replace(':id', content.id))}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-blue-500 hover:text-blue-600"
                      >
                        <PencilSimple size={18} weight="bold" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(content.id, content.isActive !== false)}
                        disabled={togglingId === content.id}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-800 disabled:opacity-50"
                      >
                        <Power size={18} weight="bold" />
                        {content.isActive !== false ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!loading && contents.length > 0 && totalPages > 1 && (
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
                    setFilters((f) => ({
                      ...f,
                      page: Math.min(totalPages, (f.page ?? 1) + 1),
                    }))
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
