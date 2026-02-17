import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CaretLeft, ListBullets, CheckCircle, Article } from '@phosphor-icons/react'
import { contentService, Content } from '@/services/contentService'

export default function ContentReadingPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [content, setContent] = useState<Content | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)
  const [completeError, setCompleteError] = useState<string | null>(null)

  useEffect(() => {
    async function loadContent() {
      if (id) {
        try {
          const data = await contentService.getContentById(id)
          setContent(data)
        } catch (error) {
          console.error('Erro ao carregar aula:', error)
        }
      }
    }
    loadContent()
  }, [id])

  if (!content)
    return <div className="p-10 text-slate-400 italic text-center">Carregando conteúdo...</div>

  const levelLabel = content.level === 'reforco' ? 'Reforço' : `Nível ${content.level}`

  const isCompleted = content.userStatus?.completed || content.userStatus?.progress === 100

  const topicList = content.topics ? Object.values(content.topics) : []

  const tagList = Array.isArray(content.tags)
    ? content.tags
    : content.tags
      ? Object.keys(content.tags)
      : []

  async function handleMarkCompleted() {
    if (!content) return
    try {
      setIsCompleting(true)
      setCompleteError(null)

      await contentService.markContentCompleted(content.id)

      // Atualiza estado localmente para refletir o progresso concluído
      setContent((prev) =>
        prev
          ? {
              ...prev,
              userStatus: {
                ...(prev.userStatus ?? {}),
                completed: true,
                progress: 100,
              },
            }
          : prev
      )
    } catch (error) {
      console.error('Erro ao marcar conteúdo como concluído:', error)
      setCompleteError('Não foi possível marcar como concluído. Tente novamente.')
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <main className="p-10 w-full animate-in fade-in duration-500 bg-gray-50 min-h-screen">
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-8">
        <button
          onClick={() => navigate('/conteudos')}
          className="flex items-center gap-1 hover:text-slate-900 transition-colors"
        >
          <CaretLeft size={14} weight="bold" /> Voltar
        </button>
        <span>/</span>
        <span>{content.category?.name || 'Matéria'}</span>
        <span>/</span>
        <span className="text-slate-900 font-medium">{content.title}</span>
      </nav>

      <div className="max-w-5xl mx-auto space-y-6">
        <article className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <header className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px] font-bold uppercase">
                {content.category?.name && (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                    {content.category.name}
                  </span>
                )}
                {content.grade && (
                  <span className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded">
                    {content.grade}
                  </span>
                )}
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded">
                  {levelLabel}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 leading-tight">{content.title}</h1>
              {content.shortDescription && (
                <p className="mt-2 text-sm text-slate-500">{content.shortDescription}</p>
              )}
            </div>

            <button
              type="button"
              disabled={isCompleting || isCompleted}
              onClick={handleMarkCompleted}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 shrink-0
                ${
                  isCompleted
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                    : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed'
                }`}
            >
              <CheckCircle
                size={20}
                weight={isCompleted ? 'fill' : 'bold'}
                className={isCompleted ? 'text-emerald-600' : ''}
              />
              {isCompleted
                ? 'Conteúdo concluído'
                : isCompleting
                  ? 'Marcando...'
                  : 'Marcar como concluído'}
            </button>
          </header>

          <div className="p-8 space-y-8">
            {topicList.length > 0 && (
              <section className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold">
                  <ListBullets size={20} className="text-blue-600" weight="bold" /> Tópicos
                  abordados nesta aula
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {topicList.map((topic) => (
                    <div
                      key={topic.title}
                      className="flex items-center gap-3 text-sm text-slate-600"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                      {topic.title}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Article size={20} weight="fill" className="text-slate-400" /> Conteúdo da Aula
              </div>

              {content.sections && content.sections.length > 0 ? (
                <div className="space-y-8 text-sm leading-relaxed text-slate-600">
                  {content.sections.map((section) => (
                    <div key={section.sectionTitle}>
                      <h2 className="font-semibold text-slate-900 mb-2">{section.sectionTitle}</h2>
                      {section.html ? (
                        <div
                          className="prose prose-sm max-w-none text-slate-700"
                          dangerouslySetInnerHTML={{ __html: section.html }}
                        />
                      ) : (
                        <p className="whitespace-pre-wrap">{section.markdown}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">
                  {content.longDescription ?? content.contentText}
                </p>
              )}
            </section>

            {tagList.length > 0 && (
              <section className="pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">
                  Tags relacionadas
                </p>
                <div className="flex flex-wrap gap-2">
                  {tagList.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-[11px] rounded-full bg-slate-50 text-slate-500 font-medium border border-slate-100"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {completeError && <p className="text-xs text-red-500 font-medium">{completeError}</p>}
          </div>
        </article>
      </div>
    </main>
  )
}
