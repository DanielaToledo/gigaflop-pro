import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

const RutaProtegida = () => {
  const [autenticado, setAutenticado] = useState(null);

  useEffect(() => {
    axios
      .get('/api/usuarios/checkAuth', { withCredentials: true })
      .then(() => setAutenticado(true))
      .catch(() => setAutenticado(false));
  }, []);

  if (autenticado === null) {
  return <div className="spinner-container">Verificando sesión...</div>;
}

  return autenticado ? <Outlet /> : <Navigate to="/" />;
};

export default RutaProtegida;