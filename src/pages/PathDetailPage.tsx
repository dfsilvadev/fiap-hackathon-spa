import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CaretDown, CaretUp, PencilSimple, Plus, Trash } from '@phosphor-icons/react'

import { useAuth } from '@/hooks/useAuth'
import {
  learningPathService,
  type LearningPathDetail,
  type LearningPathContentItem,
} from '@/services/learningPathService'
import { contentService, type Content } from '@/services/contentService'
import { CONTENT_GRADE_OPTIONS } from '@/constants/content'
import { Routes } from '@/router/constants/routesMap'

const allowedRoles = ['teacher', 'coordinator']

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

export default function PathDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { isLoggedIn, me } = useAuth()

  const [path, setPath] = useState<LearningPathDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [forbiddenMessage, setForbiddenMessage] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [availableContents, setAvailableContents] = useState<Content[]>([])
  const [loadingAvailable, setLoadingAvailable] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const loadPath = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)
      setNotFound(false)
      setForbiddenMessage(null)
      const data = await learningPathService.getById(id)
      setPath(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      if (message.includes('404') || message.toLowerCase().includes('not found')) {
        setNotFound(true)
      } else if (message.includes('403') || message.toLowerCase().includes('only manage')) {
        setForbiddenMessage('Você não tem permissão para acessar esta trilha.')
      } else {
        setError('Não foi possível carregar a trilha.')
      }
    } finally {
      setLoading(false)
    }
  }, [id])

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
    if (!id || !me || !allowedRoles.includes(me.role)) return
    loadPath()
  }, [id, me, isLoggedIn, loadPath])

  useEffect(() => {
    if (!path?.categoryId || !path?.grade) {
      setAvailableContents([])
      return
    }
    const load = async () => {
      setLoadingAvailable(true)
      try {
        const [r1, r2, r3] = await Promise.all([
          contentService.getContents({
            categoryId: path.categoryId,
            grade: path.grade,
            level: '1',
            isActive: true,
            limit: 100,
          }),
          contentService.getContents({
            categoryId: path.categoryId,
            grade: path.grade,
            level: '2',
            isActive: true,
            limit: 100,
          }),
          contentService.getContents({
            categoryId: path.categoryId,
            grade: path.grade,
            level: '3',
            isActive: true,
            limit: 100,
          }),
        ])
        const all = [...r1.contents, ...r2.contents, ...r3.contents]
        const inPathIds = new Set((path.contents ?? []).map((c) => c.contentId))
        setAvailableContents(all.filter((c) => !inPathIds.has(c.id)))
      } catch {
        setAvailableContents([])
      } finally {
        setLoadingAvailable(false)
      }
    }
    load()
  }, [path?.id, path?.categoryId, path?.grade, path?.contents])

  const addContent = async (contentId: string) => {
    if (!id || !path) return
    setActionError(null)
    try {
      const orderNumber = path.contents?.length ?? 0
      await learningPathService.addContent(id, { contentId, orderNumber })
      await loadPath()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      if (
        message.toLowerCase().includes('already in path') ||
        message.toLowerCase().includes('já está na trilha')
      ) {
        setActionError('Este conteúdo já está na trilha.')
      } else if (
        message.toLowerCase().includes('reforço') ||
        message.toLowerCase().includes('reforco')
      ) {
        setActionError('Conteúdo de reforço não pode entrar na trilha.')
      } else {
        setActionError(message || 'Não foi possível adicionar.')
      }
    }
  }

  const removeContent = async (contentId: string) => {
    if (!id) return
    setActionError(null)
    try {
      await learningPathService.removeContent(id, contentId)
      await loadPath()
    } catch {
      setActionError('Não foi possível remover o conteúdo.')
    }
  }

  const moveContent = async (index: number, direction: 'up' | 'down') => {
    if (!id || !path?.contents?.length) return
    const contents = [...path.contents]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= contents.length) return
    ;[contents[index], contents[newIndex]] = [contents[newIndex], contents[index]]
    setActionError(null)
    try {
      await learningPathService.reorderContents(id, {
        items: contents.map((c, i) => ({ contentId: c.contentId, orderNumber: i })),
      })
      await loadPath()
    } catch {
      setActionError('Não foi possível reordenar.')
    }
  }

  if (!isLoggedIn) return null

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50/80 p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          <p className="text-sm text-slate-500">Carregando trilha...</p>
        </div>
      </main>
    )
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-slate-50/80 p-8">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="font-medium text-slate-700">Trilha não encontrada.</p>
          <button
            type="button"
            onClick={() => navigate(Routes.TRIALS)}
            className="mt-4 text-sm font-semibold text-blue-600 hover:underline"
          >
            Voltar para a lista
          </button>
        </div>
      </main>
    )
  }

  if (!path) {
    return (
      <main className="min-h-screen bg-slate-50/80 p-8">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">Nenhum dado para exibir.</p>
          <button
            type="button"
            onClick={() => navigate(Routes.TRIALS)}
            className="mt-4 text-sm font-semibold text-blue-600 hover:underline"
          >
            Voltar
          </button>
        </div>
      </main>
    )
  }

  const contents: LearningPathContentItem[] = path.contents ?? []

  return (
    <main className="min-h-screen bg-slate-50/80 p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <button
            type="button"
            onClick={() => navigate(Routes.TRIALS)}
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={18} weight="bold" />
            Voltar
          </button>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
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
              <h1 className="text-2xl font-bold text-slate-900">{path.name}</h1>
              {path.description && (
                <p className="mt-1 text-sm text-slate-600">{path.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => navigate(Routes.TRIALS_EDIT.replace(':id', id!))}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <PencilSimple size={18} weight="bold" />
              Editar
            </button>
          </div>
        </header>

        {forbiddenMessage && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {forbiddenMessage}
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}
        {actionError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {actionError}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Conteúdos na trilha</h2>
          <p className="mt-1 text-sm text-slate-500">
            {contents.length} {contents.length === 1 ? 'conteúdo' : 'conteúdos'} na trilha
          </p>

          {contents.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-6 text-center text-sm text-slate-500">
              Nenhum conteúdo na trilha. Adicione abaixo.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {contents.map((item, index) => (
                <li
                  key={item.contentId}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-500 w-6">{index + 1}.</span>
                    <span className="font-medium text-slate-800">{item.title}</span>
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                      {getLevelLabel(item.level)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveContent(index, 'up')}
                      disabled={index === 0}
                      className="rounded p-1.5 text-slate-500 hover:bg-slate-200 disabled:opacity-40"
                      title="Subir"
                    >
                      <CaretUp size={18} weight="bold" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveContent(index, 'down')}
                      disabled={index === contents.length - 1}
                      className="rounded p-1.5 text-slate-500 hover:bg-slate-200 disabled:opacity-40"
                      title="Descer"
                    >
                      <CaretDown size={18} weight="bold" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeContent(item.contentId)}
                      className="rounded p-1.5 text-red-500 hover:bg-red-50"
                      title="Remover"
                    >
                      <Trash size={18} weight="bold" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 border-t border-slate-100 pt-6">
            <h3 className="text-sm font-semibold text-slate-700">Adicionar conteúdo</h3>
            <p className="mt-1 text-xs text-slate-500">
              Apenas conteúdos ativos, níveis 1, 2 e 3 (reforço não entra na trilha).
            </p>
            {loadingAvailable ? (
              <p className="mt-3 text-sm text-slate-500">Carregando...</p>
            ) : availableContents.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                Nenhum conteúdo disponível para adicionar ou todos já estão na trilha.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {availableContents.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2"
                  >
                    <span className="text-sm text-slate-800">
                      {c.title} <span className="text-slate-500">({getLevelLabel(c.level)})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => addContent(c.id)}
                      className="inline-flex items-center gap-1 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
                    >
                      <Plus size={16} weight="bold" />
                      Adicionar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
