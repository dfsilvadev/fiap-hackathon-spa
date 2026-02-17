import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FloppyDisk, Plus, Trash } from '@phosphor-icons/react'

import { useAuth } from '@/hooks/useAuth'
import { assessmentService } from '@/services/assessmentService'
import { contentService, type CategoryDto } from '@/services/contentService'
import { getTeacherSubjects } from '@/resources/teacherSubjectsResources'
import { ASSESSMENT_LEVEL_OPTIONS, QUESTION_TYPE_OPTIONS } from '@/constants/assessment'
import { CONTENT_GRADE_OPTIONS } from '@/constants/content'
import { Routes } from '@/router/constants/routesMap'

const allowedRoles = ['teacher', 'coordinator']

type QuestionDraft = {
  questionText: string
  questionType: string
  points: number
  options: string[]
  correctAnswer: string
  tags: string[]
  tagInput: string
}

const emptyQuestion = (): QuestionDraft => ({
  questionText: '',
  questionType: 'multiple_choice',
  points: 1,
  options: ['', '', '', ''],
  correctAnswer: '',
  tags: [],
  tagInput: '',
})

export default function AssessmentCreatePage() {
  const navigate = useNavigate()
  const { isLoggedIn, me } = useAuth()

  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forbiddenMessage, setForbiddenMessage] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [grade, setGrade] = useState('')
  const [level, setLevel] = useState('')
  const [description, setDescription] = useState('')
  const [minScore, setMinScore] = useState(70)
  const [questions, setQuestions] = useState<QuestionDraft[]>([emptyQuestion()])

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

  const addQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion()])
  }

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index))
  }

  const updateQuestion = (index: number, field: keyof QuestionDraft, value: unknown) => {
    setQuestions((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const setQuestionOption = (qIndex: number, optIndex: number, value: string) => {
    setQuestions((prev) => {
      const next = [...prev]
      const opts = [...(next[qIndex].options || ['', '', '', ''])]
      opts[optIndex] = value
      next[qIndex] = { ...next[qIndex], options: opts }
      return next
    })
  }

  const addQuestionTag = (qIndex: number) => {
    setQuestions((prev) => {
      const next = [...prev]
      const draft = next[qIndex]
      const t = draft.tagInput.trim()
      if (!t || draft.tags.includes(t)) return prev
      next[qIndex] = {
        ...draft,
        tags: [...draft.tags, t],
        tagInput: '',
      }
      return next
    })
  }

  const removeQuestionTag = (qIndex: number, tagIndex: number) => {
    setQuestions((prev) => {
      const next = [...prev]
      const draft = next[qIndex]
      next[qIndex] = {
        ...draft,
        tags: draft.tags.filter((_, i) => i !== tagIndex),
      }
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setForbiddenMessage(null)
    if (!title.trim() || !categoryId || !level) {
      setError('Preencha título, matéria e nível.')
      return
    }
    const min = Number(minScore)
    if (Number.isNaN(min) || min < 0 || min > 100) {
      setError('Nota mínima deve ser entre 0 e 100.')
      return
    }
    try {
      setSaving(true)
      const created = await assessmentService.create({
        title: title.trim(),
        categoryId,
        level,
        startDate: new Date().toISOString(),
        description: description.trim() || undefined,
        minScore: min,
      })
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        if (!q.questionText.trim() || !q.correctAnswer.trim()) continue
        const tags = q.tags
        const options = q.questionType === 'multiple_choice' ? q.options.filter(Boolean) : undefined
        await assessmentService.createQuestion(created.id, {
          questionText: q.questionText.trim(),
          questionType: q.questionType,
          correctAnswer: q.correctAnswer.trim().toLowerCase(),
          orderNumber: i,
          points: q.points,
          options,
          tags: tags.length ? tags : undefined,
        })
      }
      navigate(Routes.ASSESSMENTS_QUESTIONS.replace(':id', created.id))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      if (message.includes('403') || message.toLowerCase().includes('only manage')) {
        setForbiddenMessage('Você só pode criar avaliações para as matérias que leciona.')
      } else {
        setError(message || 'Não foi possível criar a avaliação.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (!isLoggedIn) return null

  return (
    <main className="min-h-screen bg-slate-50/80 p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <button
            type="button"
            onClick={() => navigate(Routes.ASSESSMENTS)}
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={18} weight="bold" />
            Voltar
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nova Avaliação</h1>
          <p className="mt-1 text-sm text-slate-600">Crie uma nova avaliação</p>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações da Avaliação */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Informações da Avaliação</h2>
            <p className="mt-1 text-sm text-slate-500">Dados básicos da avaliação</p>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Avaliação de Matemática - Nível 1"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Matéria <span className="text-red-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  <option value="">Selecione a matéria</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Descreva o objetivo da avaliação"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Série</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Selecione a série</option>
                    {CONTENT_GRADE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Nível <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  >
                    <option value="">Selecione o nível</option>
                    {ASSESSMENT_LEVEL_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
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
            </div>
          </div>

          {/* Questões */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Questões</h2>
                <p className="mt-1 text-sm text-slate-500">Adicione as questões da avaliação</p>
              </div>
              <button
                type="button"
                onClick={addQuestion}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
              >
                <Plus size={18} weight="bold" />
                Adicionar questão
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {questions.map((q, index) => (
                <div key={index} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="font-semibold text-slate-800">Questão {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      disabled={questions.length <= 1}
                      className="rounded p-2 text-slate-400 hover:bg-slate-200 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Remover questão"
                    >
                      <Trash size={18} weight="bold" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Enunciado
                      </label>
                      <textarea
                        value={q.questionText}
                        onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
                        rows={3}
                        placeholder="Digite o enunciado da questão"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                          Tipo
                        </label>
                        <select
                          value={q.questionType}
                          onChange={(e) => updateQuestion(index, 'questionType', e.target.value)}
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
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                          Pontos
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={q.points}
                          onChange={(e) =>
                            updateQuestion(index, 'points', Number(e.target.value) || 1)
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                    {q.questionType === 'multiple_choice' && (
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Alternativas
                        </label>
                        <div className="space-y-2">
                          {(q.options || ['', '', '', '']).map((opt, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-3">
                              <input
                                type="radio"
                                name={`q-${index}-correct`}
                                checked={
                                  (q.correctAnswer || '').trim().toLowerCase() ===
                                  opt.trim().toLowerCase()
                                }
                                onChange={() => updateQuestion(index, 'correctAnswer', opt)}
                                className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => setQuestionOption(index, optIndex, e.target.value)}
                                placeholder={`Alternativa ${optIndex + 1}`}
                                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Resposta correta
                      </label>
                      <input
                        type="text"
                        value={q.correctAnswer}
                        onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                        placeholder="Digite a resposta correta (igual a uma das alternativas)"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Tags (opcional)
                      </label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <input
                          type="text"
                          value={q.tagInput}
                          onChange={(e) => updateQuestion(index, 'tagInput', e.target.value)}
                          onKeyDown={(e) =>
                            e.key === 'Enter' && (e.preventDefault(), addQuestionTag(index))
                          }
                          placeholder="Adicionar tag"
                          className="flex-1 min-w-[160px] rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => addQuestionTag(index)}
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100"
                        >
                          <Plus size={18} weight="bold" />
                        </button>
                      </div>
                      {q.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {q.tags.map((tag, tagIndex) => (
                            <span
                              key={`${tag}-${tagIndex}`}
                              className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-3 py-1.5 text-xs text-slate-700"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeQuestionTag(index, tagIndex)}
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
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(Routes.ASSESSMENTS)}
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
