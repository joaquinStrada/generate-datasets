export const getDate = dateStr => {
	const date = new Date(dateStr)

	return new Intl.DateTimeFormat('es-AR').format(date)
}