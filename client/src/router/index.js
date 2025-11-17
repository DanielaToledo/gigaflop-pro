import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import Menu from "../pages/Menu";
import Clientes from "../pages/Clientes";
import RutaProtegida from '../components/RutaProtegida';
import Home from "../pages/Home";
import Productos from "../pages/Productos"; // asegurate de que la ruta sea correcta
import NuevaCotizacion from "../pages/NuevaCotizacion";
import ResumenCotizacion from "../pages/ResumenCotizacion";



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
      }


    ],
  },
]);



// { basename: '/gigaflop-pp3-app-react' });
