import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import {
  iniciarCotizacion,
  obtenerCotizacionesBorrador,
  finalizarCotizacion, verCotizacionCompleta, obtenerCotizacionBorradorPorId,
  actualizarCotizacionBorrador
} from '../controllers/cotizacionController.js';

const router = Router();

router.post('/iniciar', authRequired,iniciarCotizacion);
router.get('/borrador/:id_usuario', authRequired, obtenerCotizacionesBorrador);
router.get('/borrador/retomar/:id', authRequired, obtenerCotizacionBorradorPorId);
router.put('/finalizar/:id',authRequired, finalizarCotizacion);
router.get('/ver/:id', authRequired, verCotizacionCompleta);
router.put('/:id/actualizar', authRequired, actualizarCotizacionBorrador);


export default router;