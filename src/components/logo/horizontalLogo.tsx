import { Student } from '@phosphor-icons/react'

interface HorizontalLogoProps {
  sizeIcon: number
  sizeText: number
}

export const HorizontalLogo = ({ sizeIcon, sizeText }: HorizontalLogoProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="bg-[#4F6FC4] w-10 h-10 flex items-center justify-center rounded-xl">
        <Student size={sizeIcon} color="white" />
      </div>

      <h1
        className="text-white font-bold text-[length:var(--text-size)]"
        style={{ '--text-size': `${sizeText}px` } as React.CSSProperties}
      >
        EduPlatform
      </h1>
    </div>
  )
}

export default HorizontalLogo
