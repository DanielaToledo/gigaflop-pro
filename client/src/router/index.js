
import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import Menu from "../pages/Menu";
import Clientes from "../pages/Clientes";
import RutaProtegida from '../components/RutaProtegida';
import Home from "../pages/Home";
import Productos from "../pages/Productos"; 
import NuevaCotizacion from "../pages/NuevaCotizacion";
import ResumenCotizacion from "../pages/ResumenCotizacion";
import Configuracion from "../pages/Configuracion";
import Dashboard from "../pages/Dashboard";
import '../CSS/menu.css';
import 'bootstrap-icons/font/bootstrap-icons.css';





export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    element: <RutaProtegida />, // rutas protegidas para cualquier usuario logueado
    children: [
      { path: '/menu', element: <Menu /> },
      { path: '/clientes', element: <Clientes /> },
      { path: '/productos', element: <Productos /> },
      { path: '/nuevacotizacion', element: <NuevaCotizacion /> },
      { path: '/nuevacotizacion/:idCotizacion', element: <NuevaCotizacion /> },
      { path: '/resumen-cotizacion', element: <ResumenCotizacion /> }
    ],
  },
  {
    element: <RutaProtegida roles={["administrador"]} />, // 👈 solo admin
    children: [
      { path: '/configuracion', element: <Configuracion /> }
    ],
  },
  {
    element: <RutaProtegida roles={["administrador", "gerente"]} />, // 👈 solo admin/gerente
    children: [
      { path: '/dashboard', element: <Dashboard /> }
    ],
  }
]);

// { basename: '/gigaflop-pp3-app-react' });