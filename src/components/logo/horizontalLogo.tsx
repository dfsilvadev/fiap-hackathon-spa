import { Student } from '@phosphor-icons/react'

interface HorizontalLogoProps {
  sizeIcon: number
  sizeText: number
  textColor: string
  iconColor: string
  bgColor: string
}

export const HorizontalLogo = ({
  sizeIcon,
  sizeText,
  textColor = '#FFFFFF',
  iconColor = '#FFFFFF',
  bgColor = '#4F6FC4',
}: HorizontalLogoProps) => {
  return (
    <div className="flex items-center gap-4">
      <div
        className="w-10 h-10 flex items-center justify-center rounded-xl"
        style={{ backgroundColor: bgColor }}
      >
        <Student size={sizeIcon} color={iconColor} />
      </div>

      <h1
        className="font-bold text-[length:var(--text-size)]"
        style={
          {
            '--text-size': `${sizeText}px`,
            color: textColor,
          } as React.CSSProperties
        }
      >
        EduPlatform
      </h1>
    </div>
  )
}

export default HorizontalLogo
