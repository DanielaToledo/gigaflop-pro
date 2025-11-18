// routes/estadoRoutes.js
import express from 'express';
import {
  listarEstados,
  obtenerEstado,
  crearEstado,
  actualizarEstado,
  eliminarEstado
} from '../controllers/estadosControllers.js';

const router = express.Router();

router.get('/', listarEstados);
router.get('/:id', obtenerEstado);
router.post('/', crearEstado);      
router.put('/:id', actualizarEstado);
router.delete('/:id', eliminarEstado);

export default router;