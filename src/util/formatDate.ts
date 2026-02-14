const formatDate = (dateString: string | Date) => {
  if (!dateString) return '--/--/----'

  const date = new Date(dateString)

  if (isNaN(date.getTime())) return 'Data inválida'

  return new Intl.DateTimeFormat('pt-BR').format(date)
}

export { formatDate }
