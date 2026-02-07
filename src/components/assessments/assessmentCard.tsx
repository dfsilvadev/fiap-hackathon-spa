import { Clock, Target, CaretRight } from '@phosphor-icons/react'
import { categoryConfig } from '../../constant/category'

interface AssessmentCardProps {
  title: string
  description: string
  level: string
  category: string
  startDate: string
  endDate: string
  minScore: string
  onClick?: () => void
}

export const AssessmentCard = ({
  description,
  level,
  category,
  title,
  startDate,
  endDate,
  minScore,
  onClick,
}: AssessmentCardProps) => {
  const color = categoryConfig[category] || categoryConfig.Default

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-100 rounded-md shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col h-full overflow-hidden"
    >
      {/* 1. Área de Conteúdo com Padding */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${color.bg} ${color.text}`}
          >
            {category}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#475569] bg-[#F1F5F9] px-2 py-1 rounded">
            Nível {level}
          </span>
        </div>

        <h3 className="mt-4 font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>

        <p className="mt-2 text-[14px] text-gray-500 line-clamp-3">{description}</p>

        <div className="flex-1" />

        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>
              {startDate} - {endDate}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Target size={16} />
            <span>Min: {minScore}%</span>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <button className="w-full py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
          Iniciar <CaretRight size={16} weight="bold" />
        </button>
      </div>
    </div>
  )
}
