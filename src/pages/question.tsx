import { useParams, useNavigate } from 'react-router-dom'
import { CaretLeft, PaperPlaneTilt, CheckCircle, XCircle } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

import {
  AssessmentDetail,
  Question,
  MultipleChoice,
  SubmitAssessmentPayload,
  AssessmentResult,
  QuestionWithResult,
  AssessmentResultDetail,
} from '../components/ui/assessment'

import { getById, submitAssessment, getResultById } from '../resources/assessmentResources'
import { AssessmentFeedback } from '../components/assessments/feedback/assessmentFeedback'
import { Routes } from '../router/constants/routesMap'

type QuestionState = Question | QuestionWithResult

function isQuestionWithResult(q: QuestionState): q is QuestionWithResult {
  return (q as QuestionWithResult).studentAnswer !== undefined
}

const QuestionPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [questions, setQuestions] = useState<QuestionState[]>([])
  const [assessmentTitle, setAssessmentTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<AssessmentResult | null>(null)

  const [isReviewMode, setIsReviewMode] = useState(false)
  const [scoreSummary, setScoreSummary] = useState<{ total: number; max: number } | null>(null)

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

  const handleCloseFeedbackAndLoadResults = async () => {
    if (!id) return
    try {
      setLoading(true)
      const response = await getResultById(id)
      const data: AssessmentResultDetail = response.data || response

      setQuestions(data.questions)
      setScoreSummary({
        total: data.result.totalScore,
        max: data.result.maxScore,
      })
      setIsReviewMode(true)
      setResult(null)
    } catch (error) {
      console.error('Erro ao carregar detalhes do resultado:', error)
      navigate(Routes.ASSESSMENTS_STUDENT)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (questionId: string, value: string) => {
    if (isReviewMode) return
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
          <p className="font-medium text-gray-500">Processando informações...</p>
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
          onConfirm={handleCloseFeedbackAndLoadResults}
        />
      )}

      <header className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(Routes.ASSESSMENTS_STUDENT)}
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
            {isReviewMode ? `Resultado: ${assessmentTitle}` : `Avaliação: ${assessmentTitle}`}
          </h1>
          <p className="text-gray-500 mt-2">
            {isReviewMode
              ? 'Confira seu desempenho detalhado abaixo'
              : 'Boa sorte e responda com calma'}
          </p>
        </div>
      </header>

      <section className="w-full mx-auto bg-white rounded-xl shadow-sm shadow-slate-200/60 overflow-hidden border">
        <div className="p-8 md:p-12">
          <div className="flex items-center justify-between mb-10 border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Questões</h2>
              <p className="text-sm text-slate-400">
                {isReviewMode ? 'Gabarito detalhado' : 'Selecione a alternativa correta'}
              </p>
            </div>
            {!isReviewMode && (
              <div className="text-right">
                <span className="block text-2xl font-black text-blue-600">
                  {Object.keys(answers).length}/{questions.length}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Respondidas
                </span>
              </div>
            )}

            {isReviewMode && scoreSummary && (
              <div className="text-right">
                <span className="block text-2xl font-black text-blue-600">
                  {scoreSummary.total}/{scoreSummary.max}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Acertos
                </span>
              </div>
            )}
          </div>

          <div className="space-y-12">
            {questions
              .sort((a, b) => a.orderNumber - b.orderNumber)
              .map((q, index) => {
                const hasResult = isQuestionWithResult(q)
                const studentAnswerText = hasResult ? q.studentAnswer.answerText : answers[q.id]
                const isCorrect = hasResult ? q.studentAnswer.isCorrect : null
                const correctAnswer = hasResult ? q.correctAnswer : null

                return (
                  <article key={q.id} className="group">
                    <div className="flex gap-6">
                      <div
                        className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-2xl font-black transition-all ${
                          isReviewMode
                            ? isCorrect
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                            : 'bg-slate-300 text-slate-700'
                        }`}
                      >
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
                              return (q.options as MultipleChoice[]).map((opt) => {
                                const isUserChoice = studentAnswerText === opt.text
                                const isCorrectOption = isReviewMode && correctAnswer === opt.text

                                let containerStyle =
                                  'border-slate-200 bg-white hover:border-slate-400'

                                if (isReviewMode) {
                                  if (isCorrectOption)
                                    containerStyle =
                                      'border-green-500 bg-green-50 ring-2 ring-green-100'
                                  else if (isUserChoice && !isCorrect)
                                    containerStyle = 'border-red-500 bg-red-50 ring-2 ring-red-100'
                                  else containerStyle = 'border-slate-100 opacity-60'
                                } else if (isUserChoice) {
                                  containerStyle =
                                    'border-blue-600 bg-blue-50/30 ring-4 ring-blue-50'
                                }

                                return (
                                  <label
                                    key={opt.id}
                                    className={`flex items-center gap-4 p-3 border-2 rounded-2xl transition-all duration-200 ${
                                      !isReviewMode ? 'cursor-pointer' : 'cursor-default'
                                    } ${containerStyle}`}
                                  >
                                    <input
                                      type="radio"
                                      name={`q-${q.id}`}
                                      className="hidden"
                                      disabled={isReviewMode}
                                      checked={isUserChoice}
                                      onChange={() => handleInputChange(q.id, opt.text)}
                                    />

                                    <div
                                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        isUserChoice
                                          ? 'border-blue-600 bg-blue-600'
                                          : 'border-slate-300'
                                      } ${isReviewMode && isCorrectOption ? 'border-green-600 bg-green-600' : ''} ${isReviewMode && isUserChoice && !isCorrect ? 'border-red-600 bg-red-600' : ''}`}
                                    >
                                      {(isUserChoice || (isReviewMode && isCorrectOption)) && (
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                      )}
                                    </div>

                                    <span
                                      className={`font-semibold ${isUserChoice ? 'text-blue-900' : 'text-slate-600'} ${isCorrectOption ? 'text-green-900' : ''}`}
                                    >
                                      {opt.text}
                                    </span>

                                    {isReviewMode && isCorrectOption && (
                                      <CheckCircle
                                        size={20}
                                        className="ml-auto text-green-600"
                                        weight="fill"
                                      />
                                    )}
                                    {isReviewMode && isUserChoice && !isCorrect && (
                                      <XCircle
                                        size={20}
                                        className="ml-auto text-red-600"
                                        weight="fill"
                                      />
                                    )}
                                  </label>
                                )
                              })
                            }

                            return (
                              <div className="space-y-2">
                                <textarea
                                  rows={4}
                                  readOnly={isReviewMode}
                                  value={studentAnswerText || ''}
                                  className={`w-full p-5 border-2 rounded-2xl outline-none transition-all ${
                                    isReviewMode
                                      ? 'bg-slate-50 border-slate-200'
                                      : 'border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50'
                                  }`}
                                  placeholder="Resposta dissertativa..."
                                  onChange={(e) => handleInputChange(q.id, e.target.value)}
                                />
                                {isReviewMode && correctAnswer && (
                                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                                    <p className="text-sm font-bold text-green-800">
                                      Resposta Esperada:
                                    </p>
                                    <p className="text-sm text-green-700">{correctAnswer}</p>
                                  </div>
                                )}
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
          </div>

          {!isReviewMode && (
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
                    FINALIZAR AVALIAÇÃO <PaperPlaneTilt size={22} weight="bold" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default QuestionPage
