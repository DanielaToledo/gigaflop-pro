import pool from './db.js';

const testConexionLocal = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión local exitosa a MySQL');
    connection.release(); // libera la conexión
  } catch (error) {
    console.error('❌ Error al conectar a la base local:', error.message);
  }
};

testConexionLocal();








// test-db.js
//import { pool } from './db.js'; // Asegúrate de que la ruta sea correcta

//const testConnection = async () => {
//  try {
//    const [rows] = await pool.query('SELECT 1 + 1 AS result');
//    console.log('Conexión exitosa:', rows[0]);
//  } catch (error) {
//    console.error('Error al conectar con la base de datos:', error);
//  }
//};

//testConnection();
