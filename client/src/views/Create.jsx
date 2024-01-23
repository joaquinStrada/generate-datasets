/* eslint-disable react/react-in-jsx-scope */
import SelectMoneda from '../components/SelectMoneda'
import DataDataset from '../components/DataDataset'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import '../styles/create.css'
import InputValidityData from '../components/InputValidityData'

const Create = () => {
	return (
		<>
			<form className="app">
				<h2 className="title">Crear Dataset</h2>
				<div className="form-group">
					<label className="form-label">Nombre:</label>
					<input className="form-input" type="text" placeholder="Nombre"/>
				</div>
				<div className="form-group">
					<label className="form-label">Descripcion:</label>
					<textarea className="form-input" placeholder="Descripcion"></textarea>
				</div>
				<div className="form-group">
					<label className="form-label">Moneda:</label>
					<SelectMoneda className="form-input" />
				</div>
				<div className="form-group">
					<label className="form-label">Fecha de inicio:</label>
					<input className="form-input" type="date" />
				</div>
				<div className="form-group">
					<label className="form-label">Fecha de Fin:</label>
					<input className="form-input" type="date" />
				</div>
				<div className="form-group">
					<label className="form-label">Datos:</label>
					<DataDataset />
				</div>
				<div className="form-group">
					<label className="form-label">Datos a predecir:</label>
					<DataDataset />
				</div>
				<div className="form-group">
					<label className="form-label">Datos de validacion:</label>
					<InputValidityData />
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