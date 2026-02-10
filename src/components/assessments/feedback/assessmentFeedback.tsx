import { Trophy, CheckCircle, ArrowRight } from '@phosphor-icons/react'
import { AssessmentResult } from '../../ui/assessment'

interface FeedbackProps {
  result: AssessmentResult
  title: string
  onConfirm: () => void
}

export const AssessmentFeedback = ({ result, title, onConfirm }: FeedbackProps) => {
  const isGoodScore = result.percentage >= 70

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 flex flex-col items-center text-center animate-in zoom-in slide-in-from-bottom-4 duration-500">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isGoodScore ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'}`}
        >
          {isGoodScore ? (
            <Trophy size={40} weight="fill" />
          ) : (
            <CheckCircle size={40} weight="fill" />
          )}
        </div>

        <h2 className="text-2xl font-black text-slate-800 mb-2">Avaliação Concluída!</h2>
        <p className="text-slate-500 mb-6">
          Você finalizou <strong>{title}</strong>.
        </p>

        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          <div className="bg-slate-50 p-4 rounded-2xl">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Acertos
            </span>
            <p className="text-xl font-black text-slate-800">
              {result.totalScore} / {result.maxScore}
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Desempenho
            </span>
            <p className="text-xl font-black text-blue-600">{result.percentage}%</p>
          </div>
        </div>

        {result.levelUpdated && (
          <div className="mb-6 px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs font-bold animate-bounce">
            🎉 PARABÉNS! SEU NÍVEL AUMENTOU!
          </div>
        )}

        <button
          onClick={onConfirm}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95"
        >
          Ir para avaliações
          <ArrowRight size={20} weight="bold" />
        </button>
      </div>
    </div>
  )
}
