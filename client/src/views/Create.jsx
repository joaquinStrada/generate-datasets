/* eslint-disable no-undef */
/* eslint-disable react/react-in-jsx-scope */
import { useState } from 'react'
import SelectMoneda from '../components/SelectMoneda'
import DataDataset from '../components/DataDataset'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useForm } from 'react-hook-form'

import '../styles/create.css'
import InputValidityData, { parseValidityData } from '../components/InputValidityData'
import { formValidate } from '../utils/formValidate'
import { Api } from '../utils/Api'

const Create = () => {
	const { 
		register,
		handleSubmit,
		setValue,
		formState: { errors },
		watch,
		setError,
		clearErrors } = useForm({
		defaultValues: {
			validityData: '0%'
		}
	})
	const [ dataDataset, setDataDataset ] = useState([
		{ id: 0, property: 'current_price', enabled: false },
		{ id: 1, property: 'market_cap', enabled: false },
		{ id: 2, property: 'total_volume', enabled: false },
		{ id: 3, property: 'price_change_24h', enabled: false },
		{ id: 4, property: 'price_change_percentage_24h', enabled: false },
		{ id: 5, property: 'market_cap_change_24h', enabled: false },
		{ id: 6, property: 'market_cap_change_percentage_24h', enabled: false }
	])
	const [ predictData, setPredictData ] = useState([
		{ id: 0, property: 'current_price', enabled: false },
		{ id: 1, property: 'market_cap', enabled: false },
		{ id: 2, property: 'total_volume', enabled: false },
		{ id: 3, property: 'price_change_24h', enabled: false },
		{ id: 4, property: 'price_change_percentage_24h', enabled: false },
		{ id: 5, property: 'market_cap_change_24h', enabled: false },
		{ id: 6, property: 'market_cap_change_percentage_24h', enabled: false }
	])

	const handleData = (property, checked) => {
		const data = [...dataDataset]
		const index = data.findIndex(elementProperty => elementProperty.property === property)
		data[index].enabled = checked
		setDataDataset(data)

		if (checked) {
			clearErrors('data')
		}
	}

	const handlePredictData = async (property, checked) => {
		const predictData2 = [...predictData]
		const index = predictData2.findIndex(elementProperty => elementProperty.property === property)
		predictData2[index].enabled = checked
		setPredictData(predictData2)

		if (checked) {
			clearErrors('predictData')
		}
	}

	const onSubmit = async data => {
		const { name, description, coinId, firstDate, endDate, validityData } = data
		const body = {
			name,
			description,
			coinId,
			firstDate,
			endDate,
			data: [],
			predictData: [],
			validityData: parseValidityData(validityData)
		}

		// Rellenamos el data y el predictData
		dataDataset.forEach(({ id, property, enabled }) => {
			if (enabled) {
				body.data[id] = property
			}
		})

		predictData.forEach(({ id, property, enabled }) => {
			if (enabled) {
				body.predictData[id] = property
			}
		})

		// Validamos el data y el predictData
		if (body.data.length == 0) {
			setError('data', {
				type: 'required',
				message: 'Campo obligatorio'
			})
		}

		if (body.predictData.length === 0) {
			setError('predictData', {
				type: 'required',
				message: 'Campo obligatorio'
			})
		}

		if (body.data.length === 0 || body.predictData.length === 0) return

		// Enviamos los datos
		try {
			const res = await Api.post('/', body)

			if (!res.data.error) {
				toastr.success('Dataset creado satisfactoriamente!!!', 'Dataset creado')
			}
		} catch (err) {
			console.error(err)

			if (err.response?.data?.error) {
				toastr.error(err.response.data.message, 'Error!!!')
			}
		}
	}

	return (
		<form className="app" onSubmit={handleSubmit(onSubmit)}>
			<h2 className="title">Crear Dataset</h2>
			<div className="form-group">
				<label className="form-label">Nombre:</label>
				<input 
					className="form-input" 
					type="text" 
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
			<div className="form-group">
				<label className="form-label">Moneda:</label>
				<SelectMoneda 
					className="form-input"
					valueSelect={watch('coinId')}
					onChangeSelect={value => setValue('coinId', value)}
					{...register('coinId', {
						required: formValidate.required,
						minLength: formValidate.minLength(3),
						maxLength: formValidate.maxLength(10)
					})}
				/>
				<p className="form-error">{errors.coinId?.message}</p>
			</div>
			<div className="form-group">
				<label className="form-label">Fecha de inicio:</label>
				<input 
					className="form-input" 
					type="date"
					{...register('firstDate', {
						required: formValidate.required
					})}
				/>
				<p className="form-error">{errors.firstDate?.message}</p>
			</div>
			<div className="form-group">
				<label className="form-label">Fecha de Fin:</label>
				<input 
					className="form-input" 
					type="date"
					{...register('endDate', {
						required: formValidate.required
					})}
				/>
				<p className="form-error">{errors.endDate?.message}</p>
			</div>
			<div className="form-group">
				<label className="form-label">Datos:</label>
				<DataDataset onChange={handleData} />
				<p className="form-error">{errors.data?.message}</p>
			</div>
			<div className="form-group">
				<label className="form-label">Datos a predecir:</label>
				<DataDataset onChange={handlePredictData} />
				<p className="form-error">{errors.predictData?.message}</p>
			</div>
			<div className="form-group">
				<label className="form-label">Datos de validacion:</label>
				<InputValidityData 
					valueData={watch('validityData')} 
					onChangeData={validityData => setValue('validityData', `${validityData}%`)}
					{...register('validityData', {
						required: formValidate.required,
						minLength: formValidate.minLength(2),
						maxLength: formValidate.maxLength(4)
					})}
				/>
				<p className="form-error">{errors.validityData?.message}</p>
			</div>

			<button className="btn-submit" type="submit">
				<FontAwesomeIcon icon={faPlus} />
				Crear Dataset
			</button>
		</form>
	)
}

export default Create