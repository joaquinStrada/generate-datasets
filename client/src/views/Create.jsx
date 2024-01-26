/* eslint-disable no-undef */
/* eslint-disable react/react-in-jsx-scope */
import { useState } from 'react'
import SelectMoneda from '../components/SelectMoneda'
import DataDataset from '../components/DataDataset'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import '../styles/create.css'
import InputValidityData from '../components/InputValidityData'
import { Api } from '../utils/Api'

const Create = () => {
	const [ name, setName ] = useState('')
	const [ description, setDescription ] = useState('')
	const [ coinId, setCoinId ] = useState('')
	const [ firstDate, setFirstDate ] = useState('')
	const [ endDate, setEndDate ] = useState('')
	const [ data, setData ] = useState([
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
	const [ validityData, setValidityData ] = useState(0)

	const handleData = (property, checked) => {
		const data2 = [...data]
		const index = data2.findIndex(elementProperty => elementProperty.property === property)
		data2[index].enabled = checked
		setData(data2)
	}

	const handlePredictData = async (property, checked) => {
		const predictData2 = [...predictData]
		const index = predictData2.findIndex(elementProperty => elementProperty.property === property)
		predictData2[index].enabled = checked
		setPredictData(predictData2)
	}

	const handleSubmit = async e => {
		e.preventDefault()
		const body = {
			name,
			description,
			coinId,
			firstDate,
			endDate,
			data: [],
			predictData: [],
			validityData
		}

		data.forEach(property => {
			if (property.enabled) {
				body.data[property.id] = property.property
			}
		})

		predictData.forEach(property => {
			if (property.enabled) {
				body.predictData[property.id] = property.property
			}
		})

		try {
			const res = await Api.post('/', body)

			if (res.data.error) {
				toastr.error(res.data.message, 'Error')
			} else {
				toastr.success('Dataset creado satisfactoriamente!!!!', 'Dataset creado')
			}
		} catch (err) {
			console.error(err)
			
			if (err.response && err.response.data && err.response.data.error) {
				toastr.error(err.response.data.message, 'Error')
			}
		}
	}

	return (
		<>
			<form className="app" onSubmit={handleSubmit}>
				<h2 className="title">Crear Dataset</h2>
				<div className="form-group">
					<label className="form-label">Nombre:</label>
					<input 
						className="form-input" 
						type="text" 
						placeholder="Nombre"
						value={name}
						onChange={e => setName(e.currentTarget.value)}
					/>
				</div>
				<div className="form-group">
					<label className="form-label">Descripcion:</label>
					<textarea 
						className="form-input" 
						placeholder="Descripcion"
						value={description}
						onChange={e => setDescription(e.currentTarget.value)}
					></textarea>
				</div>
				<div className="form-group">
					<label className="form-label">Moneda:</label>
					<SelectMoneda 
						className="form-input"
						value={coinId}
						onChange={value => setCoinId(value)}
					/>
				</div>
				<div className="form-group">
					<label className="form-label">Fecha de inicio:</label>
					<input 
						className="form-input" 
						type="date"
						value={firstDate}
						onChange={e => setFirstDate(e.currentTarget.value)}
					/>
				</div>
				<div className="form-group">
					<label className="form-label">Fecha de Fin:</label>
					<input 
						className="form-input" 
						type="date"
						value={endDate}
						onChange={e => setEndDate(e.currentTarget.value)}
					/>
				</div>
				<div className="form-group">
					<label className="form-label">Datos:</label>
					<DataDataset onChange={handleData} />
				</div>
				<div className="form-group">
					<label className="form-label">Datos a predecir:</label>
					<DataDataset onChange={handlePredictData} />
				</div>
				<div className="form-group">
					<label className="form-label">Datos de validacion:</label>
					<InputValidityData value={validityData} onChange={validityData => setValidityData(validityData)} />
				</div>

				<button className="btn-submit" type="submit">
					<FontAwesomeIcon icon={faPlus} />
					Crear Dataset
				</button>
			</form>
		</>
	)
}

export default Create