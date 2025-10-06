import poolLocal from '../config/db.js';
import poolRemota from '../config/dbRemota.js';

// Obtener la última fecha de sincronización en la base local
const obtenerUltimoSyncLocal = async () => {
  const [rows] = await poolLocal.query(`
    SELECT MAX(ultimo_sync) AS ultima FROM imagenes_productos
  `);
  return rows[0].ultima || '2000-01-01';
};

// Obtener imágenes desde la base remota, según el modo
const obtenerImagenesRemotas = async (modo = 'incremental') => {
  if (modo === 'completo') {
    const [rows] = await poolRemota.query(`
      SELECT part_number, id_producto, imagen_url, es_principal, fuente, ultimo_sync
      FROM imagenes_productos
    `);
    return rows;
  } else {
    const fechaReferencia = await obtenerUltimoSyncLocal();
    const [rows] = await poolRemota.query(`
      SELECT part_number, imagen_url, id_producto, es_principal, fuente, ultimo_sync
      FROM imagenes_productos
      WHERE ultimo_sync > ?
    `, [fechaReferencia]);
    return rows;
  }
};

// Sincronizar imágenes entre remota y local
export const sincronizarImagenesProductos = async (modo = 'incremental') => {
  try {
    const imagenes = await obtenerImagenesRemotas(modo);
    let procesadas = 0;

    for (const img of imagenes) {
      const [productoExiste] = await poolLocal.query(
        `SELECT part_number FROM productos WHERE part_number = ?`,
        [img.part_number]
      );

      if (productoExiste.length === 0) {
       console.warn(`⚠️ Imagen ignorada: part_number ${img.part_number} no existe en la base local`);
        continue;
      }

      await poolLocal.query(`
        INSERT INTO imagenes_productos (part_number, id_producto, imagen_url, es_principal, fuente, ultimo_sync)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          imagen_url = VALUES(imagen_url),
          fuente = VALUES(fuente),
          ultimo_sync = VALUES(ultimo_sync)
      `, [img.part_number, img.id_producto, img.imagen_url, img.es_principal, img.fuente, img.ultimo_sync]);

      console.log(`🖼️ Imagen sincronizada: ${img.part_number} → ${img.imagen_url}`);
      procesadas++;
    }

    console.log(`✅ Sincronización de imágenes (${modo}): ${procesadas} registros procesados`);
  } catch (err) {
    console.error('❌ Error al sincronizar imágenes:', err.message);
  }
};

//ejecutamos con: node src/sync/syncRunner.js