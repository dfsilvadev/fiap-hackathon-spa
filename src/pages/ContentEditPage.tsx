import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, FloppyDisk, Plus, X } from '@phosphor-icons/react'

import { MarkdownEditor } from '@/components/MarkdownEditor'
import { useAuth } from '@/hooks/useAuth'
import {
  contentService,
  Content,
  type ContentTopic,
  type UpdateContentPayload,
} from '@/services/contentService'
import { CONTENT_GRADE_OPTIONS, CONTENT_LEVEL_OPTIONS } from '@/constants/content'
import { Routes } from '@/router/constants/routesMap'

const allowedRoles = ['teacher', 'coordinator']

function topicsFromContent(content: Content): string[] {
  if (!content.topics || typeof content.topics !== 'object') return []
  const rec = content.topics as Record<string, ContentTopic>
  return Object.values(rec)
    .filter((t) => t && typeof t === 'object' && typeof (t as ContentTopic).title === 'string')
    .map((t) => (t as ContentTopic).title)
}

function tagsFromContent(content: Content): string[] {
  if (Array.isArray(content.tags)) return content.tags
  if (content.tags && typeof content.tags === 'object') return Object.keys(content.tags)
  return []
}

export default function ContentEditPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { isLoggedIn, me } = useAuth()

  const [content, setContent] = useState<Content | null>(null)
  const [loadingContent, setLoadingContent] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forbiddenMessage, setForbiddenMessage] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  const [title, setTitle] = useState('')
  const [contentText, setContentText] = useState('')
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
    if (!id || !me || !allowedRoles.includes(me.role)) return

    const load = async () => {
      try {
        setLoadingContent(true)
        setError(null)
        setNotFound(false)
        setForbiddenMessage(null)

        const data = await contentService.getContentById(id)
        setContent(data)
        setTitle(data.title)
        setContentText(data.contentText ?? '')
        setGrade(data.grade ?? '')
        setLevel(data.level ?? '')
        setTopics(topicsFromContent(data))
        setTags(tagsFromContent(data))
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        if (message.includes('404') || message.toLowerCase().includes('not found')) {
          setNotFound(true)
        } else if (message.includes('403') || message.toLowerCase().includes('only manage')) {
          setForbiddenMessage('Você não tem permissão para editar este conteúdo.')
        } else {
          setError('Não foi possível carregar o conteúdo.')
        }
      } finally {
        setLoadingContent(false)
      }
    }

    load()
  }, [id, me, isLoggedIn])

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
    if (!id) return
    setError(null)
    setForbiddenMessage(null)

    if (!title.trim() || !contentText.trim() || !grade || !level) {
      setError('Preencha título, texto principal, série e nível.')
      return
    }

    try {
      setSaving(true)
      const topicsPayload: Record<string, ContentTopic> = topics.reduce(
        (acc, t, i) => ({ ...acc, [String(i)]: { title: t, content: '' } }),
        {}
      )

      const payload: UpdateContentPayload = {
        title: title.trim(),
        contentText: contentText.trim(),
        grade,
        level,
        topics: Object.keys(topicsPayload).length > 0 ? topicsPayload : undefined,
        tags: tags.length > 0 ? tags : undefined,
      }

      await contentService.updateContent(id, payload)
      alert('Conteúdo atualizado com sucesso.')
      navigate(Routes.CONTENTS)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      if (message.includes('403') || message.toLowerCase().includes('only manage')) {
        setForbiddenMessage('Você não tem permissão para editar este conteúdo.')
      } else {
        setError(message || 'Não foi possível salvar as alterações.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (!isLoggedIn) return null

  if (loadingContent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50/80 p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          <p className="text-sm text-slate-500">Carregando conteúdo...</p>
        </div>
      </main>
    )
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-slate-50/80 p-8">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="font-medium text-slate-700">Conteúdo não encontrado.</p>
          <button
            type="button"
            onClick={() => navigate(Routes.CONTENTS)}
            className="mt-4 text-sm font-semibold text-blue-600 hover:underline"
          >
            Voltar para a lista
          </button>
        </div>
      </main>
    )
  }

  if (!content) {
    return (
      <main className="min-h-screen bg-slate-50/80 p-8">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">Nenhum dado para exibir.</p>
          <button
            type="button"
            onClick={() => navigate(Routes.CONTENTS)}
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Editar Conteúdo</h1>
          <p className="mt-1 text-sm text-slate-600">Atualize os dados do conteúdo pedagógico.</p>
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
            <p className="mt-1 text-sm text-slate-500">Dados principais do conteúdo</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
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
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Matéria <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={content.category?.name ?? ''}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600"
                />
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
                Texto do conteúdo <span className="text-red-500">*</span>
              </label>
              <MarkdownEditor
                value={contentText}
                onChange={setContentText}
                minHeight={320}
                required
              />
              <p className="mt-1 text-xs text-slate-400">Markdown suportado</p>
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
