// este archivo define el contexto de usuario para la aplicación React
import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => { //representa los componentes hijos que estarán envueltos por este contexto.
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      setUsuario(JSON.parse(storedUser));
      setCargando(false);
      return;
    }

    axios
      .get('/api/usuarios/profile', { withCredentials: true })
      .then(res => setUsuario(res.data.usuario))
      .catch(() => setUsuario(null))
      .finally(() => setCargando(false));
  }, []);

  return (
    <UserContext.Provider value={{ usuario, setUsuario, cargando }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);// permite acceder al contexto de usuario en cualquier componente hijo que lo consuma.