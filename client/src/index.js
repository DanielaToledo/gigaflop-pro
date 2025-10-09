import React from 'react';
import ReactDOM from 'react-dom/client';
import {router} from './router/index.js';
import { RouterProvider } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { UserProvider } from './context/UserContext.jsx'; // Asegúrate de que el contexto esté correctamente definido y exportado
// Asegurate de exportarlo desde donde definís tus rutas

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  </React.StrictMode>
);





