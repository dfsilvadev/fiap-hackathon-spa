import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Plus, X } from '@phosphor-icons/react'

import { MarkdownEditor } from '@/components/MarkdownEditor'
import { useAuth } from '@/hooks/useAuth'
import {
  contentService,
  type CategoryDto,
  type CreateContentPayload,
  type ContentTopic,
} from '@/services/contentService'
import { getTeacherSubjects } from '@/resources/teacherSubjectsResources'
import { CONTENT_GRADE_OPTIONS, CONTENT_LEVEL_OPTIONS } from '@/constants/content'
import { Routes } from '@/router/constants/routesMap'

const allowedRoles = ['teacher', 'coordinator']

export default function ContentCreatePage() {
  const navigate = useNavigate()
  const { isLoggedIn, me } = useAuth()

  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forbiddenMessage, setForbiddenMessage] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [contentText, setContentText] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [grade, setGrade] = useState('')
  const [level, setLevel] = useState('')
  const [topics, setTopics] = useState<string[]>([])
  const [topicInput, setTopicInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

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

  const addTopic = () => {
    const t = topicInput.trim()
    if (t && !topics.includes(t)) {
      setTopics((prev) => [...prev, t])
      setTopicInput('')
    }
  }

  const removeTopic = (index: number) => {
    setTopics((prev) => prev.filter((_, i) => i !== index))
  }

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t])
      setTagInput('')
    }
  }

  const removeTag = (index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setForbiddenMessage(null)

    if (!title.trim() || !contentText.trim() || !categoryId || !grade || !level) {
      setError('Preencha título, texto principal, matéria, série e nível.')
      return
    }

    try {
      setLoading(true)
      const topicsPayload: Record<string, ContentTopic> = topics.reduce(
        (acc, t, i) => ({ ...acc, [String(i)]: { title: t, content: '' } }),
        {}
      )

      const payload: CreateContentPayload = {
        title: title.trim(),
        contentText: contentText.trim(),
        categoryId,
        grade,
        level,
        topics: Object.keys(topicsPayload).length > 0 ? topicsPayload : undefined,
        tags: tags.length > 0 ? tags : undefined,
      }

      await contentService.createContent(payload)
      alert('Conteúdo criado com sucesso.')
      navigate(Routes.CONTENTS)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      if (
        message.includes('403') ||
        message.toLowerCase().includes('only manage') ||
        message.toLowerCase().includes('subjects you teach')
      ) {
        setForbiddenMessage('Você só pode criar conteúdos para as matérias que leciona.')
      } else {
        setError(message || 'Não foi possível criar o conteúdo.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isLoggedIn) return null

  return (
    <main className="min-h-screen bg-slate-50/80 p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <button
            type="button"
            onClick={() => navigate(Routes.CONTENTS)}
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={18} weight="bold" />
            Voltar
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Novo Conteúdo</h1>
          <p className="mt-1 text-sm text-slate-600">
            Crie um novo conteúdo pedagógico para a plataforma.
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Informações Básicas</h2>
            <p className="mt-1 text-sm text-slate-500">Dados principais sobre o conteúdo</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Digite o título do conteúdo"
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
                  <option value="">Selecionar disciplina</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Série <span className="text-red-500">*</span>
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  <option value="">Selecionar série</option>
                  {CONTENT_GRADE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
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
                  <option value="">Selecionar nível</option>
                  {CONTENT_LEVEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Conteúdo</h2>
            <p className="mt-1 text-sm text-slate-500">Texto principal do conteúdo pedagógico</p>
            <div className="mt-4">
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Texto do Conteúdo <span className="text-red-500">*</span>
              </label>
              <MarkdownEditor
                value={contentText}
                onChange={setContentText}
                placeholder="Digite o conteúdo pedagógico aqui..."
                minHeight={320}
                required
              />
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                <span>suporta markdown</span>
              </p>
            </div>
          </div>

          {/* Tópicos */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Tópicos</h2>
            <p className="mt-1 text-sm text-slate-500">
              Tópicos abordados neste conteúdo (opcional)
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                placeholder="Adicionar tópico"
                className="flex-1 min-w-[160px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={addTopic}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
              >
                <Plus size={20} weight="bold" />
              </button>
            </div>
            {topics.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {topics.map((t, i) => (
                  <span
                    key={`${t}-${i}`}
                    className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-3 py-1.5 text-sm text-cyan-800"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTopic(i)}
                      className="rounded-full p-0.5 hover:bg-cyan-200"
                    >
                      <X size={14} weight="bold" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Tags</h2>
            <p className="mt-1 text-sm text-slate-500">
              Tags para categorização e recomendações (importante para o sistema de reforço)
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Adicionar tag"
                className="flex-1 min-w-[160px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={addTag}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
              >
                <Plus size={20} weight="bold" />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((t, i) => (
                  <span
                    key={`${t}-${i}`}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-3 py-1.5 text-sm text-slate-700"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTag(i)}
                      className="rounded-full p-0.5 hover:bg-slate-300"
                    >
                      <X size={14} weight="bold" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(Routes.CONTENTS)}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
            >
              <FileText size={20} weight="bold" />
              {loading ? 'Salvando...' : 'Criar Conteúdo'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
