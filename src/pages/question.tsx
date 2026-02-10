import { useParams, useNavigate } from 'react-router-dom'
import { CaretLeft, PaperPlaneTilt } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

import {
  AssessmentDetail,
  Question,
  MultipleChoice,
  SubmitAssessmentPayload,
  AssessmentResult,
} from '../components/ui/assessment'

import { getById, submitAssessment } from '../resources/assessmentResources'
import { AssessmentFeedback } from '../components/assessments/feedback/assessmentFeedback'
import { Routes } from '../router/constants/routesMap'

const QuestionPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [questions, setQuestions] = useState<Question[]>([])
  const [assessmentTitle, setAssessmentTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<AssessmentResult | null>(null)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    if (!id) return
    try {
      setLoading(true)
      const response = await getById(id)
      const assessment: AssessmentDetail = response.data || response
      setQuestions(assessment.questions)
      setAssessmentTitle(assessment.title)
      setResult(null)
    } catch (error) {
      console.error('Erro ao carregar avaliação:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = async () => {
    if (!id) return

    const payload: SubmitAssessmentPayload = {
      answers: Object.entries(answers).map(([questionId, answerText]) => ({
        questionId,
        answerText,
      })),
    }

    if (payload.answers.length < questions.length) {
      if (!window.confirm('Algumas questões estão em branco. Enviar assim mesmo?')) return
    }

    try {
      setSubmitting(true)
      const response = await submitAssessment(id, payload)
      setResult(response.data || response)
    } catch (error) {
      console.error('Erro no envio:', error)
      alert('Falha ao processar suas respostas.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="font-medium text-gray-500">Preparando sua avaliação...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col p-8 bg-gray-50 relative">
      {result && (
        <AssessmentFeedback
          result={result}
          title={assessmentTitle}
          onConfirm={() => navigate(Routes.ASSESSMENTS_STUDENT)}
        />
      )}

      <header className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <CaretLeft
            size={16}
            weight="bold"
            className="group-hover:-translate-x-1 transition-transform"
          />
          Voltar
        </button>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          Avaliação: {assessmentTitle}
        </h1>
        <p className="text-gray-500 mt-2">Boa sorte e responda com calma</p>
      </header>

      <section className="w-full mx-auto bg-white rounded-xl shadow-sm shadow-slate-200/60 overflow-hidden border">
        <div className="p-8 md:p-12">
          <div className="flex items-center justify-between mb-10 border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Questões</h2>
              <p className="text-sm text-slate-400">Selecione a alternativa correta</p>
            </div>
            <div className="text-right">
              <span className="block text-2xl font-black text-blue-600">
                {Object.keys(answers).length}/{questions.length}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Respondidas
              </span>
            </div>
          </div>

          <div className="space-y-12">
            {questions
              .sort((a, b) => a.orderNumber - b.orderNumber)
              .map((q, index) => (
                <article key={q.id} className="group">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-300 text-slate-700 font-black transition-all duration-300">
                      {index + 1}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-800 mb-6 leading-relaxed">
                        {q.questionText}
                      </h3>

                      <div className="space-y-3">
                        {(() => {
                          const type = q.questionType.toUpperCase()

                          if (type === 'MULTIPLE_CHOICE' || type === 'TRUE_FALSE') {
                            return (q.options as MultipleChoice[]).map((opt) => (
                              <label
                                key={opt.id}
                                className={`flex items-center gap-4 p-3 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                                  answers[q.id] === opt.text
                                    ? 'border-blue-600 bg-blue-50/30 ring-4 ring-blue-50'
                                    : 'border-slate-200 bg-white hover:border-slate-400'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`q-${q.id}`}
                                  className="hidden"
                                  checked={answers[q.id] === opt.text}
                                  onChange={() => handleInputChange(q.id, opt.text)}
                                />
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    answers[q.id] === opt.text
                                      ? 'border-blue-600 bg-blue-600'
                                      : 'border-slate-300'
                                  }`}
                                >
                                  {answers[q.id] === opt.text && (
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                  )}
                                </div>
                                <span
                                  className={`font-semibold ${answers[q.id] === opt.text ? 'text-blue-900' : 'text-slate-600'}`}
                                >
                                  {opt.text}
                                </span>
                              </label>
                            ))
                          }

                          return (
                            <textarea
                              rows={4}
                              className="w-full p-5 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all bg-slate-50/50"
                              placeholder="Descreva sua resposta aqui..."
                              onChange={(e) => handleInputChange(q.id, e.target.value)}
                            />
                          )
                        })()}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
          </div>

          <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-3 bg-blue-500 hover:bg-blue-900 text-white font-bold py-4 px-12 rounded-2xl transition-all duration-300 disabled:opacity-50 shadow-xl shadow-slate-200 active:scale-95"
            >
              {submitting ? (
                'PROCESSANDO...'
              ) : (
                <>
                  {' '}
                  FINALIZAR AVALIAÇÃO <PaperPlaneTilt size={22} weight="bold" />{' '}
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default QuestionPage
