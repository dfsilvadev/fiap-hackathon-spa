import { ArrowClockwise, CheckCircle, XCircle } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'
import {
  getRecommendations,
  Recommendation,
  RecommendationStatus,
  updateRecommendationStatus,
} from '@/resources/recommendationResources'
import { Routes } from '@/router/constants/routesMap'
import { formatDate } from '@/util/formatDate'
import { logger } from '@/utils/loogers'

const STATUS_FILTERS: { value: RecommendationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'completed', label: 'Concluídas' },
  { value: 'dismissed', label: 'Descartadas' },
]

const statusLabel: Record<RecommendationStatus, string> = {
  pending: 'Pendente',
  completed: 'Concluída',
  dismissed: 'Descartada',
}

const statusColors: Record<RecommendationStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  dismissed: 'bg-slate-50 text-slate-500 border-slate-200',
}

const RecommendationsPage = () => {
  const navigate = useNavigate()
  const { isLoggedIn, me } = useAuth()

  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [statusFilter, setStatusFilter] = useState<RecommendationStatus | 'all'>('pending')

  useEffect(() => {
    if (!isLoggedIn) {
      navigate(Routes.SIGN_IN)
      return
    }

    if (me && me.role !== 'student') {
      navigate(Routes.HOME)
    }
  }, [isLoggedIn, me, navigate])

  const fetchRecommendations = async (status: RecommendationStatus | 'all') => {
    try {
      setLoading(true)
      setError(null)

      const statusParam = status === 'all' ? undefined : status
      const response = await getRecommendations(statusParam)
      const data = response.data as Recommendation[] | { recommendations: Recommendation[] }

      logger.info('[Recommendations Page] Recomendações carregadas da API', {
        status: statusParam ?? 'all',
        total:
          Array.isArray(data) && data
            ? data.length
            : !Array.isArray(data) && data.recommendations
              ? data.recommendations.length
              : 0,
      })

      const items = Array.isArray(data) ? data : (data.recommendations ?? [])
      setRecommendations(items)
    } catch (err) {
      logger.error('[Recommendations Page] Erro ao carregar recomendações', err)
      setError('Não foi possível carregar suas recomendações de reforço.')
      setRecommendations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendations(statusFilter)
  }, [statusFilter])

  const handleChangeStatus = async (id: string, status: RecommendationStatus) => {
    try {
      setUpdatingId(id)
      const response = await updateRecommendationStatus(id, status)
      const updated = response.data

      setRecommendations((prev) =>
        prev.map((rec) => (rec.id === id ? { ...rec, ...updated, status: updated.status } : rec))
      )
      logger.success('[Recommendations Page] Status da recomendação atualizado', {
        id,
        status: updated.status,
      })
    } catch (err) {
      logger.error('[Recommendations Page] Erro ao atualizar status da recomendação', {
        id,
        status,
        err,
      })
      alert('Não foi possível atualizar o status da recomendação.')
    } finally {
      setUpdatingId(null)
    }
  }

  if (!isLoggedIn) {
    return null
  }

  return (
    <main className="p-10 w-full animate-in fade-in duration-500 bg-gray-50 min-h-screen">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Recomendações de Reforço</h1>
            <p className="mt-1 text-sm text-slate-500 max-w-2xl">
              Aqui você encontra conteúdos extras pensados para te ajudar nos tópicos em que teve
              mais dificuldade nas avaliações. Não é mais conteúdo por fazer: é reforço direcionado.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Filtrar por status
          </span>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all border ${
                  statusFilter === filter.value
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20 text-gray-400 italic">
          Buscando recomendações personalizadas...
        </div>
      ) : recommendations.length === 0 ? (
        <section className="mt-4 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/60 p-10 text-center">
          <h2 className="text-xl font-bold text-emerald-800 mb-2">Nenhuma recomendação aqui 🎉</h2>
          <p className="text-sm text-emerald-700 max-w-xl mx-auto">
            No momento você não possui conteúdos de reforço{' '}
            {statusFilter === 'pending'
              ? 'pendentes. Continue assim e siga com sua trilha de estudos!'
              : 'neste filtro. Experimente mudar o status no topo da tela.'}
          </p>
        </section>
      ) : (
        <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          {recommendations.map((rec) => {
            const tags = rec.tags ?? []

            return (
              <article
                key={rec.id}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      Conteúdo de reforço
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 leading-snug">
                      {rec.content.title}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {rec.content.categoryName} • Série {rec.content.grade} • Nível{' '}
                      {rec.content.level === 'reforco' ? 'Reforço' : rec.content.level}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-widest ${statusColors[rec.status]}`}
                  >
                    {rec.status === 'completed' && <CheckCircle size={14} weight="bold" />}
                    {rec.status === 'dismissed' && <XCircle size={14} weight="bold" />}
                    {statusLabel[rec.status]}
                  </span>
                </div>

                <div className="mb-3 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-amber-700"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="mb-4 text-sm text-slate-600">
                  {rec.reason ? (
                    rec.reason
                  ) : (
                    <>
                      Você teve dificuldade em{' '}
                      <span className="font-semibold">
                        {tags.length === 1 ? tags[0] : tags.join(', ')}
                      </span>
                      . Este conteúdo foi sugerido para reforçar exatamente esses tópicos.
                    </>
                  )}
                </p>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <p className="text-xs text-slate-400">
                    Sugerido em{' '}
                    <span className="font-medium text-slate-500">{formatDate(rec.createdAt)}</span>
                  </p>

                  {rec.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={updatingId === rec.id}
                        onClick={() => handleChangeStatus(rec.id, 'dismissed')}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-400 disabled:opacity-50"
                      >
                        <XCircle size={14} weight="bold" />
                        Pular por enquanto
                      </button>
                      <button
                        type="button"
                        disabled={updatingId === rec.id}
                        onClick={() => handleChangeStatus(rec.id, 'completed')}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"
                      >
                        <CheckCircle size={14} weight="bold" />
                        Marcar como concluído
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={updatingId === rec.id}
                      onClick={() => handleChangeStatus(rec.id, 'pending')}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-400 disabled:opacity-50"
                    >
                      <ArrowClockwise size={14} weight="bold" />
                      Mover para pendentes
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </section>
      )}
    </main>
  )
}

export default RecommendationsPage
