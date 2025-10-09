//CONEXION A BD
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config(); // carga las variables de .env

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
pool.getConnection()
  .then(connection => {
    console.log(' Conectado a MySQL sistema_cotizacion correctamente');
    connection.release(); // libera la conexión
  })
  .catch(err => {
    console.error('Error al conectar a MySQL:', err.message);
  });



export default pool;

//  try {
//  const [rows] = await pool.query('SELECT 1 + 1 AS result');
//console.log('Conexión exitosa con resultado:', rows[0].result);
//} catch (err) {
//  console.error('Error al conectar a la base de datos:', err);
//}

