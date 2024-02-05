/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { getDate } from '../utils/getDateTime'
import { config } from '../utils/config'
import axios from 'axios'
import '../styles/card.css'

const Card = ({ dataset }) => {
	const [ coin, setCoin ] = useState({})
	const [ status, setStatus ] = useState(dataset.status)
	const [ percentage, setPercentage ] = useState(0)
	const [ time, setTime ] = useState(0)

	const getCoin = async () => {
		try {
			const res = await axios.get(`https://api.coingecko.com/api/v3/coins/${dataset.coinId}`, {
				params: {
					localization: false,
					tickers: false,
					market_data: true,
					community_data: false,
					developer_data: false,
					sparkline: false
				}
			})

			if (res.status === 200) {
				setCoin(res.data)
			}
		} catch (err) {
			console.error(err)
		}
	}

	useEffect(() => {
		getCoin()
	}, [])

	const handleDelete = (e) => {
		console.log('eliminando dataset')
	}

	return (
		<div className={`card ${dataset.status === 'generated' ? 'generated' : ''}`}>
			<div className="info">
				<img className="img-card" src={coin?.image?.large} />
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
							<p className="value">${Math.floor(coin?.market_data?.current_price?.usd * 1000) / 1000}</p>
						</div>
						<div className="caracteristic-currency">
							<p className="title">Price Change</p>
							<p className={`value ${coin?.market_data?.price_change_24h > 0 ? 'green' : 'red'}`}>{Math.floor(coin?.market_data?.price_change_24h * 1000) / 1000}</p>
						</div>
						<div className="caracteristic-currency">
							<p className="title">Volume</p>
							<p className="value">${Math.floor(coin?.market_data?.total_volume?.usd * 1000) / 1000}</p>
						</div>
					</div>
				</div>
				{
					dataset.status === 'generated' && (
						<div className="info-controls">
							<NavLink className="btn btn-update" to={`/${dataset.id}`}>Actualizar</NavLink>
							<NavLink 
								className="btn btn-delete" 
								to="/"
								data-id={dataset.id}
								onClick={handleDelete}
							>Eliminar</NavLink>
							<a
								href={config.api.host + dataset.dataset} 
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
					<p className="status-text">Time: {time}</p>
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