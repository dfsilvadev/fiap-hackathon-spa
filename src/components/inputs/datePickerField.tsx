import Datepicker, { DateValueType } from 'react-tailwindcss-datepicker'
import { useField, useFormikContext } from 'formik'
import { CalendarBlank } from '@phosphor-icons/react'

interface DatePickerProps {
  name: string
  label: string
}

export const DatePickerField = ({ name, label }: DatePickerProps) => {
  const { setFieldValue } = useFormikContext()
  const [field] = useField(name)
  const parseDate = (dateString: string) => {
    if (!dateString) return null
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const value: DateValueType = {
    startDate: parseDate(field.value),
    endDate: parseDate(field.value),
  }

  const handleValueChange = (newValue: DateValueType) => {
    if (newValue?.startDate) {
      const date = new Date(newValue.startDate.toString())
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')

      setFieldValue(name, `${year}-${month}-${day}`)
    } else {
      setFieldValue(name, '')
    }
  }

  return (
    <div className="flex flex-col space-y-2 w-full">
      <label className="ml-1 text-sm font-bold italic text-slate-600">{label}</label>

      <div className="group relative w-full border border-slate-200 rounded-2xl bg-slate-50 transition-all focus-within:ring-4 focus-within:ring-blue-100">
        <Datepicker
          i18n="pt-br"
          useRange={false}
          asSingle={true}
          value={value}
          onChange={handleValueChange}
          displayFormat="DD/MM/YYYY"
          placeholder="Selecione a data"
          primaryColor="blue"
          maxDate={new Date()}
          inputClassName="w-full p-4 bg-transparent outline-none text-slate-700 font-medium placeholder:text-slate-400 pr-12"
          toggleClassName="hidden"
        />

        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500">
          <CalendarBlank size={22} weight="bold" />
        </div>
      </div>
    </div>
  )
}
