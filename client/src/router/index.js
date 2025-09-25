import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import Menu from "../pages/Menu";
import Clientes from "../pages/Clientes";
import RutaProtegida from '../components/RutaProtegida';
import Home from "../pages/Home";
import Productos from "../pages/Productos"; // asegurate de que la ruta sea correcta




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
      { path: '/productos',
        element: <Productos />
      },

    ],
  },
]);



// { basename: '/gigaflop-pp3-app-react' });
