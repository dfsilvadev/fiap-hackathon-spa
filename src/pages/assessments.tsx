import { useState, useMemo, useEffect } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { AssessmentList } from '../components/assessments/assessmentList'
import { categories } from '../constant/category'
import { getAll } from '@/resources/assessmentResources'
import { Assessments } from '../components/ui/assessment'

const AssessmentPage = () => {
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

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="relative w-full max-w-[300px] xl:max-w-[350px] 2xl:max-w-[600px] flex-shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlass size={18} weight="bold" className="text-gray-400" />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Buscar avaliação..."
            className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                activeCategory === category
                  ? 'bg-[#1E293B] text-white border-[#1E293B]'
                  : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <section className="mt-8">
        {loading ? (
          <div className="flex justify-center py-20 text-gray-400 italic">
            Buscando avaliações no servidor...
          </div>
        ) : (
          <AssessmentList data={filteredAssessments} />
        )}
      </section>
    </main>
  )
}

export default AssessmentPage
