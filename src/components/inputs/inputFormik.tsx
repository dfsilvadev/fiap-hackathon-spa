import { IconProps } from '@phosphor-icons/react'
import { ElementType } from 'react'
import { useField } from 'formik'

interface InputFormikProps {
  name: string
  label?: string
  placeholder?: string
  type?: string
  icon: ElementType<IconProps>
  minWidth?: string
}

export const InputFormik = ({
  label,
  icon: Icon,
  minWidth = 'min-w-[300px]',
  ...props
}: InputFormikProps) => {
  // O hook useField conecta o input ao estado do Formik baseado no "name"
  const [field, meta] = useField(props.name)

  // Verifica se o campo foi tocado e se tem erro para exibir o span
  const hasError = meta.touched && meta.error

  return (
    <div className={`flex flex-col w-full gap-1 mb-4 ${minWidth}`}>
      {label && (
        <label htmlFor={props.name} className="text-sm font-light text-black">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        <div className="absolute left-3 text-[#606775]">
          <Icon size={20} />
        </div>

        <input
          {...field} // Isso passa name, value, onChange e onBlur automaticamente
          {...props} // Isso passa type, placeholder, etc.
          id={props.name}
          className={`
            w-full py-2.5 pl-10 pr-4 bg-white border rounded-sm outline-none transition-all
            ${
              hasError
                ? 'border-red-500 focus:ring-red-100'
                : 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
            }
          `}
        />
      </div>

      {/* Span de Erro condicional */}
      {hasError && <span className="text-xs text-red-500 mt-1 ml-1 font-medium">{meta.error}</span>}
    </div>
  )
}
