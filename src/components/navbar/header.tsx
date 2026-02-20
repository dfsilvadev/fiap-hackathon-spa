import logo from '@/assets/logo/logo.svg'

export const Header = () => {
  return (
    <header className="bg-blue-600 text-white p-4">
      <img src={logo} alt="Plataforma Evolui" className="h-14 w-auto" />
    </header>
  )
}
