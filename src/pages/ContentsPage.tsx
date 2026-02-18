import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlass, Funnel, Article, Sparkle, CaretRight } from '@phosphor-icons/react'
import { contentService, Content, ProgressContentItem } from '@/services/contentService'

type LevelFilter = 'all' | '1' | '2' | '3' | 'reforco'

const levelFilterOptions: { value: LevelFilter; label: string }[] = [
  { value: 'all', label: 'Filtrar por Nível' },
  { value: '1', label: 'Nível 1' },
  { value: '2', label: 'Nível 2' },
  { value: '3', label: 'Nível 3' },
  { value: 'reforco', label: 'Reforço' },
]

function getLevelLabel(level?: string) {
  if (!level) return 'Nível'
  if (level === 'reforco') return 'Reforço'
  return `Nível ${level}`
}

function getStatusLabelAndPercent(
  progressItem?: ProgressContentItem,
  fallbackStatus?: Content['userStatus']
) {
  // Fonte da verdade: progresso vindo do backend (/progress)
  if (progressItem) {
    const { status, progressStatus } = progressItem

    if (progressStatus === 'completed' || status === 'completed') {
      return { label: 'Concluído', percent: 100 }
    }

    if (progressStatus === 'in_progress') {
      // backend não manda percent por conteúdo; usamos um valor intermediário
      return { label: 'Em progresso', percent: 50 }
    }

    // not_started + available/blocked
    return { label: 'Não iniciado', percent: 0 }
  }

  // Fallback antigo baseado em userStatus embutido no conteúdo (se backend passar algo ali)
  const progress = fallbackStatus?.progress ?? 0
  const completed = fallbackStatus?.completed ?? progress === 100

  if (completed) return { label: 'Concluído', percent: 100 }
  if (progress > 0) return { label: 'Em progresso', percent: progress }
  return { label: 'Não iniciado', percent: 0 }
}

export default function ContentsPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all')
  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [progressByContentId, setProgressByContentId] = useState<
    Record<string, ProgressContentItem>
  >({})

  useEffect(() => {
    async function loadData() {
      try {
        const data = await contentService.getContentsForStudent()
        if (data && data.contents) {
          const list = data.contents
          setContents(list)

          // Carrega o progresso por categoria (matéria) para saber o que está bloqueado
          const categoryIds = Array.from(new Set(list.map((c) => c.categoryId).filter(Boolean)))

          if (categoryIds.length > 0) {
            const progressResponses = await Promise.all(
              categoryIds.map((categoryId) =>
                contentService.getProgressByCategory(categoryId).catch(() => null)
              )
            )

            const map: Record<string, ProgressContentItem> = {}
            progressResponses.forEach((resp) => {
              if (!resp) return
              resp.contents.forEach((item) => {
                map[item.contentId] = item
              })
            })

            setProgressByContentId(map)
          }
        } else {
          setContents([])
        }
      } catch (error) {
        console.error('Erro ao carregar conteúdos:', error)
        setContents([])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const groupedContents = useMemo(() => {
    const groups: Record<string, Content[]> = {}

    contents.forEach((c) => {
      const matchesSearch = c.title?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesLevel =
        levelFilter === 'all' ||
        c.level === levelFilter ||
        (levelFilter === 'reforco' && c.level === 'reforco')

      if (!matchesSearch || !matchesLevel) return

      const groupKey = c.category?.name || 'Outros'
      if (!groups[groupKey]) groups[groupKey] = []
      groups[groupKey].push(c)
    })

    return groups
  }, [contents, searchTerm, levelFilter])

  const hasAnyContent = Object.values(groupedContents).some((items) => items.length > 0)

  function isContentBlocked(contentId: string) {
    const progress = progressByContentId[contentId]
    return progress?.status === 'blocked'
  }

  if (loading)
    return <div className="p-10 text-slate-400 italic text-center">Buscando seus conteúdos...</div>

  return (
    <main className="p-10 w-full animate-in fade-in duration-500 bg-gray-50 min-h-screen">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 leading-tight">Conteúdos</h1>
          <p className="text-sm text-slate-400 font-medium">Conteúdos disponíveis para o seu ano</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <MagnifyingGlass
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
              size={18}
            />
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
              onChange={(e) => setLevelFilter(e.target.value as LevelFilter)}
              className="appearance-none pl-4 pr-10 py-2 bg-white border border-slate-100 rounded-xl text-sm font-semibold text-slate-600 shadow-sm cursor-pointer"
            >
              {levelFilterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Funnel size={16} className="absolute right-3 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </header>

      {!hasAnyContent ? (
        <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm min-h-[320px] flex flex-col items-center justify-center text-slate-400">
          <Article size={48} weight="light" className="mb-4 opacity-20" />
          <p className="font-medium">Nenhum conteúdo encontrado para os filtros selecionados.</p>
        </section>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedContents).map(([categoryName, items]) => {
            const reinforcementItems = items.filter((content) => content.level === 'reforco')

            const levelItems = items
              .filter((content) => content.level !== 'reforco')
              .slice()
              .sort((a, b) => {
                const aLevel = Number(a.level)
                const bLevel = Number(b.level)

                if (Number.isFinite(aLevel) && Number.isFinite(bLevel)) {
                  return aLevel - bLevel // 1, 2, 3...
                }

                // fallback para ordenação alfabética, caso o nível venha em outro formato
                return String(a.level).localeCompare(String(b.level))
              })

            return (
              <section
                key={categoryName}
                className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm"
              >
                <header className="mb-5">
                  <h2 className="text-lg font-bold text-slate-900">{categoryName}</h2>
                  <p className="text-xs text-slate-400">
                    {/* descrição opcional vinda do backend, se existir */}
                    {items[0]?.category?.description ??
                      'Conteúdos organizados para o seu desenvolvimento.'}
                  </p>
                </header>

                {/* Reforços primeiro */}
                {reinforcementItems.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {reinforcementItems.map((content) => {
                      const progressItem = progressByContentId[content.id]
                      const statusInfo = getStatusLabelAndPercent(progressItem, content.userStatus)
                      const blocked = isContentBlocked(content.id)

                      return (
                        <button
                          key={content.id}
                          type="button"
                          disabled={blocked}
                          onClick={() => {
                            if (blocked) return
                            navigate(`/conteudos/${content.id}`)
                          }}
                          className={`group relative flex items-center gap-4 p-5 bg-white border rounded-2xl transition-all text-left
                        ${
                          blocked
                            ? 'border-slate-100 opacity-60 cursor-not-allowed'
                            : 'border-slate-100 hover:border-blue-200 hover:shadow-md'
                        }`}
                        >
                          <div
                            className={`p-4 rounded-xl shrink-0 ${
                              content.level === 'reforco'
                                ? 'bg-amber-50 text-amber-500'
                                : 'bg-blue-50 text-blue-500'
                            }`}
                          >
                            {content.level === 'reforco' ? (
                              <Sparkle size={24} weight="fill" />
                            ) : (
                              <Article size={24} weight="fill" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex justify-between items-center">
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                  content.level === 'reforco'
                                    ? 'bg-amber-50 text-amber-600'
                                    : 'bg-blue-50 text-blue-600'
                                }`}
                              >
                                {getLevelLabel(content.level)}
                              </span>

                              <CaretRight
                                size={18}
                                className="text-slate-200 group-hover:text-blue-500 transition-colors"
                              />
                            </div>

                            <h3 className="font-bold text-slate-800 truncate pr-4">
                              {content.title}
                            </h3>

                            <p className="text-[11px] text-slate-400">
                              {content.type ?? 'Conteúdo'}{' '}
                              {content.durationMinutes ? `• ${content.durationMinutes} min` : null}
                            </p>

                            <div className="mt-2">
                              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                                <span>Progresso</span>
                                <span className="font-semibold text-slate-500">
                                  {statusInfo.percent}%
                                </span>
                              </div>
                              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    statusInfo.percent === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${statusInfo.percent}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Depois níveis 1, 2, 3 em ordem crescente */}
                {levelItems.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {levelItems.map((content) => {
                      const progressItem = progressByContentId[content.id]
                      const statusInfo = getStatusLabelAndPercent(progressItem, content.userStatus)
                      const blocked = isContentBlocked(content.id)

                      return (
                        <button
                          key={content.id}
                          type="button"
                          disabled={blocked}
                          onClick={() => {
                            if (blocked) return
                            navigate(`/conteudos/${content.id}`)
                          }}
                          className={`group relative flex items-center gap-4 p-5 bg-white border rounded-2xl transition-all text-left
                        ${
                          blocked
                            ? 'border-slate-100 opacity-60 cursor-not-allowed'
                            : 'border-slate-100 hover:border-blue-200 hover:shadow-md'
                        }`}
                        >
                          <div
                            className={`p-4 rounded-xl shrink-0 ${
                              content.level === 'reforco'
                                ? 'bg-amber-50 text-amber-500'
                                : 'bg-blue-50 text-blue-500'
                            }`}
                          >
                            {content.level === 'reforco' ? (
                              <Sparkle size={24} weight="fill" />
                            ) : (
                              <Article size={24} weight="fill" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex justify-between items-center">
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                  content.level === 'reforco'
                                    ? 'bg-amber-50 text-amber-600'
                                    : 'bg-blue-50 text-blue-600'
                                }`}
                              >
                                {getLevelLabel(content.level)}
                              </span>

                              <CaretRight
                                size={18}
                                className="text-slate-200 group-hover:text-blue-500 transition-colors"
                              />
                            </div>

                            <h3 className="font-bold text-slate-800 truncate pr-4">
                              {content.title}
                            </h3>

                            <p className="text-[11px] text-slate-400">
                              {content.type ?? 'Conteúdo'}{' '}
                              {content.durationMinutes ? `• ${content.durationMinutes} min` : null}
                            </p>

                            <div className="mt-2">
                              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                                <span>Progresso</span>
                                <span className="font-semibold text-slate-500">
                                  {statusInfo.percent}%
                                </span>
                              </div>
                              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    statusInfo.percent === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${statusInfo.percent}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}
    </main>
  )
}
