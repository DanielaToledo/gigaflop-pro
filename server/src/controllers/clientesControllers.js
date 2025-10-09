import pool from "../config/db.js";
import { crearCliente, listarClientes, listarCliente, actualizarCliente, eliminarCliente} from "../models/ClientesModels.js";

//controlador para crear cliente pasando razon_social y cuit
export const crearClienteController = async (req, res) => {
    const { razon_social, cuit  } = req.body;

    try {
        const insertId = await crearCliente({ razon_social, cuit});
        res.status(201).json({mensaje: "Cliente creado con exito!", id: insertId});
    } catch (error) {
        console.error('Error al crear cliente:', error);
        res.status(500).json({error: "No se pudo crear el cliente"});
    }
}
      

//controlador para listar a todos los clientes
export const listarClientesController  = async (req, res) => {
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
  const { razon_social } = req.query;

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
export const actualizarClienteController = async (req,res) => {
    const {cuit} = req.params;
    const {razon_social} = req.body;
    try{
        const filasAfectadas = await actualizarCliente(cuit, {razon_social});
        if (filasAfectadas === 0) {
            return res.status(404).json({error: "Cliente no encontrado o sin cambios", error});
        }
        res.status(200).json({mensaje: "Cliente actualizado con exito!"});
        
    }catch (error) {
        console.error ("Error al actualizar cliente:", error);
        res.status(500).json({error: "No se pudo actualizar el cliente"});
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