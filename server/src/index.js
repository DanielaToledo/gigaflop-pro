import app from './app.js';
import pool from './config/db.js';
// Opcional: verificar conexión al iniciar
async function startServer() {
  try {
    // Verificamos si la conexión funciona
    await pool.query('SELECT 1');
    console.log('>>>>>> Base de datos conectada<<<<<<');

    app.listen(4000, () => {
      console.log(' Servidor corriendo en el puerto 4000');
    });
  } catch (error) {
    console.error(' Error al conectar con la base de datos:', error);
  }
}

startServer();