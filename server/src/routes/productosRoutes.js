import { Router } from "express";
import * as productosController from '../controllers/productosControllers.js';

const router = Router();

// Buscar por part_number
router.get('/productos/buscar/part_number/:partNumber', productosController.obtenerProductoPorPartNumber);

// Buscar por cualquier columna válida
router.get('/productos/buscar/:columna/:valor', productosController.obtenerProductosPorColumna);

// Listar todos los productos
router.get('/productos', productosController.listarTodosLosProductos);

//buscar por texto libre
router.get('/productos/buscar/:valor', productosController.buscarProductos);

// Sincronizar productos desde API externa
router.get('/sincronizar', productosController.sincronizarProductos);

export default router;