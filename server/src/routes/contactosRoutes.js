import { Router } from 'express';
import { obtenerContactosPorClienteController } from '../controllers/contactosControllers.js';

const router = Router();

router.get('/clientes/:id/contactos', obtenerContactosPorClienteController);

export default router;