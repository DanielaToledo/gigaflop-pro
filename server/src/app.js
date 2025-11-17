import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import usuariosRoutes from './routes/usuariosRoutes.js';
import menuRoutes from "./routes/menuRoutes.js";
import clientesRoutes from "./routes/clientesRoutes.js";
import productosRoutes from './routes/productosRoutes.js'; // Importa las rutas de productos
import cotizacionRoutes from './routes/cotizacionRoutes.js';
import contactosRoutes from './routes/contactosRoutes.js';

import estadosRoutes from './routes/estadosRoutes.js';


const app = express();

app.use(cors({
    origin: 'http://localhost:3000', // Cambia si tu frontend está en otra URL
    credentials: true
}));

//esto es para que el servidor pueda recibir cookies
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use('/images', express.static('public/images'));

app.use("/api/usuarios", usuariosRoutes);
app.use("/api", menuRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api", productosRoutes); // Usa las rutas de productos
app.use("/api/cotizaciones", cotizacionRoutes);
app.use("/api", contactosRoutes);
app.use('/api/estados', estadosRoutes);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(' Error no capturado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});
export default app;