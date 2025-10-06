import { sincronizarProductosActualizados } from './productosSync.js';
import { sincronizarImagenesProductos } from './sincronizarImagenesProductos.js';

const ejecutarSincronizaciones = async () => {
  try {
    // 🟢 Paso 1: sincronizar productos
    await sincronizarProductosActualizados();
    console.log('✅ Productos sincronizados');

    // 🟢 Paso 2: sincronizar imágenes en modo completo
    await sincronizarImagenesProductos('completo');
    console.log('✅ Imágenes sincronizadas');

    console.log('🟢 Script ejecutado manualmente con éxito');
  } catch (err) {
    console.error('🔴 Falló la ejecución manual:', err);
  }
};

ejecutarSincronizaciones();
//ejecutamos con: node src/sync/syncRunner.js
