import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../CSS/menu.css';

const Sidebar = () => {
  const { usuario, setUsuario, cargando } = useUser(); // hook para acceder al contexto
  const navigate = useNavigate();

  if (cargando) return null;

  const handleLogout = async () => {
    try {
      await axios.post('/api/usuarios/logout', null, { withCredentials: true });
      setUsuario(null); // limpia el contexto
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // función para asignar color según rol
  const getRolColor = (rol) => {
    switch (rol) {
      case "administrador":
        return "bg-primary"; // azul
      case "gerente":
        return "bg-success"; // verde
      case "vendedor":
        return "bg-warning text-dark"; // amarillo
      default:
        return "bg-secondary"; // gris por defecto
    }
  };

  return (
    <div>
      <input type="checkbox" id="btn-menu" />
      <div className="container-menu">
        <div className="cont-menu">
          <nav className="text-center mb-3">
          <div className="usuario-sidebar">
  <h5 className="nombre-sidebar">
    {usuario?.nombre}
  </h5>
  <span className={`badge ${getRolColor(usuario?.rol)} rol-badge`}>
    {usuario?.rol}
  </span>
</div>
            <a href="#">Mi Perfil</a>
            <a href="#" onClick={handleLogout}>Cerrar Sesión</a>
          </nav>
          <label htmlFor="btn-menu">
            <i className="bi bi-x-lg"></i>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;