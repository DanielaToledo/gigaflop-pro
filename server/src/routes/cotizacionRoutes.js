import { Router } from 'express';
import {
  iniciarCotizacion,
  obtenerCotizacionesBorrador,
  finalizarCotizacion, verCotizacionCompleta
} from '../controllers/cotizacionController.js';

const router = Router();

router.post('/iniciar', iniciarCotizacion);
router.get('/borrador/:id_vendedor', obtenerCotizacionesBorrador);
router.put('/finalizar/:id', finalizarCotizacion);
router.get('/ver/:id', verCotizacionCompleta);


export default router;