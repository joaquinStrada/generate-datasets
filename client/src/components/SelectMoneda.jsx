/* eslint-disable react/display-name */
/* eslint-disable react/react-in-jsx-scope */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'
import '../styles/selectMoneda.css'
import { useState, useEffect, forwardRef } from 'react'
import axios from 'axios'
import OptionMoneda from './OptionMoneda'

const SelectMoneda = forwardRef(({ valueSelect, onChangeSelect }, ref) => {
	const [ active, setActive ] = useState(false)
	const [ coins, setCoins ] = useState([])
	const [ selectCoin, setSelectCoin ] = useState(valueSelect)
	const [ search, setSearch ] = useState('')

	const getData = async () => {
		try {
			const res = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
				params: {
					vs_currency: 'usd',
					order: 'market_cap_desc',
					per_page: 100,
					page: 1,
					sparkline: false,
					locale: 'es'
				}
			})

			if (res.status === 200) {
				setCoins(res.data)
			}
		} catch (err) {
			console.error(err)
		}
	}

	useEffect(() => {
		getData()
	}, [])

	const clickOption = async (e, coinId) => {
		e.preventDefault()
		setSelectCoin(coinId)
		setActive(false)
		onChangeSelect(coinId)
	} 

	return (
		<div className="selectbox">
			<div className={`select ${active && 'active'}`} onClick={() => setActive(!active)}>
				<div className="content-select">
					{
						selectCoin ?
							<OptionMoneda coin={coins.find(coin => coin.id === selectCoin)} onClick={e => e.preventDefault()}/>
							:
							<h2 className="title">Seleccione una moneda</h2>
					}
				</div>
				<FontAwesomeIcon icon={faAngleDown} />
			</div>

			<div className="options">
				<div className="navbar-search">
					<input 
						type="text" 
						className="input-search" 
						placeholder="Buscar criptomoneda..."
						onChange={e => setSearch(e.currentTarget.value)}
					/>
				</div>
				{
					coins
						.filter(coin => coin.name.toLowerCase().includes(search.toLowerCase()))
						.map(coin => (
							<OptionMoneda key={coin.id} coin={coin} onClick={clickOption} />
						))
				}
			</div>

			<input
				type="hidden"
				ref={ref}
			/>
		</div>
	)
})

export default SelectMoneda