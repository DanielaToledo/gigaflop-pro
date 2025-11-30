// src/components/RutaProtegida.jsx
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

const RutaProtegida = ({ roles }) => {
  const [autenticado, setAutenticado] = useState(null);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    axios
      .get('/api/usuarios/checkAuth', { withCredentials: true })
      .then(res => {
        console.log("Respuesta completa de checkAuth:", res.data);
        console.log("Usuario recibido:", res.data.usuario);
        console.log("Rol recibido:", res.data.usuario?.rol);

        setAutenticado(true);
        setUsuario(res.data.usuario); // 👈 asegurate que aquí venga { rol: "administrador" }
      })
      .catch(() => setAutenticado(false));
  }, []);

  // Mientras no sabemos si está autenticado
  if (autenticado === null) {
    return <div className="spinner-container">Verificando sesión...</div>;
  }

  // Si no está autenticado
  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  // Si la ruta requiere roles específicos y aún no tenemos usuario cargado
  if (roles && !usuario) {
    return <div className="spinner-container">Verificando rol...</div>;
  }

  // Validar rol cuando ya está cargado
  if (roles && usuario?.rol && !roles.includes(usuario.rol)) {
    return <Navigate to="/menu" replace />;
  }

  // Si todo está bien, renderizamos la ruta protegida
  return <Outlet />;
};

export default RutaProtegida;