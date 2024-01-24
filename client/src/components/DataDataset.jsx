/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
import '../styles/dataDataset.css'
import { useId } from 'react'

const DataDataset = (props) => {
	const properties = ['current_price', 'market_cap', 'total_volume', 'price_change_24h', 'price_change_percentage_24h', 'market_cap_change_24h', 'market_cap_change_percentage_24h']
	const idElement = useId()

	return (
		<table className='data-dataset'>
			<thead>
				<tr>
					<td>Id</td>
					<td>Propiedad</td>
					<td>Incluir</td>
				</tr>
			</thead>
			<tbody>
				{ properties.map((property, index) => (
					<tr key={index}>
						<td>{index + 1}</td>
						<td>{property}</td>
						<td>
							<input 
								type="checkbox" 
								className="check-property" 
								id={`check-property-${idElement}-${index}`}
								onChange={e => props.onChange(property, e.currentTarget.checked)}
							/>
							<label className="label-poperty" htmlFor={`check-property-${idElement}-${index}`}></label>
						</td>
					</tr>
				)) }
			</tbody>
		</table>
	)
}

export default DataDataset