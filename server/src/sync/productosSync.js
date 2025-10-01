// Sincronización de productos entre bases de datos remota y local  
import poolLocal from '../config/db.js';     // ✅ conexión local
import poolRemota from '../config/dbRemota.js';   // ✅ conexión remota

// Obtener la última fecha de actualización en la base local
const obtenerFechaUltimaActualizacionLocal = async () => {
  const [rows] = await poolLocal.query(`
    SELECT MAX(ultima_actualizacion) AS ultima FROM productos
  `);
  return rows[0].ultima || '2000-01-01';
};



// Obtener productos actualizados desde la base remota
const obtenerProductosActualizadosRemotos = async (fechaReferencia) => {
  const [rows] = await poolRemota.query(`
    SELECT part_number, detalle, precio, tasa_iva, stock, categoria, subcategoria, id_proveedor, ultima_actualizacion
    FROM productos
    WHERE ultima_actualizacion > ?
  `, [fechaReferencia]);
  return rows;
};


// Sincronizar productos entre remota y local
export const sincronizarProductosActualizados = async () => {
  try {
    const fechaLocal = await obtenerFechaUltimaActualizacionLocal();
    const productos = await obtenerProductosActualizadosRemotos(fechaLocal);

    for (const p of productos) {
      const [existe] = await poolLocal.query(
        `SELECT id FROM productos WHERE part_number = ?`,
        [p.part_number]
      );

      if (existe.length > 0) {
        await poolLocal.query(`
        UPDATE productos SET
        detalle = ?, precio = ?, tasa_iva = ?, stock = ?, categoria = ?, subcategoria = ?, id_proveedor = ?, ultima_actualizacion = ?
        WHERE part_number = ?
          `, [p.detalle, p.precio, p.tasa_iva, p.stock, p.categoria, p.subcategoria, p.id_proveedor, p.ultima_actualizacion, p.part_number]);
      } else {
        await poolLocal.query(`
        INSERT INTO productos (part_number, detalle, precio, tasa_iva, stock, categoria, subcategoria, id_proveedor, ultima_actualizacion)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [p.part_number, p.detalle, p.precio, p.tasa_iva, p.stock, p.categoria, p.subcategoria, p.id_proveedor, p.ultima_actualizacion]);
      }
    }


    
    console.log(`✅ Sincronización completa: ${productos.length} productos procesados`);
  } catch (err) {
    console.error('❌ Error al sincronizar productos:', err.message);
  }
};