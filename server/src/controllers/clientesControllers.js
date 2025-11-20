import pool from "../config/db.js";
import { crearCliente, listarClientesPorTexto, listarClientes, listarCliente, actualizarCliente, eliminarCliente } from "../models/ClientesModels.js";
import { obtenerCondicionesComerciales } from '../models/ClientesModels.js';
import { obtenerDiasPagoPorCliente } from '../models/ClientesModels.js';
import { obtenerDireccionesConZona } from '../models/ClientesModels.js';
import { obtenerZonaPorDireccion, obtenerCostoEnvioPorZona } from '../models/ClientesModels.js';
import { listarZonasConCosto, obtenerClientePorId } from '../models/ClientesModels.js';
import {
  existeClienteCompletoPorCuit,
  crearClienteCompleto,
  eliminarDireccionesPorCliente,
  insertarDireccionClienteCompleto,
  insertarContactoClienteCompleto, insertarCondicionComercialClienteCompleto
} from '../models/ClientesModels.js';




//controlador para crear cliente pasando razon_social y cuit
export const crearClienteController = async (req, res) => {
  const { razon_social, cuit } = req.body;

  try {
    const insertId = await crearCliente({ razon_social, cuit });
    res.status(201).json({ mensaje: "Cliente creado con exito!", id: insertId });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ error: "No se pudo crear el cliente" });
  }
}









//controlador para buscar clientes por texto en razon_social o cuit
export const buscarClientesPorTextoController = async (req, res) => {
  const { query } = req.params;

  if (!query || query.trim().length < 2) {
    return res.status(400).json({ error: 'Consulta demasiado corta' });
  }

  try {
    const clientes = await listarClientesPorTexto(query);
    res.status(200).json(clientes);
  } catch (error) {
    console.error('Error al buscar clientes por texto:', error);
    res.status(500).json({ error: 'No se pudo realizar la búsqueda' });
  }
};




//controlador para listar a todos los clientes
export const listarClientesController = async (req, res) => {
  try {
    const clientes = await listarClientes();
    res.status(200).json(clientes);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ mensaje: "Error al obtener clientes" });
  }
};

//contolador para listar un cliente por razon social
export const listarClienteController = async (req, res) => {
  const { razon_social } = req.params;

  try {
    const clientes = await listarCliente({ razon_social });
    if (!clientes.length) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.status(200).json(clientes);
  } catch (error) {
    console.error('Error en búsqueda por razón social:', error);
    res.status(500).json({ error: 'Error al buscar cliente' });
  }
};

export const obtenerClientePorIdController = async (req, res) => {
  const { id } = req.params;

  try {
    const cliente = await obtenerClientePorId(id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(cliente);
  } catch (error) {
    console.error('Error al obtener cliente por ID:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};





// controlador para ACTUALIZAR un cliente por razon social o cuit o id 
//export const listarClienteController = async (req, res) => {
//const { id = '', razon_social = '', cuit = '' } = req.query;

//try {
//const cliente = await listarCliente({ id, razon_social, cuit });

//if (!cliente) {
//  return res.status(404).json({ error: 'Cliente no encontrado' });
//}

//res.status(200).json(cliente);
//} catch (error) {
//console.error('Error al buscar cliente:', error);
//res.status(500).json({ error: 'Error en la búsqueda del cliente' });
// }
//};


//controlador para actualizar un cliente por cuit lo buscamos por cuit y modificamos su razon_social   
export const actualizarClienteController = async (req, res) => {
  const { cuit } = req.params;
  const { razon_social } = req.body;
  try {
    const filasAfectadas = await actualizarCliente(cuit, { razon_social });
    if (filasAfectadas === 0) {
      return res.status(404).json({ error: "Cliente no encontrado o sin cambios", error });
    }
    res.status(200).json({ mensaje: "Cliente actualizado con exito!" });

  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    res.status(500).json({ error: "No se pudo actualizar el cliente" });
  }
};

//controlador para eliminar un cliente por cuit es decir lo buscamos por cuit
export const eliminarClienteController = async (req, res) => {
  const { cuit } = req.params;
  try {
    const filasAfectadas = await eliminarCliente(cuit);
    if (filasAfectadas === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.status(200).json({ mensaje: "Cliente eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    res.status(500).json({ error: "No se pudo eliminar el cliente" });
  }
};


//controlador para obtener condiciones comerciales de un cliente por su id
// controlador para obtener condiciones comerciales de un cliente por su id
// server/src/controllers/clientesController.js

export const getCondicionesComerciales = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'ID de cliente inválido' });
  }

  try {
    const condiciones = await obtenerCondicionesComerciales(id);

    // responder siempre 200 con array (vacío si no hay condiciones)
    return res.status(200).json(Array.isArray(condiciones) ? condiciones : []);
  } catch (error) {
    console.error('Error al obtener condiciones comerciales:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getDiasPagoPorCliente = async (req, res) => {
  const { id } = req.params;
  try {
    const dias = await obtenerDiasPagoPorCliente(id);
    res.json(dias);
  } catch (err) {
    console.error('Error al obtener días de pago por cliente:', err.message);
    res.status(500).json({ msg: 'Error interno del servidor' });
  }
};

//controlador para obtener direccion de un cliente por su id
export const traerDireccionesCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const direcciones = await obtenerDireccionesConZona(id);

    res.json(direcciones);
  } catch (error) {
    console.error('Error al obtener direcciones:', error.message);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};



export const obtenerCostoEnvioPorDireccion = async (req, res) => {
  try {
    const { id_direccion } = req.query;

    if (!id_direccion) {
      return res.status(400).json({ mensaje: 'Falta el parámetro id_direccion' });
    }

    const zona_envio = await obtenerZonaPorDireccion(id_direccion);

    if (!zona_envio) {
      return res.status(404).json({ mensaje: 'Dirección no encontrada o sin zona asignada' });
    }

    const costo = await obtenerCostoEnvioPorZona(zona_envio);

    if (costo === null) {
      return res.status(404).json({ mensaje: 'Zona no encontrada en tabla de costos' });
    }

    res.json({ zona_envio, costo });
  } catch (error) {
    console.error('Error al calcular costo de envío:', error.message);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};



//controlador para listar todas las zonas con su costo
export const listarZonasConCostoController = async (req, res) => {
  try {
    const zonas = await listarZonasConCosto();
    res.json(zonas);
  } catch (error) {
    console.error('Error al listar zonas de envío:', error.message);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};



//funcion para crear un cliente completo con todos sus datos (razon_social, cuit, email, direcciones  contactos y condiciones com)
// lo usamos en el componente Register.jsx para registrar un cliente 
export const crearClienteCompletoController = async (req, res) => {
  const { razon_social, cuit, direcciones, contactos, condiciones_comerciales } = req.body;

  try {
    if (await existeClienteCompletoPorCuit(cuit)) {
      return res.status(409).json({ error: 'El CUIT ya está registrado' });
    }

    const id_cliente = await crearClienteCompleto({ razon_social, cuit });

    for (const dir of direcciones) {
      await insertarDireccionClienteCompleto(id_cliente, dir);
    }

    for (const c of contactos) {
      await insertarContactoClienteCompleto(id_cliente, c);
    }

  for (const cond of condiciones_comerciales) {
  await insertarCondicionComercialClienteCompleto(id_cliente, cond); // ✅ nombre correcto
}

    res.status(201).json({ mensaje: 'Cliente completo creado con éxito', id_cliente });
  } catch (error) {
    console.error('Error al crear cliente completo:', error);
    res.status(500).json({ error: 'No se pudo crear el cliente completo' });
  }
};





//controlador para obtener un cliente completo por su cuit incluyendo sus direcciones con zona
//lo usamos para editar un cliente completo
export const obtenerClienteCompletoPorCuit = async (req, res) => {
  const { cuit } = req.params;

  try {
    const [clienteRows] = await pool.query('SELECT * FROM cliente WHERE cuit = ?', [cuit]);

    if (!clienteRows.length) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const cliente = clienteRows[0];
    const direcciones = await obtenerDireccionesConZona(cliente.id);

    res.status(200).json({
      ...cliente,
      direcciones
    });
  } catch (error) {
    console.error('Error al obtener cliente completo:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};



//controlador para actualizar las direcciones de un cliente completo por su cuit
export const actualizarDireccionesCliente = async (req, res) => {
  const { cuit } = req.params;
  const { direcciones } = req.body;

  try {
    const [clienteRows] = await pool.query('SELECT id FROM cliente WHERE cuit = ?', [cuit]);

    if (!clienteRows.length) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const id_cliente = clienteRows[0].id;

    await eliminarDireccionesPorCliente(id_cliente);

    for (const dir of direcciones) {
      await insertarDireccionClienteCompleto(id_cliente, dir);
    }

    res.status(200).json({ mensaje: 'Direcciones actualizadas con éxito' });
  } catch (error) {
    console.error('Error al actualizar direcciones:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};