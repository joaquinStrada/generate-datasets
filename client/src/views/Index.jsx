/* eslint-disable react/react-in-jsx-scope */
import { useState, useEffect } from 'react'
import Card from '../components/Card'
import { Api } from '../utils/Api'
import axios from 'axios'

import io from 'socket.io-client'
import { config } from '../utils/config'

import '../styles/home.css'

const socket = io(config.api.host)

const Index = () => {
	const [ data, setData ] = useState([])
	const [ coins, setCoins ] = useState([])

	const getCoins = async (ids) => {
		try {
			const res = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
				params: {
					vs_currency: 'usd',
					order: 'market_cap_desc',
					ids,
					per_page: 100,
					page: 1,
					sparkline: false,
					locale: 'ar'
				}
			})

			if (res.status === 200) {
				setCoins(res.data)
			}
		} catch (err) {
			console.error(err)
		}
	}

	const getIds = datasets => {
		const ids = datasets.map(dataset => String(dataset.coinId).trim())
		return ids.join(',')
	}

	const getData = async () => {
		try {
			const { data: res } = await Api.get('/')

			if (!res.error) {
				setData(res.data)
				getCoins(getIds(res.data))
			}
		} catch (err) {
			console.error(err)
		}
	}

	const createdDataset = dataset => {
		const datasets = [...data, dataset]
		getCoins(getIds(datasets))
		setData(datasets)
	}

	const deletedDataset = ({ datasetId }) => console.log(data)

	useEffect(() => {
		getData()

		// Escuchamos los mensajes del socket
		socket.on('created-dataset', createdDataset)
		socket.on('delete-dataset', deletedDataset)

		// Apagamos los mensajes del socket
		return () => {
			socket.off('created-dataset')
			socket.off('delete-dataset')
		}
	}, [])

	return (
		<div className="container">
			{
				coins.length > 0 && data.map(dataset => (
					<Card 
						dataset={dataset}
						coin={coins.find(coin => coin.id === dataset.coinId)} 
						key={dataset.id}
					/>
				))
			}
		</div>
	)
}

export default Index