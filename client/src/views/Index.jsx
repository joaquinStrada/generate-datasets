/* eslint-disable react/react-in-jsx-scope */
import { useState, useEffect } from 'react'
import Card from '../components/Card'
import { Api } from '../utils/Api'

import '../styles/home.css'

const Index = () => {
	const [ data, setData ] = useState([])

	const getData = async () => {
		try {
			const { data: res } = await Api.get('/')

			if (!res.error) {
				setData(res.data)
			}
		} catch (err) {
			console.error(err)
		}
	}

	useEffect(() => {
		getData()
	}, [])

	return (
		<div className="container">
			{
				data.map(dataset => (
					<Card dataset={dataset} key={dataset.id} />
				))
			}
		</div>
	)
}

export default Index