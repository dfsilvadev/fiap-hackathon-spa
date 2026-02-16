import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CaretLeft, ListBullets, CheckCircle, Article } from '@phosphor-icons/react'
import { contentService, Content } from '@/services/contentService'

export default function ContentReadingPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [content, setContent] = useState<Content | null>(null)

  useEffect(() => {
    async function loadContent() {
      if (id) {
        try {
          const data = await contentService.getContentById(id)
          setContent(data)
        } catch (error) {
          console.error("Erro ao carregar aula:", error)
        }
      }
    }
    loadContent()
  }, [id])

  if (!content) return <div className="p-10 text-slate-400 italic text-center">Carregando conteúdo...</div>

  return (
    <main className="p-10 w-full animate-in fade-in duration-500 bg-gray-50 min-h-screen">
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-8">
        <button onClick={() => navigate('/conteudos')} className="flex items-center gap-1 hover:text-slate-900 transition-colors">
          <CaretLeft size={14} weight="bold" /> Voltar para Conteúdos
        </button>
        <span>/</span>
        <span>{content.category?.name || 'Aula'}</span>
        <span>/</span>
        <span className="text-slate-900 font-medium">{content.title}</span>
      </nav>

      <div className="max-w-5xl mx-auto space-y-6">
        <article className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <header className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex gap-2 mb-3">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase">{content.category?.name}</span>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded uppercase">
                  {content.level === 'reforco' ? 'Reforço' : `Nível ${content.level}`}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 leading-tight">{content.title}</h1>
            </div>

            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 shrink-0">
              <CheckCircle size={20} weight="fill" /> Marcar como Concluído
            </button>
          </header>

          <div className="p-8 space-y-8">
            {content.topics && content.topics.length > 0 && (
              <section className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold">
                  <ListBullets size={20} className="text-blue-600" weight="bold" /> Tópicos abordados
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {content.topics.map(topic => (
                    <div key={topic} className="flex items-center gap-3 text-sm text-slate-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                      {topic}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Article size={20} weight="fill" className="text-slate-400" /> Conteúdo da Aula
              </div>
              <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">{content.contentText}</p>
            </section>
          </div>
        </article>
      </div>
    </main>
  )
}