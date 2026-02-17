import { Eye, FunnelSimple, MagnifyingGlass, PencilSimple, Power, X } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'
import type { ProfessorDashboardStudent } from '@/resources/professorDashboardResources'
import { getProfessorStudents, type StudentGrade } from '@/resources/userResources'
import { Routes } from '@/router/constants/routesMap'

const allowedRoles = ['teacher', 'coordinator']

const gradeOptions: { value: StudentGrade; label: string }[] = [
  { value: '6', label: '6º ano' },
  { value: '7', label: '7º ano' },
  { value: '8', label: '8º ano' },
  { value: '9', label: '9º ano' },
  { value: '1EM', label: '1º EM' },
  { value: '2EM', label: '2º EM' },
  { value: '3EM', label: '3º EM' },
]

interface StudentsState {
  data: ProfessorDashboardStudent[]
  page: number
  limit: number
  total: number
  totalPages: number
}

const DEFAULT_LIMIT = 20

const UsersListPage = () => {
  const navigate = useNavigate()
  const { isLoggedIn, me } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [studentsState, setStudentsState] = useState<StudentsState>({
    data: [],
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 1,
  })
  const [currentGrade, setCurrentGrade] = useState<StudentGrade | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsStudent, setDetailsStudent] = useState<ProfessorDashboardStudent | null>(null)

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
    const fetchStudents = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await getProfessorStudents({
          currentGrade: currentGrade === 'all' ? undefined : currentGrade,
          page: studentsState.page,
          limit: studentsState.limit,
        })

        const { students, page, limit, total, totalPages } = response.data

        setStudentsState({
          data: students,
          page,
          limit,
          total,
          totalPages: totalPages ?? Math.max(1, Math.ceil(total / (limit || DEFAULT_LIMIT))),
        })
      } catch (err) {
        console.error('[UsersListPage] Erro ao carregar alunos', err)
        setError('Não foi possível carregar a lista de alunos.')
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGrade, studentsState.page])

  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return studentsState.data

    return studentsState.data.filter((student) => {
      return student.name.toLowerCase().includes(term) || student.email.toLowerCase().includes(term)
    })
  }, [studentsState.data, searchTerm])

  const isCoordinator = me?.role === 'coordinator'

  const handleOpenDetails = (student: ProfessorDashboardStudent) => {
    setDetailsStudent(student)
    setDetailsOpen(true)
  }

  const handleCloseDetails = () => {
    setDetailsOpen(false)
    setDetailsStudent(null)
  }

  if (!isLoggedIn) {
    return null
  }

  return (
    <main className="min-h-screen bg-slate-50/80 p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Usuários
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {isCoordinator
                ? 'Gerencie alunos cadastrados na plataforma.'
                : 'Veja os alunos que você acompanha na plataforma.'}
            </p>
          </div>

          {isCoordinator && (
            <button
              type="button"
              onClick={() => navigate(Routes.USERS_NEW)}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="text-lg leading-none">+</span>
              Novo usuário
            </button>
          )}
        </header>

        {/* Filtros */}
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
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={currentGrade}
                onChange={(e) => setCurrentGrade(e.target.value as StudentGrade | 'all')}
                className="h-10 min-w-[150px] cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">Todas as séries</option>
                {gradeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Lista de usuários */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Lista de usuários</h2>
              <p className="mt-1 text-xs text-slate-500">
                {studentsState.total}{' '}
                {studentsState.total === 1 ? 'usuário encontrado' : 'usuários encontrados'}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-3">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
              <p className="text-sm text-slate-500">Carregando alunos...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="rounded-xl bg-slate-50 py-12 text-center">
              <p className="text-sm text-slate-500">Nenhum aluno encontrado.</p>
              <p className="mt-1 text-xs text-slate-400">
                Ajuste os filtros ou verifique os critérios de busca.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-1">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead>
                  <tr className="bg-slate-50/80">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Nome
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      E-mail
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Série / Matérias
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Detalhes / Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="transition-colors hover:bg-slate-50/60">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-900">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600">{student.email}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-700">
                          Aluno
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-slate-700">
                            {student.currentGrade
                              ? `Série ${student.currentGrade}`
                              : 'Série não informada'}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {student.levelsBySubject.slice(0, 3).map((level) => (
                              <span
                                key={level.categoryId}
                                className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                              >
                                {level.categoryName}
                              </span>
                            ))}
                            {student.levelsBySubject.length > 3 && (
                              <span className="text-[10px] font-semibold text-slate-400">
                                + {student.levelsBySubject.length - 3} matérias
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {/* Endpoint de status vem da tela de edição; aqui exibimos badge genérico */}
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-[11px] font-semibold text-blue-700">
                          Ativo
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(student)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700"
                            title="Ver detalhes do aluno"
                          >
                            <Eye size={18} weight="bold" />
                          </button>

                          {isCoordinator && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(Routes.USERS_EDIT.replace(':id', student.id))
                                }
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-blue-500 hover:text-blue-600"
                                title="Editar usuário"
                              >
                                <PencilSimple size={18} weight="bold" />
                              </button>
                              <button
                                type="button"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-600"
                                title="Ativar/Desativar (editar para alterar)"
                              >
                                <Power size={18} weight="bold" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação simples baseada no backend */}
          {!loading && studentsState.totalPages > 1 && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-500">
                Página {studentsState.page} de {studentsState.totalPages} • {studentsState.total}{' '}
                alunos no total
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setStudentsState((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
                  }
                  disabled={studentsState.page <= 1}
                  className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setStudentsState((prev) => ({
                      ...prev,
                      page: Math.min(studentsState.totalPages, prev.page + 1),
                    }))
                  }
                  disabled={studentsState.page >= studentsState.totalPages}
                  className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Modal de detalhes do usuário */}
        {detailsOpen && detailsStudent && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4 py-6">
            <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Detalhes do aluno</h2>
                  <p className="mt-0.5 text-xs text-slate-500">ID: {detailsStudent.id}</p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseDetails}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-4">
                <section className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Informações básicas
                  </h3>
                  <div className="mt-3 space-y-1 text-sm">
                    <p>
                      <span className="font-semibold text-slate-700">Nome: </span>
                      <span className="text-slate-800">{detailsStudent.name}</span>
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">E-mail: </span>
                      <span className="text-slate-800">{detailsStudent.email}</span>
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Série: </span>
                      <span className="text-slate-800">
                        {detailsStudent.currentGrade
                          ? `Série ${detailsStudent.currentGrade}`
                          : 'Não informada'}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Data de nascimento: </span>
                      <span className="text-slate-800">
                        {detailsStudent.dateOfBirth
                          ? detailsStudent.dateOfBirth.slice(0, 10).split('-').reverse().join('/')
                          : 'Não informada'}
                      </span>
                    </p>
                  </div>
                </section>

                <section className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Responsáveis
                  </h3>
                  {detailsStudent.guardians && detailsStudent.guardians.length > 0 ? (
                    <div className="mt-3 space-y-3 text-sm">
                      {detailsStudent.guardians.map((g, idx) => (
                        <div
                          key={`${g.name}-${idx}`}
                          className="rounded-lg border border-slate-100 bg-white px-3 py-2"
                        >
                          <p className="text-xs font-semibold text-slate-500">
                            Responsável {idx + 1}
                          </p>
                          <p>
                            <span className="font-semibold text-slate-700">Nome: </span>
                            <span className="text-slate-800">{g.name}</span>
                          </p>
                          <p>
                            <span className="font-semibold text-slate-700">Parentesco: </span>
                            <span className="text-slate-800">{g.relationship}</span>
                          </p>
                          <p>
                            <span className="font-semibold text-slate-700">Telefone: </span>
                            <span className="text-slate-800">{g.phone}</span>
                          </p>
                          <p>
                            <span className="font-semibold text-slate-700">E-mail: </span>
                            <span className="text-slate-800">{g.email}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-slate-500">Nenhum responsável cadastrado.</p>
                  )}
                </section>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-3">
                <button
                  type="button"
                  onClick={handleCloseDetails}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default UsersListPage
