/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { getDate, getTime } from '../utils/getDateTime'
import { config } from '../utils/config'
import io from 'socket.io-client'
import { Api } from '../utils/Api'
import '../styles/card.css'

const socket = io(config.api.host)

const Card = ({ dataset, coin }) => {
	const [ status, setStatus ] = useState(dataset.status)
	const [ percentage, setPercentage ] = useState(0)
	const [ pathDataset, setPathDataset ] = useState(dataset.dataset)
	const [ time, setTime ] = useState(0)

	if (!coin) console.error(new Error('Moneda no encontrada!!!'))

	// Escuchamos los mensajes del socket
	const onDataset = data => {
		if (data.datasetId !== dataset.id) return
		
		if (data.status === 'error') {
			setStatus(data.message)

			// Reseteamos los valores
			setPercentage(0)
			setTime(0)
		} else if (data.status === 'generated') {
			setStatus(data.status)
			setPercentage(data.percentage)
			setTime(data.waitTime)
			setPathDataset(data.pathDataset)
		} else {
			setStatus(data.status)
			setPercentage(data.percentage)
			setTime(data.waitTime)
		}
	}

	useEffect(() => {
		socket.on('dataset', onDataset)

		return () => socket.off('dataset')
	}, [])

	const handleDelete = async () => {
		try {
			const res = await Api.delete('/' + dataset.id)

			if (!res.data.error) {
				toastr.success(res.data.message, 'Dataset eliminado')
			}
		} catch (err) {
			if (err.response?.data?.error) {
				toastr.error(err.response.data.message, 'Error')
			}
		}
	}


	return (
		<div className={`card ${status === 'generated' ? 'generated' : ''}`}>
			<div className="info">
				<img className="img-card" src={coin?.image} alt={coin?.name} />
				<div className="info-texts">
					<h2 className="card-title">
						{dataset.name}
						<span className="card-createdAt">({dataset.createdAt})</span>
					</h2>
					<p className="card-description">{dataset.description}</p>
					<div className="info-dataset">
						<div className="caracteristic-dataset">
							<p className="title">Fecha de inicio</p>
							<p className="value">{getDate(dataset.firstDate)}</p>
						</div>
						<div className="caracteristic-dataset">
							<p className="title">Fecha de fin</p>
							<p className="value">{getDate(dataset.endDate)}</p>
						</div>
						<div className="caracteristic-dataset">
							<p className="title">Datos de validacion</p>
							<p className="value">{dataset.validityData}%</p>
						</div>
					</div>
					<div className="info-currency">
						<div className="caracteristic-currency">
							<p className="title">Price</p>
							<p className="value">${Math.floor(coin?.current_price * 1000) / 1000}</p>
						</div>
						<div className="caracteristic-currency">
							<p className="title">Price Change</p>
							<p className={`value ${coin?.price_change_24h > 0 ? 'green' : 'red'}`}>{Math.floor(coin?.price_change_24h * 1000) / 1000}</p>
						</div>
						<div className="caracteristic-currency">
							<p className="title">Volume</p>
							<p className="value">${Math.floor(coin?.total_volume * 1000) / 1000}</p>
						</div>
					</div>
				</div>
				{
					status == 'generated' && (
						<div className="info-controls">
							<NavLink className="btn btn-update" to={`/${dataset.id}`}>Actualizar</NavLink>
							<NavLink 
								className="btn btn-delete" 
								to="/"
								onClick={handleDelete}
							>Eliminar</NavLink>
							<a
								href={config.api.host + pathDataset} 
								className="btn btn-download"
								download={`${dataset.name}.json`}
							>Descargar Json</a>
							<a
								href={`${config.api.host}/api/v1/datasets/${dataset.id}/excel`} 
								className="btn btn-download"
								download={`${dataset.name}.xlsx`}
							>Descargar Excel</a>
						</div>
					)
				}
			</div>
			<div className="status">
				<div className="status-info">
					<p className="status-text">Status: {status}</p>
					<p className="status-text">Percentage: {Math.floor(percentage * 1000) / 1000}%</p>
					<p className="status-text">Time: {getTime(time)}</p>
				</div>

				<div className="progress">
					<div className="progress-bar" style={{
						width: `${percentage}%`
					}}></div>
				</div>
			</div>
		</div>
	)
}

export default Card