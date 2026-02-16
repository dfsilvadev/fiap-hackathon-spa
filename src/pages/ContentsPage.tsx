import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  MagnifyingGlass, Funnel, Article, Sparkle, CaretRight 
} from '@phosphor-icons/react'
import { contentService, Content } from '@/services/contentService'

export default function ContentsPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState('Todos')
  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await contentService.getContentsForStudent()
        // Garantindo que acessamos a propriedade 'contents' do objeto retornado
        if (data && data.contents) {
          setContents(data.contents)
        } else {
          setContents([])
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        setContents([])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredContents = contents.filter(c => {
    const matchesSearch = c.title?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = levelFilter === 'Todos' || 
                         (levelFilter === 'Reforço' && c.level === 'reforco') ||
                         c.level === levelFilter.replace('Nível ', '')
    return matchesSearch && matchesLevel
  })

  if (loading) return <div className="p-10 text-slate-400 italic text-center">Buscando sua trilha...</div>

  return (
    <main className="p-10 w-full animate-in fade-in duration-500 bg-gray-50 min-h-screen">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 leading-tight">Conteúdos</h1>
          <p className="text-sm text-slate-400 font-medium">Conteúdos disponíveis para o seu ano</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Buscar conteúdo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-100 rounded-xl text-sm w-64 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div className="relative flex items-center">
            <select 
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 bg-white border border-slate-100 rounded-xl text-sm font-semibold text-slate-600 shadow-sm cursor-pointer"
            >
              <option value="Todos">Filtrar por Nível</option>
              <option value="Nível 1">Nível 1</option>
              <option value="Nível 2">Nível 2</option>
              <option value="Nível 3">Nível 3</option>
              <option value="Reforço">Reforço</option>
            </select>
            <Funnel size={16} className="absolute right-3 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </header>

      <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm min-h-[400px]">
        {filteredContents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400">
             <Article size={48} weight="light" className="mb-4 opacity-20" />
             <p className="font-medium">Nenhum conteúdo encontrado para os filtros selecionados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredContents.map((content) => (
              <button
                key={content.id}
                onClick={() => navigate(`/conteudos/${content.id}`)}
                className="group relative flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all text-left"
              >
                <div className={`p-4 rounded-xl shrink-0 ${content.level === 'reforco' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'}`}>
                  {content.level === 'reforco' ? <Sparkle size={24} weight="fill" /> : <Article size={24} weight="fill" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${content.level === 'reforco' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                      {content.level === 'reforco' ? 'Reforço' : `Nível ${content.level}`}
                    </span>
                    <CaretRight size={18} className="text-slate-200 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <h3 className="font-bold text-slate-800 truncate pr-4">{content.title}</h3>
                  <p className="text-[10px] text-slate-300 font-medium uppercase tracking-tight">{content.category?.name || 'Geral'}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}