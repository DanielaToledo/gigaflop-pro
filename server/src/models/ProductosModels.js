import pool from '../config/db.js'; // Importa la conexión a la base de datos


// Buscar producto por part_number 
export const buscarProductoPorPartNumber = async (partNumber) => { 
  const [rows] = await pool.query(
    'SELECT * FROM productos WHERE LOWER(TRIM(part_number)) = LOWER(TRIM(?))', // Utiliza TRIM y LOWER para normalizar la búsqueda
    [partNumber]
  );
  return rows[0]; // Devuelve uno
};

// Buscar productos por columna y valor
export const buscarProductosPorColumna = async (columna, valor) => {
  const columnasPermitidas = ['part_number', 'detalle', 'marca', 'categoria']; // Agrega columnas seguras
  if (!columnasPermitidas.includes(columna)) throw new Error('Columna no válida');

  let query = `SELECT * FROM productos WHERE LOWER(TRIM(${columna})) LIKE ?`;
  const [rows] = await pool.query(query, [`%${valor.trim().toLowerCase()}%`]);
  return rows;
};

//obtener todos los productos
export const obtenerTodosLosProductos = async () => {
  const [rows] = await pool.query('SELECT * FROM productos');
  return rows;
};
