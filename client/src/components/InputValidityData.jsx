/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
/* eslint-disable react/react-in-jsx-scope */
import { useState, forwardRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons'
import '../styles/InputValidityData.css'

const InputValidityData = forwardRef(({ valueData, onChangeData }, ref) => {
	const [ validityData, setValidityData ] = useState(parseValidityData(valueData))

	const decrease = () => {
		if (validityData > 0) {
			setValidityData(validityData - 1)
			onChangeData(validityData - 1)
		}
	}

	const increase = () => {
		if (validityData < 100) {
			setValidityData(validityData + 1)
			onChangeData(validityData + 1)
		}
	}

	return (
		<div className="content-input">
			<button 
				type="button" 
				className="btn btn-minus"
				onClick={decrease}
			>
				<FontAwesomeIcon icon={faMinus} />
			</button>
			<input 
				className="input-validity" 
				readOnly
				ref={ref}
			/>
			<button 
				type="button" 
				className="btn btn-plus"
				onClick={increase}
			>
				<FontAwesomeIcon icon={faPlus} />
			</button>
		</div>
	)
})

export const parseValidityData = data => parseInt(String(data).replace('%', ''))

export default InputValidityData