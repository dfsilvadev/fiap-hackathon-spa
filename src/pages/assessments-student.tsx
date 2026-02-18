import { getAll } from '@/resources/assessmentResources'
import { FunnelSimple, MagnifyingGlass } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AssessmentList } from '../components/assessments/student/assessmentList'
import { Assessments } from '../components/ui/assessment'
import { categories } from '../constant/category'
import { Routes } from '../router/constants/routesMap'

const AssessmentStudentPage = () => {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [search, setSearch] = useState('')
  const [assessmentsData, setAssessmentsData] = useState<Assessments[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true)
        const response = await getAll()
        const data = (response.data as unknown as { assessments: Assessments[] }).assessments || []
        setAssessmentsData(data)
      } catch (error) {
        console.error('Erro ao buscar avaliações:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAssessments()
  }, [])

  const handleStartAssessment = (id: string) => {
    navigate(Routes.QUESTION.replace(':id', id))
  }

  const filteredAssessments = useMemo(() => {
    return assessmentsData.filter((item) => {
      const matchesCategory = activeCategory === 'Todos' || item.category?.name === activeCategory
      const title = item.title || ''
      const matchesSearch = title.toLowerCase().includes(search.toLowerCase())

      return matchesCategory && matchesSearch
    })
  }, [search, activeCategory, assessmentsData])

  return (
    <main className="p-10 w-full animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[#1E293B]">Avaliações</h1>
        <p className="text-gray-500 mt-2">
          Selecione uma disciplina abaixo para filtrar os testes disponíveis.
        </p>
      </header>

      <section className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
            <FunnelSimple size={16} />
            <span>Filtros</span>
          </div>

          <div className="flex-1 min-w-[220px]">
            <div className="relative">
              <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                placeholder="Buscar avaliação..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`h-10 rounded-full border px-4 text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === category
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8">
        {loading ? (
          <div className="flex justify-center py-20 text-gray-400 italic">
            Buscando avaliações no servidor...
          </div>
        ) : (
          <AssessmentList data={filteredAssessments} onStartItem={handleStartAssessment} />
        )}
      </section>
    </main>
  )
}

export default AssessmentStudentPage
