/* eslint-disable react/react-in-jsx-scope */
import { NavLink } from 'react-router-dom'
import '../styles/navbar.css'

const Navbar = () => {
	return (
		<header>
			<h1 className="navbar-title">Generar Dataset</h1>
			<nav>
				<ul>
					<li><NavLink to="/">Inicio</NavLink></li>
					<li><NavLink to="/create">Crear</NavLink></li>
				</ul>
			</nav>
		</header>
	)
}

export default Navbar