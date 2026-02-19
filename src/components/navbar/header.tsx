import logo from '@/assets/logo/logo.svg'

export const Header = () => {
  return (
    <header className="bg-blue-600 text-white p-4">
      <img src={logo} alt="EduPlatform" className="h-14 w-auto" />
    </header>
  )
}
