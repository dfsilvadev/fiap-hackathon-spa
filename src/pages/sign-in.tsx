import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Routes } from '../router/constants/routesMap'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { EnvelopeSimple, LockSimple, WarningCircle } from '@phosphor-icons/react'
import { InputFormik } from '../components/inputs/inputFormik'
import { useAuth } from '../hooks/useAuth' // Import useAuth
import { sendLogin } from '../resources/authResources' // Import sendLogin

const validationSchema = Yup.object({
  email: Yup.string().email('E-mail inválido').required('Obrigatório'),
  password: Yup.string().min(6, 'Senha muito curta').required('Obrigatório'),
})

const SignInPage = () => {
  const [hasError, setHasError] = useState(false)
  const { login } = useAuth() // Get the login function from useAuth
  const navigate = useNavigate() // For redirection after login

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-[400px]">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Bem-vindo</h1>
          <p className="mt-2 text-sm text-gray-500">Entre com suas credenciais para continuar</p>
        </header>

        {hasError && (
          <div className="rounded-sm border border-red-500 py-2 mb-4 items-center justify-center flex flex-row gap-2 ">
            <div className="mr-8">
              <WarningCircle size={32} className="text-red-500" />
            </div>
            <div>
              <p className="text-red-500">Credenciais inválidas.</p>
              <p className="text-red-500">Verifique seu email e senha.</p>
            </div>
          </div>
        )}

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setHasError(false)
            try {
              const response = await sendLogin(values)
              console.log('Login successful:', response.data)
              login(response.data)
              return navigate(Routes.HOME)
            } catch (error) {
              console.error('Login failed:', error)
              setHasError(true)
            } finally {
              setSubmitting(false)
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="w-full">
              <InputFormik
                name="email"
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                icon={EnvelopeSimple}
              />

              <InputFormik
                name="password"
                label="Senha"
                type="password"
                placeholder="******"
                icon={LockSimple}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 bg-[#234BB5] hover:bg-[#0c2870] text-white py-3 rounded-sm font-semibold transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </main>
  )
}

export default SignInPage
