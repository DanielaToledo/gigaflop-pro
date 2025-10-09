import { Router } from "express";
import {
  obtenerProductoPorPartNumber,
  obtenerProductosPorColumna, listarTodosLosProductos
} from '../controllers/productosControllers.js';

const router = Router();

// Buscar por part_number
router.get('/productos/buscar/part_number/:partNumber', obtenerProductoPorPartNumber);

// Buscar por cualquier columna válida
router.get('/productos/buscar/:columna/:valor', obtenerProductosPorColumna);

router.get('/productos', listarTodosLosProductos);

export default router;
