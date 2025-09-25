import dbRemota from './dbRemota.js';

const testConexionRemota = async () => {
  try {
    const [rows] = await dbRemota.query('SELECT COUNT(*) AS total FROM productos');
    console.log('✅ Conexión remota exitosa. Total de productos:', rows[0].total);
  } catch (error) {
    console.error('❌ Error al conectar con la base remota:', error.message);
  }
};

testConexionRemota();