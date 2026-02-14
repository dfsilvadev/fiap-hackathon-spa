import { Formik, Form, Field, FieldArray, FormikHelpers, ErrorMessage } from 'formik'
import { Plus, Trash, FileArrowUp, XCircle } from '@phosphor-icons/react'
import * as Yup from 'yup'

import { useAuth } from '../hooks/useAuth'
import { updateUser, getUserById } from '@/resources/userResources'

import { EditProfileContainer } from '../components/profile/EditProfileContainer'
import { DatePickerField } from '../components/inputs/datePickerField'
import { PhoneField } from '../components/inputs/phoneField'

import type { User, Guardian } from '../components/ui/user'

const profileSchema = Yup.object().shape({
  name: Yup.string().min(3, 'Nome muito curto').required('O nome é obrigatório'),
  email: Yup.string().email('E-mail válido').required('O e-mail é obrigatório'),
  phone: Yup.string().required('Telefone é obrigatório'),
  dateOfBirth: Yup.string().required('Data de nascimento é obrigatória'),
  guardians: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required('Nome obrigatório'),
      relationship: Yup.string().required('Parentesco obrigatório'),
      phone: Yup.string().required('Obrigatório'),
      email: Yup.string().email('E-mail inválido').required('Obrigatório'),
    })
  ),
})

export const ProfilePage = () => {
  const { user } = useAuth()
  const STORAGE_KEY = 'user'

  const initialValuesFromAuth: User = {
    ...user,
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    dateOfBirth: user?.dateOfBirth ?? '',
    guardians: user?.guardians ?? [],
  } as User

  const inputClass =
    'w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all'
  const subInputClass =
    'w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-200 outline-none transition-all'
  const subLabelClass = 'text-xs font-bold text-slate-500 mb-1 ml-1'
  const errorLabel = 'text-[10px] text-red-500 font-bold ml-1 mt-1'

  const handleSaveProfile = async (values: User, { setSubmitting }: FormikHelpers<User>) => {
    const userId = user?.id
    if (!userId) return

    try {
      const payload: Partial<User> = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        dateOfBirth: values.dateOfBirth,
        guardians: values.guardians,
      }

      await updateUser(userId, payload)
      const userResponse = await getUserById(userId)

      localStorage.setItem(STORAGE_KEY, JSON.stringify(userResponse.data))
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: STORAGE_KEY,
          newValue: JSON.stringify(userResponse.data),
        })
      )

      alert('Perfil atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar no servidor.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <EditProfileContainer>
      {({ initialValues }) => (
        <Formik<User>
          initialValues={initialValues || initialValuesFromAuth}
          enableReinitialize
          validationSchema={profileSchema}
          onSubmit={handleSaveProfile}
          validateOnMount={false}
          validateOnChange={false}
          validateOnBlur={true}
        >
          {({ values, isSubmitting, errors, touched, handleReset, dirty }) => (
            <Form className="min-h-screen bg-[#f1f5f9] p-4 md:p-10">
              <div className="max-w-7xl mx-auto space-y-10">
                <header>
                  <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    Editar Perfil
                  </h1>
                  <p className="text-slate-500 mt-2 text-lg">
                    Mantenha suas informações e contatos de emergência atualizados.
                  </p>
                </header>

                <section className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-3 mb-8 border-b pb-4">
                    <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-slate-800">Informações Pessoais</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col">
                      <label className="text-sm font-bold text-slate-600 italic mb-2">
                        Nome Completo
                      </label>
                      <Field
                        name="name"
                        className={`${inputClass} ${touched.name && errors.name ? 'border-red-400' : ''}`}
                      />
                      {touched.name && errors.name && (
                        <span className={errorLabel}>{errors.name}</span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-bold italic text-slate-600 mb-2">Email</label>
                      <Field
                        name="email"
                        type="email"
                        className={`${inputClass} ${touched.email && errors.email ? 'border-red-400' : ''}`}
                      />
                      {touched.email && errors.email && (
                        <span className={errorLabel}>{errors.email}</span>
                      )}
                    </div>

                    <PhoneField name="phone" label="Telefone de Contato" variant="primary" />
                    <DatePickerField name="dateOfBirth" label="Data de Nascimento" />
                  </div>
                </section>

                <FieldArray name="guardians">
                  {({ push, remove }) => (
                    <section className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-200">
                      <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                          <h2 className="text-2xl font-bold text-slate-800">
                            Responsáveis Familiares
                          </h2>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            push({ name: '', email: '', phone: '', relationship: '' } as Guardian)
                          }
                          className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-100 transition-colors"
                        >
                          <Plus size={20} weight="bold" /> Adicionar Responsável
                        </button>
                      </div>

                      <div className="space-y-6">
                        {values.guardians?.map((_, index) => (
                          <div
                            key={index}
                            className="p-6 border border-slate-100 rounded-3xl bg-slate-50 relative pt-14 shadow-sm"
                          >
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="absolute top-4 right-4 flex items-center gap-2 text-slate-400 hover:text-red-500 font-bold text-xs uppercase transition-colors"
                            >
                              Excluir <Trash size={20} weight="bold" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="flex flex-col">
                                <label className={subLabelClass}>Nome completo</label>
                                <Field
                                  name={`guardians.${index}.name`}
                                  placeholder="Ex: Maria Silva"
                                  className={subInputClass}
                                />
                                <ErrorMessage
                                  name={`guardians.${index}.name`}
                                  component="span"
                                  className={errorLabel}
                                />
                              </div>

                              <div className="flex flex-col">
                                <label className={subLabelClass}>Parentesco</label>
                                <Field
                                  name={`guardians.${index}.relationship`}
                                  placeholder="Ex: Mãe / Pai"
                                  className={subInputClass}
                                />
                                <ErrorMessage
                                  name={`guardians.${index}.relationship`}
                                  component="span"
                                  className={errorLabel}
                                />
                              </div>

                              <div className="flex flex-col">
                                <label className={subLabelClass}>Telefone</label>
                                <PhoneField name={`guardians.${index}.phone`} variant="sub" />
                                <ErrorMessage
                                  name={`guardians.${index}.phone`}
                                  component="span"
                                  className={errorLabel}
                                />
                              </div>

                              <div className="flex flex-col">
                                <label className={subLabelClass}>E-mail</label>
                                <Field
                                  name={`guardians.${index}.email`}
                                  placeholder="email@exemplo.com"
                                  className={subInputClass}
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

                <div className="flex justify-end pt-2 gap-4">
                  {dirty && (
                    <button
                      type="button"
                      onClick={() => handleReset()}
                      className="p-3 px-6 rounded-xl text-slate-600 font-bold bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 active:scale-95"
                    >
                      <XCircle size={22} />
                      Descartar Alterações
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || !dirty}
                    className="p-3 px-8 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-2 transition-all active:scale-95"
                  >
                    <FileArrowUp size={24} weight="fill" />
                    <span>{isSubmitting ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}</span>
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      )}
    </EditProfileContainer>
  )
}

export default ProfilePage
