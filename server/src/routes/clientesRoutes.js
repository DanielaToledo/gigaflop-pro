import { Router } from 'express';
import {crearClienteController} from '../controllers/clientesControllers.js';
import {listarClientesController} from '../controllers/clientesControllers.js';
import {listarClienteController} from '../controllers/clientesControllers.js';
import {actualizarClienteController} from '../controllers/clientesControllers.js';
import {eliminarClienteController} from '../controllers/clientesControllers.js';
import {buscarClientesPorTextoController} from '../controllers/clientesControllers.js';
import { getCondicionesComerciales } from '../controllers/clientesControllers.js';
import { getDiasPagoPorCliente } from '../controllers/clientesControllers.js';  


const router = Router();


//Ruta para crear cliente 
router.post('/',crearClienteController);

//Ruta para buscar clientes por texto en razon social o cuit
router.get('/buscar/:query', buscarClientesPorTextoController);

//Ruta para listar un solo cliente por razon social /cuit
router.get('/clientes/buscar/:razon_social', listarClienteController);

//Ruta para listar todos los clientes
router.get('/', listarClientesController);

//Ruta para actualizar un cliente por cuit
router.put('/:cuit', actualizarClienteController);

//Ruta para eliminar un cliente por cuit
router.delete('/:cuit', eliminarClienteController);

//ruta para obtener condiciones comerciales de un cliente por id
router.get('/:id/condiciones', getCondicionesComerciales);

//ruta para obtener dias de pago por cliente
router.get('/:id/dias-pago', getDiasPagoPorCliente);

export default router; 






