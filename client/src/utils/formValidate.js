export const formValidate = {
	required: {
		value: true,
		message: 'Campo obligatorio'
	},
	minLength(value) {
		return {
			value,
			message: `El campo debe tener como minimo ${value} caracteres`
		}
	},
	maxLength(value) {
		return {
			value,
			message: `El campo debe tener como maximo ${value} caracteres`
		}
	}
}