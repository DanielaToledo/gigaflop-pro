import fetch from 'node-fetch';
import {
  buscarProductoPorPartNumber,
  buscarProductosPorColumna,
  obtenerTodosLosProductos,
  obtenerProductosDesdeRemoto,
  guardarProductoSincronizado,
  obtenerFechaLocalDeProducto, buscarProductosPorTextoLibre
} from '../models/ProductosModels.js';
import { obtenerProductosConImagen } from '../models/ProductosModels.js';


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
      res.status(200).json({
        productos,
        total: productos.length
      });
    } else {
      res.status(404).json({
        productos: [],
        total: 0,
        mensaje: 'No se encontraron productos'
      });
    }
  } catch (error) {
    console.error('Error al buscar productos:', error.message);
    res.status(400).json({
      productos: [],
      total: 0,
      mensaje: error.message
    });
  }
};


// Listar todos los productos
export const listarTodosLosProductos = async (req, res) => {
  try {
    const productos = await obtenerTodosLosProductos();

    res.json({
      productos,
      total: productos.length
    });
  } catch (error) {
    console.error('Error al obtener los productos:', error.message);
    res.status(500).json({ mensaje: 'Error al obtener los productos' });
  }
};

// Buscar productos por texto libre
export const buscarProductos = async (req, res) => {
  try {
    const { valor } = req.params;
    const productos = await buscarProductosPorTextoLibre(valor);
    console.log('Valor recibido en búsqueda:', req.params.valor);

    res.json({ productos, total: productos.length });
  } catch (error) {
    console.error('Error en búsqueda:', error.message);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

// Sincronizar productos desde base remota con lógica inteligente
export const sincronizarProductos = async (req, res) => {
  try {
    const productosExternos = await obtenerProductosDesdeRemoto();

    let nuevos = 0;
    let actualizados = 0;
    let ignorados = 0;

    for (const producto of productosExternos) {  // Itera sobre cada producto externo
      // Verifica si el producto ya existe y compara fechas
      const fechaLocal = await obtenerFechaLocalDeProducto(producto.part_number);
      const fechaRemota = new Date(producto.ultima_actualizacion);

      if (!fechaLocal || fechaRemota > new Date(fechaLocal)) { // Si no existe o es más reciente
        await guardarProductoSincronizado(producto); // Guarda o actualiza el producto
        if (!fechaLocal) nuevos++;
        else actualizados++;
      } else {
        ignorados++;
      }
    }

    res.status(200).json({  // Respuesta resumida
      mensaje: 'Sincronización completada con lógica inteligente', // Mensaje general
      nuevos,
      actualizados,
      ignorados
    });
  } catch (error) {
    console.error('Error al sincronizar productos:', error.message);
    res.status(500).json({ mensaje: 'Error al sincronizar productos' });
  }
};


// Buscar productos con criterios flexibles
export const buscarProductosFlexibles = async (req, res) => {
  try {
    const query = req.query.query?.trim().toLowerCase() || '';

    if (!query) {
      const productos = await obtenerTodosLosProductos();
      return res.json({ productos, total: productos.length });
    }

    const productos = await buscarProductosPorTextoLibre(query);
    res.json({ productos, total: productos.length });
  } catch (error) {
    console.error('Error en búsqueda flexible:', error.message);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

// Listar productos que tienen imagen
export const listarProductosConImagen = async (req, res) => {
  try {
    const productos = await obtenerProductosConImagen();
    res.json({ productos, total: productos.length });
  } catch (error) {
    console.error('Error al obtener productos con imagen:', error.message);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};


// Proxy para obtener imágenes desde servidor remoto
export const obtenerImagenProxy = async (req, res) => {
  try {
    const rawUrl = decodeURIComponent(req.params.nombre); // decodifica la URL completa
    const remoteUrl = rawUrl.startsWith('http') ? rawUrl : `http://74.50.84.165:8000/${rawUrl}`;

    const response = await fetch(remoteUrl);

    if (!response.ok) {
      return res.status(404).send('Imagen no encontrada');
    }

    const contentType = response.headers.get('content-type');
    const buffer = await response.arrayBuffer();

    res.set('Content-Type', contentType);
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Error al obtener imagen remota:', error.message);
    res.status(500).send('Error al cargar la imagen');
  }
};



