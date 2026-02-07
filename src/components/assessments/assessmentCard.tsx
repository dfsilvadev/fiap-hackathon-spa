import { Clock, Target, CaretRight } from '@phosphor-icons/react'

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
  return (
    <div
      onClick={onClick}
      className="p-6 bg-white border border-gray-100 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
    >
      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded">
        {category}
      </span>
      <span className=" ml-3 text-[10px] font-bold uppercase tracking-widest text-[#475569] bg-[#F1F5F9] px-2 py-1 rounded">
        Nível {level}
      </span>
      <h3 className="mt-3 font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      <p className="mt-2 text-[12px] text-gray-600 line-clamp-5">{description}</p>
      <div className="my-2 border-t border-gray-200" />
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <Clock size={15} weight="light" />
        <span className="-ml-3">
          {startDate} - {endDate}
        </span>
        <Target size={15} weight="light" />
        <span className="-ml-3">Min: {minScore} %</span>
      </div>
      <button className="mt-4 w-full py-2 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-1">
        Iniciar <CaretRight size={14} weight="bold" />
      </button>
    </div>
  )
}
