// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";

const PrivateRoute = ({ children, roles }) => {
  const { usuario, cargando } = useUser();

  if (cargando) {
    return <p>Cargando...</p>; // mientras se verifica el usuario
  }

  if (!usuario || !roles.includes(usuario.rol)) {
    // si no hay usuario o el rol no está permitido
    return <Navigate to="/menu" replace />;
  }

  return children;
};

export default PrivateRoute;