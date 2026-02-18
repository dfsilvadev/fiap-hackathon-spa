import { ArrowLeft, FileArrowUp, Plus, ToggleLeft, ToggleRight, Trash } from '@phosphor-icons/react'
import { ErrorMessage, Field, FieldArray, Form, Formik } from 'formik'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as Yup from 'yup'

import { DatePickerField } from '@/components/inputs/datePickerField'
import { PhoneField } from '@/components/inputs/phoneField'
import type { Guardian, User } from '@/components/ui/user'
import { useAuth } from '@/hooks/useAuth'
import {
  getUserById,
  toggleUserActive,
  updateStudentUser,
  type StudentGrade,
  type UpdateUserStudentInput,
} from '@/resources/userResources'
import { Routes } from '@/router/constants/routesMap'

interface StudentEditFormValues {
  name: string
  email: string
  currentGrade: StudentGrade | ''
  dateOfBirth: string
  guardians: Guardian[]
  isActive: boolean
}

const gradesOptions: { value: StudentGrade; label: string }[] = [
  { value: '6', label: '6º ano' },
  { value: '7', label: '7º ano' },
  { value: '8', label: '8º ano' },
  { value: '9', label: '9º ano' },
  { value: '1EM', label: '1º EM' },
  { value: '2EM', label: '2º EM' },
  { value: '3EM', label: '3º EM' },
]

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Nome é obrigatório'),
  email: Yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
  currentGrade: Yup.string().required('Série é obrigatória'),
  guardians: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required('Nome obrigatório'),
      relationship: Yup.string().required('Parentesco obrigatório'),
      phone: Yup.string().required('Telefone obrigatório'),
      email: Yup.string().email('E-mail inválido').required('E-mail obrigatório'),
    })
  ),
})

const UserEditPage = () => {
  const navigate = useNavigate()
  const params = useParams<{ id: string }>()
  const { isLoggedIn, me } = useAuth()

  const [initialValues, setInitialValues] = useState<StudentEditFormValues | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const inputClass =
    'w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all'
  const subInputClass =
    'w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-200 outline-none transition-all'
  const subLabelClass = 'text-xs font-bold text-slate-500 mb-1 ml-1'
  const errorLabel = 'text-[10px] text-red-500 font-bold ml-1 mt-1'

  type SetFieldValueFn = (field: string, value: unknown, shouldValidate?: boolean) => void

  useEffect(() => {
    if (!isLoggedIn) {
      navigate(Routes.SIGN_IN)
      return
    }

    if (me && me.role !== 'coordinator') {
      navigate(Routes.HOME)
    }
  }, [isLoggedIn, me, navigate])

  useEffect(() => {
    const id = params.id
    if (!id) return

    const fetchUser = async () => {
      try {
        setLoading(true)
        const response = await getUserById(id)
        const user = response.data as User

        setInitialValues({
          name: user.name,
          email: user.email,
          currentGrade: (user.currentGrade as StudentGrade | null) ?? '',
          dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
          guardians: user.guardians ?? [],
          isActive: user.isActive,
        })
      } catch (err) {
        console.error('[UserEditPage] Erro ao carregar usuário', err)
        setError('Não foi possível carregar os dados do usuário.')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [params.id])

  const handleSubmit = async (values: StudentEditFormValues) => {
    const id = params.id
    if (!id) return

    const payload: UpdateUserStudentInput = {
      name: values.name,
      email: values.email,
      currentGrade: values.currentGrade as StudentGrade,
      guardians: values.guardians,
      dateOfBirth: values.dateOfBirth
        ? new Date(`${values.dateOfBirth}T00:00:00`).toISOString()
        : null,
    }

    await updateStudentUser(id, payload)
    alert('Dados do aluno atualizados com sucesso!')
    navigate(Routes.USERS)
  }

  const handleToggleActive = async (
    userId: string,
    current: boolean,
    setFieldValue: SetFieldValueFn
  ) => {
    await toggleUserActive(userId, !current)
    setFieldValue('isActive', !current)
  }

  if (!isLoggedIn || (me && me.role !== 'coordinator')) {
    return null
  }

  if (loading || !initialValues) {
    return (
      <main className="min-h-screen bg-slate-50/80 p-6 md:p-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          <p className="text-sm text-slate-500">Carregando dados do aluno...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50/80 p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigate(Routes.USERS)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={18} weight="bold" />
            Voltar
          </button>
          <div className="text-right sm:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Editar Usuário
            </h1>
            <p className="mt-1 text-sm text-slate-600">Atualize os dados do aluno selecionado.</p>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <Formik<StudentEditFormValues>
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={handleSubmit}
          validateOnBlur={false}
          validateOnChange={false}
        >
          {({ values, isSubmitting, errors, touched, setFieldValue }) => (
            <Form className="space-y-8">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Informações Básicas</h2>
                    <p className="mt-1 text-xs text-slate-500">Dados principais do aluno.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(params.id!, values.isActive, setFieldValue)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    {values.isActive ? (
                      <>
                        <ToggleRight size={18} weight="fill" className="text-emerald-500" />
                        Aluno ativo
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={18} weight="fill" className="text-slate-400" />
                        Aluno inativo
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="flex flex-col">
                    <label className="text-sm font-bold text-slate-600 italic mb-2">
                      Nome completo *
                    </label>
                    <Field
                      name="name"
                      className={`${inputClass} ${
                        touched.name && errors.name ? 'border-red-400' : ''
                      }`}
                    />
                    {touched.name && errors.name && (
                      <span className={errorLabel}>{errors.name}</span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-bold italic text-slate-600 mb-2">E-mail *</label>
                    <Field
                      name="email"
                      type="email"
                      className={`${inputClass} ${
                        touched.email && errors.email ? 'border-red-400' : ''
                      }`}
                    />
                    {touched.email && errors.email && (
                      <span className={errorLabel}>{errors.email}</span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-bold italic text-slate-600 mb-2">
                      Tipo de usuário
                    </label>
                    <input
                      value="Aluno"
                      disabled
                      className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-slate-900">Dados do Aluno</h2>
                  <p className="mt-1 text-xs text-slate-500">Informações específicas do aluno.</p>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="flex flex-col">
                    <label className="text-sm font-bold italic text-slate-600 mb-2">Série *</label>
                    <Field
                      as="select"
                      name="currentGrade"
                      className={`${inputClass} ${
                        touched.currentGrade && errors.currentGrade ? 'border-red-400' : ''
                      }`}
                    >
                      <option value="">Selecione a série</option>
                      {gradesOptions.map((grade) => (
                        <option key={grade.value} value={grade.value}>
                          {grade.label}
                        </option>
                      ))}
                    </Field>
                    {touched.currentGrade && errors.currentGrade && (
                      <span className={errorLabel}>{errors.currentGrade}</span>
                    )}
                  </div>

                  <DatePickerField name="dateOfBirth" label="Data de nascimento (opcional)" />
                </div>
              </section>

              <FieldArray name="guardians">
                {({ push, remove }) => (
                  <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">Responsáveis</h2>
                        <p className="mt-1 text-xs text-slate-500">
                          Pelo menos um responsável é obrigatório (nome, telefone, e-mail e
                          parentesco).
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          push({ name: '', email: '', phone: '', relationship: '' } as Guardian)
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
                      >
                        <Plus size={18} weight="bold" />
                        Adicionar responsável
                      </button>
                    </div>

                    <div className="space-y-6">
                      {values.guardians.map((_, index) => (
                        <div
                          key={index}
                          className="relative rounded-3xl border border-slate-100 bg-slate-50 p-6 pt-12 shadow-sm"
                        >
                          {values.guardians.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="absolute right-4 top-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-400 transition-colors hover:text-red-500"
                            >
                              <Trash size={16} weight="bold" />
                              Remover
                            </button>
                          )}

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="flex flex-col">
                              <label className={subLabelClass}>Nome *</label>
                              <Field
                                name={`guardians.${index}.name`}
                                className={subInputClass}
                                placeholder="Nome do responsável"
                              />
                              <ErrorMessage
                                name={`guardians.${index}.name`}
                                component="span"
                                className={errorLabel}
                              />
                            </div>

                            <div className="flex flex-col">
                              <label className={subLabelClass}>Parentesco *</label>
                              <Field
                                name={`guardians.${index}.relationship`}
                                className={subInputClass}
                                placeholder="Ex.: mãe, pai"
                              />
                              <ErrorMessage
                                name={`guardians.${index}.relationship`}
                                component="span"
                                className={errorLabel}
                              />
                            </div>

                            <div className="flex flex-col">
                              <label className={subLabelClass}>Telefone *</label>
                              <PhoneField name={`guardians.${index}.phone`} variant="sub" />
                              <ErrorMessage
                                name={`guardians.${index}.phone`}
                                component="span"
                                className={errorLabel}
                              />
                            </div>

                            <div className="flex flex-col">
                              <label className={subLabelClass}>E-mail *</label>
                              <Field
                                name={`guardians.${index}.email`}
                                className={subInputClass}
                                placeholder="email@exemplo.com"
                              />
                              <ErrorMessage
                                name={`guardians.${index}.email`}
                                component="span"
                                className={errorLabel}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </FieldArray>

              <div className="flex justify-end gap-4 pb-4">
                <button
                  type="button"
                  onClick={() => navigate(Routes.USERS)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <FileArrowUp size={20} weight="bold" />
                  {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </main>
  )
}

export default UserEditPage
