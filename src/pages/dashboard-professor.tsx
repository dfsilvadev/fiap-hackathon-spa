import { BookOpen, ClipboardText, GraduationCap, Path, Plus } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'
import {
  getProfessorDashboard,
  type LearningPathItem,
  type ProfessorDashboardResponse,
  type ProfessorDashboardStudent,
  type ProfessorDashboardSubject,
  type SummaryByGradeItem,
} from '@/resources/professorDashboardResources'
import {
  getTeacherSubjects,
  type TeacherSubject,
  type TeacherSubjectsResponse,
} from '@/resources/teacherSubjectsResources'
import { Routes } from '@/router/constants/routesMap'
import { logger } from '@/utils/loogers'

const allowedRoles = ['teacher', 'coordinator']

const SUBJECTS_PAGE_LIMIT = 4

const LEARNING_PATH_COLORS = [
  { bg: 'bg-blue-100', bar: 'bg-blue-500', icon: 'text-blue-600' },
  { bg: 'bg-amber-100', bar: 'bg-amber-500', icon: 'text-amber-600' },
  { bg: 'bg-emerald-100', bar: 'bg-emerald-500', icon: 'text-emerald-600' },
  { bg: 'bg-violet-100', bar: 'bg-violet-500', icon: 'text-violet-600' },
] as const

const DashboardProfessorPage = () => {
  const navigate = useNavigate()
  const { isLoggedIn, me } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ProfessorDashboardResponse | null>(null)
  const [currentGrade, setCurrentGrade] = useState<string>('all')
  const [activeSubjectId, setActiveSubjectId] = useState<string | 'all'>('all')

  const [teacherSubjectsData, setTeacherSubjectsData] = useState<TeacherSubjectsResponse | null>(
    null
  )
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false)
  const [subjectsPage, setSubjectsPage] = useState(1)

  useEffect(() => {
    if (!isLoggedIn) {
      navigate(Routes.SIGN_IN)
      return
    }

    if (me && !allowedRoles.includes(me.role)) {
      navigate(Routes.HOME)
    }
  }, [isLoggedIn, me, navigate])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const gradeParam = currentGrade === 'all' ? undefined : currentGrade
        const response = await getProfessorDashboard(gradeParam)
        setData(response.data)

        logger.info('[Professor Dashboard] Dados carregados', {
          grade: gradeParam ?? 'all',
          totalStudents: response.data.total,
          hasSummary: !!response.data.summaryByGrade?.length,
          hasLearningPaths: !!response.data.learningPaths?.length,
        })
      } catch (err) {
        logger.error('[Professor Dashboard] Erro ao carregar dados', err)
        setError('Não foi possível carregar o dashboard do professor.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentGrade])

  useEffect(() => {
    const fetchTeacherSubjectsPage = async () => {
      if (!me || !allowedRoles.includes(me.role)) return
      try {
        setIsLoadingSubjects(true)
        const response = await getTeacherSubjects(subjectsPage, SUBJECTS_PAGE_LIMIT)
        setTeacherSubjectsData(response.data)
      } catch (err) {
        logger.warning('[Professor Dashboard] Erro ao carregar matérias do professor', err)
        setTeacherSubjectsData(null)
      } finally {
        setIsLoadingSubjects(false)
      }
    }
    fetchTeacherSubjectsPage()
  }, [me, subjectsPage])

  const subjects = useMemo<ProfessorDashboardSubject[]>(
    () => data?.subjects ?? [],
    [data?.subjects]
  )
  const students = useMemo<ProfessorDashboardStudent[]>(
    () => data?.students ?? [],
    [data?.students]
  )
  const summaryByGrade = useMemo<SummaryByGradeItem[]>(
    () => data?.summaryByGrade ?? [],
    [data?.summaryByGrade]
  )
  const learningPaths = useMemo<LearningPathItem[]>(
    () => data?.learningPaths ?? [],
    [data?.learningPaths]
  )

  const uniqueGrades = useMemo(() => {
    const fromSummary = summaryByGrade.length
      ? summaryByGrade.map((s) => s.grade)
      : Array.from(new Set(students.map((s) => s.currentGrade)))
    return Array.from(new Set(fromSummary)).sort()
  }, [summaryByGrade, students])

  const summaryForSelectedGrade = useMemo(() => {
    if (!summaryByGrade.length) return null
    if (currentGrade === 'all') {
      return summaryByGrade.reduce(
        (acc, s) => ({
          grade: 'all',
          totalStudents: acc.totalStudents + s.totalStudents,
          activeStudents: acc.activeStudents + s.activeStudents,
          contentsCount: acc.contentsCount + s.contentsCount,
          assessmentsCount: acc.assessmentsCount + s.assessmentsCount,
        }),
        { grade: 'all', totalStudents: 0, activeStudents: 0, contentsCount: 0, assessmentsCount: 0 }
      )
    }
    return summaryByGrade.find((s) => s.grade === currentGrade) ?? null
  }, [summaryByGrade, currentGrade])

  const teacherSubjects: TeacherSubject[] = teacherSubjectsData?.subjects ?? []
  const totalSubjects = teacherSubjectsData?.total ?? 0
  const totalSubjectsPages = Math.max(1, teacherSubjectsData?.totalPages ?? 0)
  const recentUsers = useMemo(() => students.slice(0, 5), [students])

  const filteredLearningPaths = useMemo(() => {
    if (currentGrade === 'all') return learningPaths
    return learningPaths.filter((p) => p.grade === currentGrade)
  }, [learningPaths, currentGrade])

  const filteredStudents = useMemo(() => {
    if (activeSubjectId === 'all') return students
    return students.filter((student) =>
      student.levelsBySubject.some((level) => level.categoryId === activeSubjectId)
    )
  }, [students, activeSubjectId])

  if (!isLoggedIn) {
    return null
  }

  return (
    <main className="min-h-screen bg-slate-50/80 p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {me?.role === 'coordinator' ? 'Dashboard do Coordenador' : 'Dashboard do Professor'}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 max-w-xl">
              Visão geral dos alunos e das matérias que você acompanha.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="grade-filter"
                className="text-[11px] font-semibold uppercase tracking-widest text-slate-600"
              >
                Filtrar por série
              </label>
              <select
                id="grade-filter"
                value={currentGrade}
                onChange={(e) => setCurrentGrade(e.target.value)}
                className="h-11 min-w-[11rem] cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25 [background-image:url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%2364758b%22%20stroke-width%3D%222%22%20d%3D%22M3%204.5l3%203%203-3%22%2F%3E%3C%2Fsvg%3E')] [background-position:right_0.75rem_center] [background-repeat:no-repeat] [background-size:0.75rem]"
              >
                <option value="all">Todas as séries</option>
                {uniqueGrades.map((grade) => (
                  <option key={grade} value={grade}>
                    Série {grade}
                  </option>
                ))}
              </select>
            </div>
            {me?.role === 'coordinator' && (
              <button
                type="button"
                onClick={() => navigate(Routes.USERS)}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus size={20} weight="bold" />
                Novo Usuário
              </button>
            )}
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 shadow-sm"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-2xl bg-white/60 py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
            <p className="text-sm font-medium text-slate-500">Carregando visão geral...</p>
          </div>
        ) : (
          <>
            <section aria-label="Resumo" className="mb-10">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-100">
                    <GraduationCap size={28} weight="duotone" className="text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-bold tabular-nums text-slate-900">
                      {summaryForSelectedGrade
                        ? `${summaryForSelectedGrade.activeStudents}/${summaryForSelectedGrade.totalStudents}`
                        : students.length}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-500">Alunos ativos</p>
                  </div>
                </div>

                <div className="flex items-center gap-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-violet-100">
                    <BookOpen size={28} weight="duotone" className="text-violet-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-bold tabular-nums text-slate-900">
                      {summaryForSelectedGrade?.contentsCount ?? subjects.length}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-500">Conteúdos</p>
                  </div>
                </div>

                <div className="flex items-center gap-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-100">
                    <ClipboardText size={28} weight="duotone" className="text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-bold tabular-nums text-slate-900">
                      {summaryForSelectedGrade?.assessmentsCount ?? '—'}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-500">Avaliações</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-10 grid gap-6 lg:grid-cols-[1fr_340px]">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Matérias ({totalSubjects})
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">Matérias que você leciona</p>
                </div>
                {isLoadingSubjects ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500" />
                    <p className="text-sm text-slate-500">Carregando matérias...</p>
                  </div>
                ) : teacherSubjects.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 py-12 text-center">
                    <p className="text-sm text-slate-500">Nenhuma matéria cadastrada.</p>
                    <p className="mt-1 text-xs text-slate-400">
                      As matérias que você leciona aparecerão aqui.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto -mx-1">
                      <table className="min-w-full divide-y divide-slate-100 text-sm">
                        <thead>
                          <tr className="bg-slate-50/80">
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Matéria
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Descrição
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Conteúdos
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Trilhas
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {teacherSubjects.map((row) => (
                            <tr key={row.id} className="transition-colors hover:bg-slate-50/50">
                              <td className="px-4 py-3.5 font-medium text-slate-900">{row.name}</td>
                              <td className="max-w-[200px] truncate px-4 py-3.5 text-slate-500">
                                —
                              </td>
                              <td className="px-4 py-3.5">
                                {row.contentsCount > 0 ? (
                                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                    {row.contentsCount}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">{row.contentsCount}</span>
                                )}
                              </td>
                              <td className="px-4 py-3.5">
                                {row.pathsCount > 0 ? (
                                  <span className="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
                                    {row.pathsCount}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">{row.pathsCount}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <p className="text-xs text-slate-500">
                        Mostrando {teacherSubjects.length} de {totalSubjects} matérias
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSubjectsPage((p) => Math.max(1, p - 1))}
                          disabled={subjectsPage <= 1}
                          className="rounded-full border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                        >
                          ‹
                        </button>
                        {Array.from({ length: totalSubjectsPages }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setSubjectsPage(p)}
                            className={`h-9 w-9 rounded-full text-sm font-medium transition-colors ${
                              p === subjectsPage
                                ? 'bg-blue-600 text-white'
                                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            setSubjectsPage((p) => Math.min(totalSubjectsPages, p + 1))
                          }
                          disabled={subjectsPage >= totalSubjectsPages}
                          className="rounded-full border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-slate-900">Usuários Recentes</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Alunos que você acompanha mais recentemente
                  </p>
                </div>
                {recentUsers.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 py-10 text-center">
                    <p className="text-sm text-slate-500">Nenhum usuário recente.</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {recentUsers.map((student) => (
                      <li
                        key={student.id}
                        className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/30 p-3 transition-colors hover:bg-slate-50/60"
                      >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-slate-900">{student.name}</p>
                          <p className="truncate text-xs text-slate-500">{student.email}</p>
                        </div>
                        <span className="flex-shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          Ativo
                        </span>
                        <span className="flex-shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          Aluno
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {filteredLearningPaths.length > 0 && (
              <section className="mb-10" aria-label="Trilhas de aprendizado">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Trilhas de Aprendizado</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Trilhas de aprendizado das matérias que você leciona
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(Routes.TRIALS)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-slate-50 hover:text-blue-700"
                  >
                    Ver todas →
                  </button>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  {filteredLearningPaths.map((path, idx) => {
                    const colors = LEARNING_PATH_COLORS[idx % LEARNING_PATH_COLORS.length]
                    const pct = Math.min(100, Math.max(0, path.completionPercentage))
                    return (
                      <div
                        key={path.pathId}
                        className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:gap-4"
                      >
                        <div className="flex items-center gap-3 sm:min-w-0">
                          <div
                            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${colors.bg}`}
                          >
                            <Path size={24} weight="duotone" className={colors.icon} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-slate-900 leading-tight">
                              {path.title}
                            </h3>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {path.moduleCount} módulos • {path.studentCount} alunos
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex-1 sm:mt-0">
                          <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                            <span>Progresso</span>
                            <span>{Math.round(pct)}%</span>
                          </div>
                          <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full ${colors.bar} transition-all duration-300`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <div className="mt-3 flex-shrink-0 sm:mt-0">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(Routes.TRIALS_DETAIL.replace(':id', path.pathId))
                            }
                            className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto"
                          >
                            Abrir trilha
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            <section
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
              aria-label="Alunos"
            >
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Alunos</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Nível por matéria e recomendações de reforço pendentes.
                </p>
              </div>

              <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50/80 px-4 py-3">
                <span className="text-xs font-semibold text-slate-600">Filtrar por matéria:</span>
                <button
                  type="button"
                  onClick={() => setActiveSubjectId('all')}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    activeSubjectId === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Todas
                </button>
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => setActiveSubjectId(subject.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      activeSubjectId === subject.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {subject.name}
                  </button>
                ))}
              </div>

              {filteredStudents.length === 0 ? (
                <div className="rounded-xl bg-slate-50 py-12 text-center">
                  <p className="text-sm text-slate-500">
                    Nenhum aluno encontrado para os filtros atuais.
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Altere o filtro de matéria ou a série acima.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-1">
                  <table className="min-w-full divide-y divide-slate-100 text-sm">
                    <thead>
                      <tr className="bg-slate-50/80">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Aluno
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Série
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Nível por matéria
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Recomendações pendentes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.map((student) => {
                        const levels =
                          activeSubjectId === 'all'
                            ? student.levelsBySubject
                            : student.levelsBySubject.filter(
                                (level) => level.categoryId === activeSubjectId
                              )
                        const pendingCount = student.pendingRecommendations?.length ?? 0

                        return (
                          <tr key={student.id} className="transition-colors hover:bg-slate-50/50">
                            <td className="px-4 py-3.5 align-top">
                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-900">{student.name}</span>
                                <span className="text-xs text-slate-500">{student.email}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 align-top text-slate-700">
                              {student.currentGrade}
                            </td>
                            <td className="px-4 py-3.5 align-top">
                              <div className="flex flex-wrap gap-2">
                                {levels.length === 0 ? (
                                  <span className="text-xs text-slate-400">
                                    Sem nível registrado
                                  </span>
                                ) : (
                                  levels.map((level) => (
                                    <span
                                      key={level.categoryId}
                                      className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-700"
                                    >
                                      {level.categoryName}
                                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                      Nível {level.level}
                                    </span>
                                  ))
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 align-top">
                              {pendingCount === 0 ? (
                                <span className="text-xs font-semibold text-emerald-600">
                                  Nenhuma pendente
                                </span>
                              ) : (
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs font-semibold text-amber-700">
                                    {pendingCount} recomendação
                                    {pendingCount > 1 ? 's' : ''} pendente
                                  </span>
                                  <ul className="space-y-1">
                                    {student.pendingRecommendations.slice(0, 2).map((rec) => (
                                      <li
                                        key={rec.id}
                                        className="text-xs text-slate-600 line-clamp-1"
                                        title={rec.contentTitle}
                                      >
                                        {rec.contentTitle} ({rec.categoryName})
                                      </li>
                                    ))}
                                    {pendingCount > 2 && (
                                      <li className="text-[11px] font-semibold text-slate-400">
                                        + {pendingCount - 2} outras
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  )
}

export default DashboardProfessorPage
