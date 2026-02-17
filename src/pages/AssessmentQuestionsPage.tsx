import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CaretDown, CaretUp, PencilSimple, Plus, Trash } from '@phosphor-icons/react'

import { useAuth } from '@/hooks/useAuth'
import {
  assessmentService,
  type AssessmentDetailDto,
  type AssessmentQuestionItem,
  type CreateQuestionPayload,
  type UpdateQuestionPayload,
} from '@/services/assessmentService'
import { QUESTION_TYPE_OPTIONS } from '@/constants/assessment'
import { Routes } from '@/router/constants/routesMap'

const allowedRoles = ['teacher', 'coordinator']

function optionsToArray(opts: AssessmentQuestionItem['options']): string[] {
  if (Array.isArray(opts)) return opts
  if (opts && typeof opts === 'object') return Object.values(opts) as string[]
  return []
}

export default function AssessmentQuestionsPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { isLoggedIn, me } = useAuth()

  const [assessment, setAssessment] = useState<AssessmentDetailDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [forbiddenMessage, setForbiddenMessage] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formQuestionText, setFormQuestionText] = useState('')
  const [formQuestionType, setFormQuestionType] = useState('multiple_choice')
  const [formPoints, setFormPoints] = useState(1)
  const [formCorrectAnswer, setFormCorrectAnswer] = useState('')
  const [formOptions, setFormOptions] = useState(['', '', '', ''])
  const [formTags, setFormTags] = useState<string[]>([])
  const [formTagsInput, setFormTagsInput] = useState('')
  const [saving, setSaving] = useState(false)

  const loadAssessment = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)
      setNotFound(false)
      setForbiddenMessage(null)
      const data = await assessmentService.getById(id)
      setAssessment(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      if (message.includes('404') || message.toLowerCase().includes('not found')) {
        setNotFound(true)
      } else if (message.includes('403') || message.toLowerCase().includes('only manage')) {
        setForbiddenMessage('Você não tem permissão para gerenciar esta avaliação.')
      } else {
        setError('Não foi possível carregar a avaliação.')
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
    loadAssessment()
  }, [id, me, isLoggedIn, loadAssessment])

  const questions = assessment?.questions ?? []
  const sortedQuestions = [...questions].sort((a, b) => a.orderNumber - b.orderNumber)

  const resetForm = () => {
    setShowAddForm(false)
    setEditingId(null)
    setFormQuestionText('')
    setFormQuestionType('multiple_choice')
    setFormPoints(1)
    setFormCorrectAnswer('')
    setFormOptions(['', '', '', ''])
    setFormTags([])
    setFormTagsInput('')
  }

  const openEdit = (q: AssessmentQuestionItem) => {
    setEditingId(q.id)
    setFormQuestionText(q.questionText)
    setFormQuestionType(q.questionType || 'multiple_choice')
    setFormPoints(q.points ?? 1)
    setFormCorrectAnswer(q.correctAnswer ?? '')
    const opts = optionsToArray(q.options)
    setFormOptions(opts.length >= 4 ? opts.slice(0, 4) : [...opts, '', '', ''].slice(0, 4))
    const rawTags: unknown = q.tags
    const tagsArray: string[] = Array.isArray(rawTags)
      ? rawTags
      : rawTags && typeof rawTags === 'object'
        ? (Object.values(rawTags) as string[])
        : []
    setFormTags(tagsArray)
    setFormTagsInput('')
  }

  const addFormTag = () => {
    setFormTags((prev) => {
      const t = formTagsInput.trim()
      if (!t || prev.includes(t)) return prev
      setFormTagsInput('')
      return [...prev, t]
    })
  }

  const removeFormTag = (index: number) => {
    setFormTags((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setActionError(null)
    const orderNumber = questions.length
    const options = formQuestionType === 'multiple_choice' ? formOptions.filter(Boolean) : undefined
    const tags = formTags
    const payload: CreateQuestionPayload = {
      questionText: formQuestionText.trim(),
      questionType: formQuestionType,
      correctAnswer: formCorrectAnswer.trim().toLowerCase(),
      orderNumber,
      points: formPoints,
      options,
      tags: tags.length ? tags : undefined,
    }
    try {
      setSaving(true)
      await assessmentService.createQuestion(id, payload)
      await loadAssessment()
      resetForm()
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !editingId) return
    setActionError(null)
    const options = formQuestionType === 'multiple_choice' ? formOptions.filter(Boolean) : undefined
    const tags = formTags
    const payload: UpdateQuestionPayload = {
      questionText: formQuestionText.trim(),
      questionType: formQuestionType,
      correctAnswer: formCorrectAnswer.trim().toLowerCase(),
      points: formPoints,
      options,
      tags: tags.length ? tags : undefined,
    }
    try {
      setSaving(true)
      await assessmentService.updateQuestion(id, editingId, payload)
      await loadAssessment()
      resetForm()
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!id || !window.confirm('Remover esta questão?')) return
    setActionError(null)
    try {
      await assessmentService.deleteQuestion(id, questionId)
      await loadAssessment()
    } catch {
      setActionError('Não foi possível remover a questão.')
    }
  }

  const moveQuestion = async (index: number, direction: 'up' | 'down') => {
    if (!id || sortedQuestions.length === 0) return
    const newOrder = [...sortedQuestions]
    const swap = direction === 'up' ? index - 1 : index + 1
    if (swap < 0 || swap >= newOrder.length) return
    ;[newOrder[index], newOrder[swap]] = [newOrder[swap], newOrder[index]]
    setActionError(null)
    try {
      for (let i = 0; i < newOrder.length; i++) {
        await assessmentService.updateQuestion(id, newOrder[i].id, {
          orderNumber: i,
        })
      }
      await loadAssessment()
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

  const getTypeLabel = (type: string) =>
    QUESTION_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type

  return (
    <main className="min-h-screen bg-slate-50/80 p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <button
            type="button"
            onClick={() => navigate(Routes.ASSESSMENTS)}
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={18} weight="bold" />
            Voltar
          </button>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{assessment.title}</h1>
              {assessment.description && (
                <p className="mt-1 text-sm text-slate-600">{assessment.description}</p>
              )}
              <p className="mt-2 text-xs text-slate-500">
                {assessment.category?.name} • Nível {assessment.level} • Nota mín.{' '}
                {assessment.minScore ?? 70}%
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(Routes.ASSESSMENTS_EDIT.replace(':id', id!))}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <PencilSimple size={18} weight="bold" />
              Editar avaliação
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
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-900">Questões</h2>
            <button
              type="button"
              onClick={() => {
                resetForm()
                setShowAddForm(true)
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={18} weight="bold" />
              Adicionar questão
            </button>
          </div>

          {(showAddForm || editingId) && (
            <form
              onSubmit={editingId ? handleUpdateQuestion : handleAddQuestion}
              className="mt-6 rounded-xl border border-slate-200 bg-slate-50/50 p-4"
            >
              <h3 className="font-semibold text-slate-800">
                {editingId ? 'Editar questão' : 'Nova questão'}
              </h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Enunciado <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formQuestionText}
                    onChange={(e) => setFormQuestionText(e.target.value)}
                    rows={3}
                    placeholder="Digite o enunciado da questão"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Tipo <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formQuestionType}
                      onChange={(e) => setFormQuestionType(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {QUESTION_TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Pontos</label>
                    <input
                      type="number"
                      min={1}
                      value={formPoints}
                      onChange={(e) => setFormPoints(Number(e.target.value) || 1)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
                {formQuestionType === 'multiple_choice' && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Alternativas
                    </label>
                    <div className="space-y-2">
                      {formOptions.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-sm text-slate-500 w-6">{i + 1}.</span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const next = [...formOptions]
                              next[i] = e.target.value
                              setFormOptions(next)
                            }}
                            placeholder={`Alternativa ${i + 1}`}
                            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Resposta correta <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formCorrectAnswer}
                    onChange={(e) => setFormCorrectAnswer(e.target.value)}
                    placeholder="Digite a resposta correta (igual a uma das alternativas)"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Tags (opcional)
                  </label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <input
                      type="text"
                      value={formTagsInput}
                      onChange={(e) => setFormTagsInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFormTag())}
                      placeholder="Adicionar tag"
                      className="flex-1 min-w-[160px] rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={addFormTag}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100"
                    >
                      <Plus size={18} weight="bold" />
                    </button>
                  </div>
                  {formTags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formTags.map((tag, index) => (
                        <span
                          key={`${tag}-${index}`}
                          className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-3 py-1.5 text-xs text-slate-700"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeFormTag(index)}
                            className="rounded-full p-0.5 hover:bg-slate-300"
                          >
                            <Trash size={12} weight="bold" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? 'Salvando...' : editingId ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 space-y-3">
            {sortedQuestions.length === 0 && !showAddForm ? (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-8 text-center text-sm text-slate-500">
                Nenhuma questão. Clique em &quot;Adicionar questão&quot; para criar.
              </p>
            ) : (
              sortedQuestions.map((q, index) => (
                <div
                  key={q.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/30 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800">
                      Questão {index + 1}
                      {editingId === q.id && (
                        <span className="ml-2 text-xs text-blue-600">(editando)</span>
                      )}
                    </p>
                    <p className="mt-1 text-sm text-slate-600 line-clamp-2">{q.questionText}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {getTypeLabel(q.questionType)} • {q.points ?? 1} pt(s)
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveQuestion(index, 'up')}
                      disabled={index === 0}
                      className="rounded p-1.5 text-slate-500 hover:bg-slate-200 disabled:opacity-40"
                    >
                      <CaretUp size={18} weight="bold" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveQuestion(index, 'down')}
                      disabled={index === sortedQuestions.length - 1}
                      className="rounded p-1.5 text-slate-500 hover:bg-slate-200 disabled:opacity-40"
                    >
                      <CaretDown size={18} weight="bold" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(q)}
                      className="rounded p-1.5 text-slate-500 hover:bg-slate-200"
                    >
                      <PencilSimple size={18} weight="bold" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="rounded p-1.5 text-red-500 hover:bg-red-50"
                    >
                      <Trash size={18} weight="bold" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
