import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, FloppyDisk } from '@phosphor-icons/react'

import { useAuth } from '@/hooks/useAuth'
import { assessmentService, type AssessmentDetailDto } from '@/services/assessmentService'
import { ASSESSMENT_LEVEL_OPTIONS } from '@/constants/assessment'
import { Routes } from '@/router/constants/routesMap'

const allowedRoles = ['teacher', 'coordinator']

function getLevelLabel(level?: string) {
  if (!level) return '—'
  const opt = ASSESSMENT_LEVEL_OPTIONS.find((o) => o.value === level)
  return opt?.label ?? level
}

export default function AssessmentEditPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { isLoggedIn, me } = useAuth()

  const [assessment, setAssessment] = useState<AssessmentDetailDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forbiddenMessage, setForbiddenMessage] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [minScore, setMinScore] = useState(70)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isActive, setIsActive] = useState(true)

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
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        setNotFound(false)
        setForbiddenMessage(null)
        const data = await assessmentService.getById(id)
        setAssessment(data)
        setTitle(data.title)
        setDescription(data.description ?? '')
        setMinScore(data.minScore ?? 70)
        setStartDate(data.startDate ? new Date(data.startDate).toISOString().slice(0, 16) : '')
        setEndDate(data.endDate ? new Date(data.endDate).toISOString().slice(0, 16) : '')
        setIsActive(data.isActive !== false)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        if (message.includes('404') || message.toLowerCase().includes('not found')) {
          setNotFound(true)
        } else if (message.includes('403') || message.toLowerCase().includes('only manage')) {
          setForbiddenMessage('Você não tem permissão para editar esta avaliação.')
        } else {
          setError('Não foi possível carregar a avaliação.')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, me, isLoggedIn])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setError(null)
    setForbiddenMessage(null)
    const min = Number(minScore)
    if (Number.isNaN(min) || min < 0 || min > 100) {
      setError('Nota mínima deve ser entre 0 e 100.')
      return
    }
    try {
      setSaving(true)
      await assessmentService.update(id, {
        title: title.trim(),
        description: description.trim() || undefined,
        minScore: min,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        isActive,
      })
      navigate(Routes.ASSESSMENTS_QUESTIONS.replace(':id', id))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      if (message.includes('403') || message.toLowerCase().includes('only manage')) {
        setForbiddenMessage('Você não tem permissão para editar esta avaliação.')
      } else {
        setError(message || 'Não foi possível salvar.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (!isLoggedIn) return null

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50/80 p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          <p className="text-sm text-slate-500">Carregando avaliação...</p>
        </div>
      </main>
    )
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-slate-50/80 p-8">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="font-medium text-slate-700">Avaliação não encontrada.</p>
          <button
            type="button"
            onClick={() => navigate(Routes.ASSESSMENTS)}
            className="mt-4 text-sm font-semibold text-blue-600 hover:underline"
          >
            Voltar para a lista
          </button>
        </div>
      </main>
    )
  }

  if (!assessment) {
    return (
      <main className="min-h-screen bg-slate-50/80 p-8">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">Nenhum dado para exibir.</p>
          <button
            type="button"
            onClick={() => navigate(Routes.ASSESSMENTS)}
            className="mt-4 text-sm font-semibold text-blue-600 hover:underline"
          >
            Voltar
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50/80 p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <button
            type="button"
            onClick={() => navigate(Routes.ASSESSMENTS_QUESTIONS.replace(':id', id!))}
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={18} weight="bold" />
            Voltar
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Editar Avaliação</h1>
          <p className="mt-1 text-sm text-slate-600">
            Altere título, descrição, datas e status. Matéria e nível não podem ser alterados.
          </p>
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

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Matéria</label>
              <input
                type="text"
                value={assessment.category?.name ?? ''}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Nível</label>
              <input
                type="text"
                value={getLevelLabel(assessment.level)}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Descrição</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Nota mínima (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Data de início
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Data de fim
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() => setIsActive((v) => !v)}
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isActive ? 'border-blue-600 bg-blue-600' : 'border-slate-200 bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    isActive ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-slate-700">Avaliação ativa</span>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => navigate(Routes.ASSESSMENTS_QUESTIONS.replace(':id', id!))}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
            >
              <FloppyDisk size={20} weight="bold" />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
