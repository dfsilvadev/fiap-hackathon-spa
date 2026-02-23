import logo from '@/assets/logo/logo.svg'

interface HorizontalLogoProps {
  sizeIcon: number
  sizeText: number
  textColor: string
  iconColor: string
  bgColor: string
  fitContainer?: boolean
}

export const HorizontalLogo = ({ sizeText, fitContainer = false }: HorizontalLogoProps) => {
  return (
    <div className={`flex items-center ${fitContainer ? 'w-full' : ''}`}>
      <img
        src={logo}
        alt="Plataforma Evolui"
        className={fitContainer ? 'w-full h-auto' : ''}
        style={fitContainer ? undefined : { height: `${sizeText}px`, width: 'auto' }}
      />
    </div>
  )
}

export default HorizontalLogo
