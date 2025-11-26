

// este archivo define el contexto de usuario para la aplicación React
import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
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
      .then(res => {
        const usuarioData = res.data.usuario;

        // 👇 guardamos todos los datos relevantes, incluido el rol
        const userObj = {
          id: usuarioData.id,
          usuario: usuarioData.usuario,
          email: usuarioData.email,
          nombre: usuarioData.nombre,
          apellido: usuarioData.apellido,
          rol: usuarioData.rol,       // ✅ clave para bloquear módulos
          estado: usuarioData.estado
        };

        setUsuario(userObj);
        localStorage.setItem('usuario', JSON.stringify(userObj));
      })
      .catch(() => setUsuario(null))
      .finally(() => setCargando(false));
  }, []);

  return (
    <UserContext.Provider value={{ usuario, setUsuario, cargando }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);





// permite acceder al contexto de usuario en cualquier componente hijo que lo consuma.