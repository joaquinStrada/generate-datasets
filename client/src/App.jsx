/* eslint-disable react/react-in-jsx-scope */
import { Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar'
import Index from './views/Index'
import Create from './views/Create'

const App = () => {
	return (
		<>
			<Navbar />
			<Routes>
				<Route path='/' element={<Index />} />
				<Route path='/create' element={<Create />} />
			</Routes>
		</>
	)
}

export default App