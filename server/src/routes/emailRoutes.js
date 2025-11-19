import express from 'express';
import { enviarCotizacion } from '../controllers/emailControllers.js';
import { enviarEmailConAdjunto } from '../controllers/emailControllers.js';
import multer from 'multer';



const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });



// Para enviar solo HTML sin adjunto
router.post('/email/enviar', enviarCotizacion);

// Para enviar HTML + PDF adjunto
router.post('/email/enviar-con-adjunto', upload.single('archivoPDF'), enviarEmailConAdjunto);



export default router;