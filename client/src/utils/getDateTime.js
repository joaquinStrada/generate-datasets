export const getDate = dateStr => {
	const date = new Date(dateStr)

	return new Intl.DateTimeFormat('es-AR').format(date)
}

export const getTime = timeSeconds => {
	let minutes = Math.floor(timeSeconds / 60)
	let seconds = timeSeconds % 60
	let hours = Math.floor(minutes / 60)
	minutes = minutes % 60

	seconds = seconds < 10 ? `0${seconds}` : seconds
	minutes = minutes < 10 ? `0${minutes}` : minutes
	hours = hours < 10 ? `0${hours}` : hours

	return `${hours}:${minutes}:${seconds}`
}