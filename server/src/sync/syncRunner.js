import { sincronizarProductosActualizados } from './productosSync.js';

sincronizarProductosActualizados()
  .then(() => console.log('🟢 Script ejecutado manualmente con éxito'))
  .catch(err => console.error('🔴 Falló la ejecución manual:', err));




//ejecutamos con: node src/sync/syncRunner.js
