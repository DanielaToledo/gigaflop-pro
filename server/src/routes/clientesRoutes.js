import { Router } from 'express';
import {crearClienteController} from '../controllers/clientesControllers.js';
import {listarClientesController} from '../controllers/clientesControllers.js';
import {listarClienteController} from '../controllers/clientesControllers.js';
import {actualizarClienteController} from '../controllers/clientesControllers.js';
import {eliminarClienteController} from '../controllers/clientesControllers.js';
import {buscarClientesPorTextoController} from '../controllers/clientesControllers.js';
import { getCondicionesComerciales } from '../controllers/clientesControllers.js';
import { getDiasPagoPorCliente } from '../controllers/clientesControllers.js';  
import { traerDireccionesCliente } from '../controllers/clientesControllers.js';
import { obtenerCostoEnvioPorDireccion } from '../controllers/clientesControllers.js';
import { listarZonasConCostoController } from '../controllers/clientesControllers.js';
import { crearClienteCompletoController } from '../controllers/clientesControllers.js';
import { obtenerClienteCompletoPorCuit } from '../controllers/clientesControllers.js';
import { actualizarDireccionesCliente } from '../controllers/clientesControllers.js';




const router = Router();


//Ruta para crear cliente con cuit y razon social
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

//modelo para obtener direcciones de un cliente con su zona
router.get('/:id/direcciones', traerDireccionesCliente);

//ruta para obtener direcciones de un cliente con su zona
router.get('/envios/costo', obtenerCostoEnvioPorDireccion);

//ruta para obtener todas las zonas con su costo
router.get('/envios/zonas', listarZonasConCostoController);

//controlador para crear un cliente completo con todos sus datos (razon_social, cuit, email, direcciones y contactos)
router.post('/completo', crearClienteCompletoController);


//controlador para obtener un cliente completo por su cuit
router.get('/completo/:cuit', obtenerClienteCompletoPorCuit);

//controlador para actualizar las direcciones de un cliente por su cuit
router.put('/direcciones/:cuit', actualizarDireccionesCliente);

export default router; 