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
    element: <RutaProtegida />, // rutas protegidas
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />
      },
      {
        path: '/menu',
        element: <Menu />,
      },
      {
        path: '/clientes',
        element: <Clientes />,
      },
      {
        path: '/productos',
        element: <Productos />
      },
      {
        path: '/nuevacotizacion',
        element: <NuevaCotizacion />
      },
      {
        path: '/nuevacotizacion/:idCotizacion',
        element: <NuevaCotizacion />
      },
      {
        path: '/resumen-cotizacion',
        element: <ResumenCotizacion />
      },
      {
        path: '/configuracion',
        element: <Configuracion />
      }
      


    ],
  },
]);



// { basename: '/gigaflop-pp3-app-react' });
