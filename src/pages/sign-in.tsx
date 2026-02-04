import { useTranslation } from 'react-i18next'
import { House } from '@phosphor-icons/react'

const SignInPage = () => {
  const { t } = useTranslation()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <House size={48} weight="duotone" className="text-indigo-600" />
      <h1 className="mt-4 text-3xl font-bold">{t('welcome')}</h1>
      <p className="mt-2 text-gray-600">{t('description')}</p>
    </main>
  )
}

export default SignInPage
