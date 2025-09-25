import dbLocal from './db.js';
import dbRemota from './dbRemota.js';

const testConexion = async () => {
  const entorno = process.env.NODE_ENV;

  try {
    if (entorno === 'local') {
      const connection = await dbLocal.getConnection();
      console.log('✅ Conexión local exitosa a MySQL');
      connection.release();
    } else if (entorno === 'remoto') {
      const [rows] = await dbRemota.query('SELECT COUNT(*) AS total FROM productos');
      console.log('✅ Conexión remota exitosa. Total de productos:', rows[0].total);
    } else {
      console.warn('⚠️ NODE_ENV no definido correctamente. Usá "local" o "remoto".');
    }
  } catch (error) {
    console.error(`❌ Error al conectar (${entorno}):`, error.message);
  }
};

testConexion();