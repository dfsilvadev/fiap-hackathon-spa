import { PatternFormat } from 'react-number-format'
import { useField, useFormikContext } from 'formik'
import { Phone } from '@phosphor-icons/react'

interface PhoneFieldProps {
  name: string
  label?: string
  variant?: 'primary' | 'sub'
}

export const PhoneField = ({ name, label, variant = 'primary' }: PhoneFieldProps) => {
  const { setFieldValue } = useFormikContext()
  const [field] = useField(name)

  const primaryClass =
    'w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all pr-12'
  const subClass =
    'w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-200 outline-none transition-all pr-10'

  return (
    <div className="flex flex-col space-y-2 w-full">
      {label && <label className="text-sm font-bold text-slate-600 ml-1 italic">{label}</label>}

      <div className="relative group w-full">
        <PatternFormat
          format="(##) #####-####"
          mask="_"
          value={field.value}
          onValueChange={(values) => setFieldValue(name, values.value)}
          className={variant === 'primary' ? primaryClass : subClass}
          placeholder="(00) 00000-0000"
        />
        <div
          className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors 
          ${variant === 'primary' ? 'group-focus-within:text-blue-500 text-slate-400' : 'group-focus-within:text-emerald-500 text-slate-300'}`}
        >
          <Phone size={variant === 'primary' ? 22 : 18} weight="bold" />
        </div>
      </div>
    </div>
  )
}
