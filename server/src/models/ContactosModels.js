import pool from '../config/db.js';

// Función para obtener contactos por id_cliente
export const obtenerContactosPorCliente = async (id_cliente) => {
  const query = `
    SELECT 
      id,
      nombre_contacto,
      apellido,
      area_contacto,
      telefono,
      email
    FROM contactos
    WHERE id_cliente = ?
  `;
  const [rows] = await pool.execute(query, [id_cliente]);
  return rows;
};