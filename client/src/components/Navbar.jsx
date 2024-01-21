import { NavLink } from 'react-router-dom'

const Navbar = () => {
    return (
        <div>
            <h1>Generar Datasets</h1>
            <NavLink to='/'>Inicio</NavLink>
            <NavLink to='/create'>Crear</NavLink>
        </div>
    )
}

export default Navbar