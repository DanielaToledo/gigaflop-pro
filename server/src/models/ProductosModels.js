import pool from '../config/db.js'; // conexión local
import dbRemota from '../config/dbRemota.js'; // conexión remota

//  Funciones sobre base local
export const buscarProductoPorPartNumber = async (partNumber) => {
  const [rows] = await pool.query(
    'SELECT * FROM productos WHERE LOWER(TRIM(part_number)) = LOWER(TRIM(?))',
    [partNumber]
  );
  return rows[0];
};

export const buscarProductosPorColumna = async (columna, valor) => {
  const columnasPermitidas = ['part_number', 'detalle', 'marca', 'categoria'];
  if (!columnasPermitidas.includes(columna)) throw new Error('Columna no válida');

  const query = `SELECT * FROM productos WHERE LOWER(TRIM(${columna})) LIKE ?`;
  const [rows] = await pool.query(query, [`%${valor.trim().toLowerCase()}%`]);
  return rows;
};

export const obtenerTodosLosProductos = async () => {
  const [rows] = await pool.query('SELECT * FROM productos');
  return rows;
};

export const guardarProductoSincronizado = async (producto) => {
  const {
    part_number,
    detalle,
    categoria,
    subcategoria,
    marca,
    stock,
    precio,
    tasa_iva,
    ultima_actualizacion,
    id_proveedor
  } = producto;

  await pool.query(
    `REPLACE INTO productos (
      part_number, detalle, categoria, subcategoria, marca,
      stock, precio, tasa_iva, ultima_actualizacion, id_proveedor
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      part_number, detalle, categoria, subcategoria, marca,
      stock, precio, tasa_iva, ultima_actualizacion, id_proveedor
    ]
  );
};

export const obtenerFechaLocalDeProducto = async (partNumber) => {
  const [rows] = await pool.query(
    'SELECT ultima_actualizacion FROM productos WHERE part_number = ?',
    [partNumber]
  );
  return rows.length ? rows[0].ultima_actualizacion : null;
};

//  Función sobre base remota
export const obtenerProductosDesdeRemoto = async () => {
  const [rows] = await dbRemota.query('SELECT * FROM productos');
  return rows;
};