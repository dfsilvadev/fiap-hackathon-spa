import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText } from '@phosphor-icons/react'

import { useAuth } from '@/hooks/useAuth'
import { learningPathService } from '@/services/learningPathService'
import { contentService, type Content, type CategoryDto } from '@/services/contentService'
import { getTeacherSubjects } from '@/resources/teacherSubjectsResources'
import { CONTENT_GRADE_OPTIONS } from '@/constants/content'
import { Routes } from '@/router/constants/routesMap'

const allowedRoles = ['teacher', 'coordinator']

function getLevelLabel(level?: string) {
  if (!level) return ''
  if (level === 'reforco') return 'Reforço'
  return `Nível ${level}`
}

type SelectedContent = { contentId: string; title: string; level: string }

export default function PathCreatePage() {
  const navigate = useNavigate()
  const { isLoggedIn, me } = useAuth()

  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [availableContents, setAvailableContents] = useState<Content[]>([])
  const [loadingContents, setLoadingContents] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forbiddenMessage, setForbiddenMessage] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [grade, setGrade] = useState('')
  const [description, setDescription] = useState('')
  const [isDefault, setIsDefault] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<SelectedContent[]>([])

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
    if (!categoryId || !grade) {
      setAvailableContents([])
      return
    }
    const load = async () => {
      setLoadingContents(true)
      try {
        const [r1, r2, r3] = await Promise.all([
          contentService.getContents({
            categoryId,
            grade,
            level: '1',
            isActive: true,
            limit: 100,
          }),
          contentService.getContents({
            categoryId,
            grade,
            level: '2',
            isActive: true,
            limit: 100,
          }),
          contentService.getContents({
            categoryId,
            grade,
            level: '3',
            isActive: true,
            limit: 100,
          }),
        ])
        const all = [...r1.contents, ...r2.contents, ...r3.contents]
        setAvailableContents(all)
      } catch {
        setAvailableContents([])
      } finally {
        setLoadingContents(false)
      }
    }
    load()
  }, [categoryId, grade])

  const alreadySelectedIds = new Set(selectedOrder.map((s) => s.contentId))
  const canAdd = (c: Content) => !alreadySelectedIds.has(c.id)

  const addContent = (c: Content) => {
    if (!canAdd(c)) return
    setSelectedOrder((prev) => [...prev, { contentId: c.id, title: c.title, level: c.level ?? '' }])
  }

  const removeAt = (index: number) => {
    setSelectedOrder((prev) => prev.filter((_, i) => i !== index))
  }

  const moveUp = (index: number) => {
    if (index <= 0) return
    setSelectedOrder((prev) => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }

  const moveDown = (index: number) => {
    if (index >= selectedOrder.length - 1) return
    setSelectedOrder((prev) => {
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setForbiddenMessage(null)
    if (!name.trim() || !categoryId || !grade) {
      setError('Preencha nome, matéria e série.')
      return
    }
    try {
      setSaving(true)
      const created = await learningPathService.create({
        name: name.trim(),
        categoryId,
        grade,
        isDefault,
        description: description.trim() || undefined,
      })
      for (let i = 0; i < selectedOrder.length; i++) {
        await learningPathService.addContent(created.id, {
          contentId: selectedOrder[i].contentId,
          orderNumber: i,
        })
      }
      navigate(Routes.TRIALS_DETAIL.replace(':id', created.id))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      if (message.includes('403') || message.toLowerCase().includes('only manage')) {
        setForbiddenMessage('Você só pode criar trilhas para as matérias que leciona.')
      } else {
        setError(message || 'Não foi possível criar a trilha.')
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
            onClick={() => navigate(Routes.TRIALS)}
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={18} weight="bold" />
            Voltar
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nova Trilha</h1>
          <p className="mt-1 text-sm text-slate-600">Crie uma nova trilha de aprendizado</p>
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
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Informações da Trilha</h2>
            <p className="mt-1 text-sm text-slate-500">Dados básicos da trilha</p>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex.: Trilha de Matemática - 7º Ano"
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
                  onChange={(e) => {
                    setCategoryId(e.target.value)
                    setSelectedOrder([])
                  }}
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
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Série <span className="text-red-500">*</span>
                </label>
                <select
                  value={grade}
                  onChange={(e) => {
                    setGrade(e.target.value)
                    setSelectedOrder([])
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
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
                <label className="mb-1 block text-sm font-semibold text-slate-700">Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Descrição da trilha"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isDefault}
                  onClick={() => setIsDefault((v) => !v)}
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isDefault ? 'border-blue-600 bg-blue-600' : 'border-slate-200 bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                      isDefault ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-slate-700">
                  Trilha padrão para esta matéria/série
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Conteúdos da Trilha</h2>
            <p className="mt-1 text-sm text-slate-500">
              Adicione e ordene os conteúdos (apenas níveis 1, 2 e 3 — reforço não entra na trilha)
            </p>

            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-slate-700">
                Conteúdos selecionados (em ordem)
              </p>
              {selectedOrder.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-6 text-center text-sm text-slate-500">
                  Nenhum conteúdo adicionado à trilha
                </p>
              ) : (
                <ul className="space-y-2">
                  {selectedOrder.map((item, index) => (
                    <li
                      key={item.contentId}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2"
                    >
                      <span className="text-sm text-slate-800">
                        {index + 1}. {item.title}{' '}
                        <span className="text-slate-500">({getLevelLabel(item.level)})</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          className="rounded p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-40"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveDown(index)}
                          disabled={index === selectedOrder.length - 1}
                          className="rounded p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-40"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeAt(index)}
                          className="rounded p-1 text-red-500 hover:bg-red-50"
                        >
                          Remover
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-slate-700">Conteúdos disponíveis</p>
              {!categoryId || !grade ? (
                <p className="text-sm text-slate-500">
                  Selecione matéria e série para carregar os conteúdos.
                </p>
              ) : loadingContents ? (
                <p className="text-sm text-slate-500">Carregando...</p>
              ) : availableContents.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Nenhum conteúdo ativo (níveis 1, 2 ou 3) para esta matéria e série.
                </p>
              ) : (
                <ul className="space-y-2">
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
                        onClick={() => addContent(c)}
                        disabled={!canAdd(c)}
                        className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        + Adicionar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(Routes.TRIALS)}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
            >
              <FileText size={20} weight="bold" />
              {saving ? 'Criando...' : 'Criar trilha'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
