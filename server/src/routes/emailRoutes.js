import express from 'express';
import { enviarCotizacion } from '../controllers/emailControllers.js';

const router = express.Router();

router.post('/email/enviar', enviarCotizacion);

export default router;