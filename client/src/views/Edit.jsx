/* eslint-disable no-undef */
/* eslint-disable react/react-in-jsx-scope */
import { useState, useEffect } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons'
import { useForm } from 'react-hook-form'
import { formValidate } from '../utils/formValidate'
import { Api } from '../utils/Api'
import '../styles/create.css'

const Edit = () => {
	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors }
	} = useForm()
	const { datasetId } = useParams()
	const [ notFound, setNotFound ] = useState(false)


	const onSubmit = async data => {
		try {
			const res = await Api.put(`/${datasetId}`, data)

			if (res.status === 200) {
				toastr.success('Dataset editado satisfactoriamente!!!', 'Editar Dataset')
				setTimeout(() => window.location.href = '/', 5000)
			}
		} catch (err) {
			console.error(err)

			if (err.response?.data?.error) {
				toastr.error(err.response.data.message, 'Error!!!')
			}
		}
	}

	const getData = async () => {
		try {
			const res = await Api.get(`/${datasetId}`)
			
			if (res.status === 200) {
				setNotFound(res.data.error)
				setValue('name', res.data.data.name)
				setValue('description', res.data.data.description)
			} else {
				setNotFound(res.data.error)
			}
		} catch (err) {
			console.error(err)
			setNotFound(true)
		}
	}

	useEffect(() => {
		getData()
	}, [])

	return (
		<form className="app" onSubmit={handleSubmit(onSubmit)}>
			<h2 className="title">Editar Dataset</h2>
			<div className="form-group">
				<label className="form-label">Nombre:</label>
				<input
					type="text"
					className="form-input"
					placeholder="Nombre"
					{...register('name', {
						required: formValidate.required,
						minLength: formValidate.minLength(6),
						maxLength: formValidate.maxLength(50)
					})}
				/>
				<p className="form-error">{errors.name?.message}</p>
			</div>
			<div className="form-group">
				<label className="form-label">Descripcion:</label>
				<textarea
					className="form-input"
					placeholder="Descripcion"
					{...register('description', {
						required: formValidate.required,
						minLength: formValidate.minLength(6),
						maxLength: formValidate.maxLength(255)
					})}
				></textarea>
				<p className="form-error">{errors.description?.message}</p>
			</div>

			<button type="submit" className="btn-submit">
				<FontAwesomeIcon icon={faPenToSquare} />
                Editar Dataset
			</button>
		</form>
	)
}

export default Edit