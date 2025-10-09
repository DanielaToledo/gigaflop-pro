import {
  buscarProductoPorPartNumber,
  buscarProductosPorColumna,
  obtenerTodosLosProductos
} from '../models/ProductosModels.js';

// Buscar por part_number
export const obtenerProductoPorPartNumber = async (req, res) => {
  try {
    const { partNumber } = req.params;
    const producto = await buscarProductoPorPartNumber(partNumber);

    if (producto) {
      res.status(200).json(producto);
    } else {
      res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
  } catch (error) {
    console.error('Error al buscar producto:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

// Buscar por cualquier columna válida
export const obtenerProductosPorColumna = async (req, res) => {
  try {
    const { columna, valor } = req.params;
    const productos = await buscarProductosPorColumna(columna, valor);

    if (productos.length > 0) {
      res.status(200).json(productos);
    } else {
      res.status(404).json({ mensaje: 'No se encontraron productos' });
    }
  } catch (error) {
    console.error('Error al buscar productos:', error.message);
    res.status(400).json({ mensaje: error.message });
  }
};

// Controlador para listar todos los productos
export const listarTodosLosProductos = async (req, res) => {
  try {
    const productos = await obtenerTodosLosProductos();
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener los productos:', error.message);
    res.status(500).json({ mensaje: 'Error al obtener los productos' });
  }
};
