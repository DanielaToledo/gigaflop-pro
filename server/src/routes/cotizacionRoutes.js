import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import {
  iniciarCotizacion,
  obtenerCotizacionesBorrador,
  finalizarCotizacion, verCotizacionCompleta, obtenerCotizacionBorradorPorId,
  actualizarCotizacionBorrador, marcarCotizacionComoPendiente,
  actualizarEstado, obtenerTodasLasCotizaciones
} from '../controllers/cotizacionController.js';
import * as cotizacionController from '../controllers/cotizacionController.js';

const router = Router();

router.post('/iniciar', authRequired,iniciarCotizacion); //crea cotización con cliente y productos completos.
router.get('/todas/:id_usuario', obtenerTodasLasCotizaciones);  
router.get('/borrador/:id_usuario', authRequired, obtenerCotizacionesBorrador);
router.get('/borrador/retomar/:id', authRequired, obtenerCotizacionBorradorPorId); // retoma cotización desde backend
router.put('/finalizar/:id',authRequired, finalizarCotizacion); //finaliza usando el estado local (clienteObjeto, carrito) que está completo.
router.get('/ver/:id', authRequired, verCotizacionCompleta);// usamos en el modal para ver resumen de cotiz.
router.put('/:id/actualizar', authRequired, actualizarCotizacionBorrador); // actualiza usando el mismo estado local.
router.put('/estado/pendiente/:id', marcarCotizacionComoPendiente);
router.put('/estado/:id', actualizarEstado);
router.post('/alerta-vencimiento/:id', cotizacionController.enviarAlertaVencimiento);



export default router;