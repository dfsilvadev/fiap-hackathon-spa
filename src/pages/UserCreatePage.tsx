import { ArrowLeft, FileArrowUp, Plus, Trash } from '@phosphor-icons/react'
import { ErrorMessage, Field, FieldArray, Form, Formik } from 'formik'
import { useNavigate } from 'react-router-dom'
import * as Yup from 'yup'

import { DatePickerField } from '@/components/inputs/datePickerField'
import { PhoneField } from '@/components/inputs/phoneField'
import type { Guardian } from '@/components/ui/user'
import { useAuth } from '@/hooks/useAuth'
import {
  createStudentUser,
  type CreateUserStudentInput,
  type StudentGrade,
} from '@/resources/userResources'
import { Routes } from '@/router/constants/routesMap'

interface StudentFormValues {
  name: string
  email: string
  password: string
  passwordConfirmation: string
  currentGrade: StudentGrade | ''
  dateOfBirth: string
  guardians: Guardian[]
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
  password: Yup.string().min(6, 'Mínimo de 6 caracteres').required('Senha é obrigatória'),
  passwordConfirmation: Yup.string()
    .oneOf([Yup.ref('password')], 'As senhas devem coincidir')
    .required('Confirmação de senha é obrigatória'),
  currentGrade: Yup.string().required('Série é obrigatória'),
  guardians: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().required('Nome obrigatório'),
        relationship: Yup.string().required('Parentesco obrigatório'),
        phone: Yup.string().required('Telefone obrigatório'),
        email: Yup.string().email('E-mail inválido').required('E-mail obrigatório'),
      })
    )
    .min(1, 'Pelo menos um responsável é obrigatório'),
})

const initialValues: StudentFormValues = {
  name: '',
  email: '',
  password: '',
  passwordConfirmation: '',
  currentGrade: '' as StudentGrade | '',
  dateOfBirth: '',
  guardians: [
    {
      name: '',
      email: '',
      phone: '',
      relationship: '',
    },
  ],
}

const UserCreatePage = () => {
  const navigate = useNavigate()
  const { isLoggedIn, me } = useAuth()

  const inputClass =
    'w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all'
  const subInputClass =
    'w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-200 outline-none transition-all'
  const subLabelClass = 'text-xs font-bold text-slate-500 mb-1 ml-1'
  const errorLabel = 'text-[10px] text-red-500 font-bold ml-1 mt-1'

  if (!isLoggedIn) {
    navigate(Routes.SIGN_IN)
    return null
  }

  if (me && me.role !== 'coordinator') {
    navigate(Routes.HOME)
    return null
  }

  const handleSubmit = async (values: StudentFormValues) => {
    const payload: CreateUserStudentInput = {
      name: values.name,
      email: values.email,
      password: values.password,
      role: 'student',
      currentGrade: values.currentGrade as StudentGrade,
      guardians: values.guardians,
      dateOfBirth: values.dateOfBirth
        ? new Date(`${values.dateOfBirth}T00:00:00`).toISOString()
        : undefined,
    }

    await createStudentUser(payload)
    alert('Aluno criado com sucesso!')
    navigate(Routes.USERS)
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
              Novo Usuário
            </h1>
            <p className="mt-1 text-sm text-slate-600">Cadastre um novo aluno na plataforma.</p>
          </div>
        </header>

        <Formik<StudentFormValues>
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          validateOnBlur={false}
          validateOnChange={false}
        >
          {({ values, isSubmitting, errors, touched }) => (
            <Form className="space-y-8">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-slate-900">Informações Básicas</h2>
                  <p className="mt-1 text-xs text-slate-500">Dados principais do aluno.</p>
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
                    <label className="text-sm font-bold italic text-slate-600 mb-2">Senha *</label>
                    <Field
                      name="password"
                      type="password"
                      className={`${inputClass} ${
                        touched.password && errors.password ? 'border-red-400' : ''
                      }`}
                    />
                    {touched.password && errors.password && (
                      <span className={errorLabel}>{errors.password}</span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-bold italic text-slate-600 mb-2">
                      Confirmar senha *
                    </label>
                    <Field
                      name="passwordConfirmation"
                      type="password"
                      className={`${inputClass} ${
                        touched.passwordConfirmation && errors.passwordConfirmation
                          ? 'border-red-400'
                          : ''
                      }`}
                    />
                    {touched.passwordConfirmation && errors.passwordConfirmation && (
                      <span className={errorLabel}>{errors.passwordConfirmation}</span>
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
                  {isSubmitting ? 'Salvando...' : 'Salvar aluno'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </main>
  )
}

export default UserCreatePage
