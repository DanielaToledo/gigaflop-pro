import pool from '../config/db.js'; // Importa la conexión a la base de datos


export class Cotizacion {   //
  constructor(db) {
    this.db = db;
  }

  async generarNumeroCotizacion() { // Genera un nuevo número de cotización
    const año = new Date().getFullYear();
    const [rows] = await this.db.query(
      `SELECT numero_cotizacion FROM cotizaciones WHERE numero_cotizacion LIKE ? ORDER BY id DESC LIMIT 1`,
      [`COT-${año}-%`]
    );

    let nuevo = 1;
    if (rows.length > 0) {
      const partes = rows[0].numero_cotizacion.split('-');
      nuevo = parseInt(partes[2]) + 1;
    }

    return `COT-${año}-${String(nuevo).padStart(4, '0')}`;
  }


  // Crear la cabecera de una nueva cotización
async crearCabecera({ numero_cotizacion, fecha, estado, id_vendedor, id_cliente, id_contacto, id_direccion_cliente }) {
  const [result] = await this.db.query(
    `INSERT INTO cotizaciones (
      numero_cotizacion, fecha, estado, id_vendedor, id_cliente, id_contacto, id_direccion_cliente
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [numero_cotizacion, fecha, estado, id_vendedor, id_cliente, id_contacto, id_direccion_cliente]
  );
  return result.insertId;
}

  // Actualizar la cabecera de una cotización existente
  async actualizarCabecera(id, data) {
    await this.db.query(
      `UPDATE cotizaciones SET
      id_cliente = ?, id_contacto = ?, id_direccion_cliente = ?, id_condicion = ?,
      vigencia_hasta = ?, observaciones = ?, plazo_entrega = ?,
      costo_envio = ?, estado = ?
    WHERE id = ?`,
      [
        data.id_cliente, data.id_contacto,
        data.id_direccion_cliente,
        data.id_condicion,
        data.vigencia_hasta, data.observaciones, data.plazo_entrega,
        data.costo_envio, data.estado, id
      ]
    );
  }

  async agregarDetalle(idCotizacion, productos) {
    for (const item of productos) {
      const [producto] = await this.db.query(
        `SELECT precio, tasa_iva FROM productos WHERE id = ?`,
        [item.id_producto]
      );

      const precioConIva = producto[0].precio; // ya incluye IVA
      const descuento = item.descuento || 0;
      const cantidad = item.cantidad;

      const subtotal = (precioConIva - descuento) * cantidad;
      const iva = 0; // no se calcula porque ya está incluido
      const total = subtotal;

      await this.db.query(
        `INSERT INTO detalle_cotizacion (
        id_cotizacion, id_producto, cantidad, precio_unitario,
        descuento, subtotal, iva, total_iva_incluido
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          idCotizacion,
          item.id_producto,
          cantidad,
          precioConIva,
          descuento,
          subtotal,
          iva,
          total
        ]
      );
    }
  }

  // Método para obtener las cotizaciones en estado 'borrador' de un vendedor específico
  async obtenerBorradoresPorVendedor(id_vendedor) {
    const [rows] = await this.db.query(`
    SELECT 
      c.id, 
      c.numero_cotizacion, 
      c.fecha, 
      c.estado,
      cl.razon_social AS cliente_nombre,
      v.nombre AS vendedor_nombre,
      ct.nombre_contacto AS contacto_nombre,
      ct.apellido AS contacto_apellido
    FROM cotizaciones c
    JOIN cliente cl ON c.id_cliente = cl.id
    JOIN vendedores v ON c.id_vendedor = v.id
    LEFT JOIN contactos ct ON c.id_contacto = ct.id
    WHERE c.estado = 'borrador' AND c.id_vendedor = ?
    ORDER BY c.fecha DESC
  `, [id_vendedor]);

    return rows;
  }

  async obtenerCotizacionCompleta(idCotizacion) {
 const [cabecera] = await this.db.query(`
  SELECT c.*, 
         cl.razon_social AS cliente_nombre, cl.cuit,
         v.nombre AS vendedor_nombre,
         cc.forma_pago, cc.tipo_cambio, cc.dias_pago, cc.mark_up_maximo, cc.observaciones AS condiciones_observaciones,
         dc.locacion, dc.localidad, dc.provincia
  FROM cotizaciones c
  JOIN cliente cl ON c.id_cliente = cl.id
  JOIN vendedores v ON c.id_vendedor = v.id
  JOIN condiciones_comerciales cc ON c.id_condicion = cc.id
  LEFT JOIN direccion_cliente dc ON c.id_direccion_cliente = dc.id
  WHERE c.id = ?
`, [idCotizacion]);

    // Calcular IVA incluido por producto
    const productos = detalle.map(item => {
      const ivaDesglosado = item.precio_unitario * (item.tasa_iva / (100 + item.tasa_iva));
      return {
        ...item,
        iva_desglosado: parseFloat(ivaDesglosado.toFixed(2))
      };
    });

    return {
      cabecera: cabecera[0],
      productos
    };
  }

  async reemplazarProductos(idCotizacion, productos) {
    await this.db.query(`DELETE FROM detalle_cotizacion WHERE id_cotizacion = ?`, [idCotizacion]);

    for (const p of productos) {
      // Validación mínima para evitar errores
      if (!p.id_producto || p.cantidad <= 0) continue;

      const descuento = p.descuento || 0;
      const precioFinal = p.precio_unitario - descuento;
      const subtotal = precioFinal * p.cantidad;
      const iva = 0; // ya está incluido
      const total = subtotal;
      console.log(`🧪 Insertando producto en cotización ${idCotizacion}:`, p);
      await this.db.query(`
      INSERT INTO detalle_cotizacion (
        id_cotizacion, id_producto, cantidad, precio_unitario,
        descuento, subtotal, iva, total_iva_incluido
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        idCotizacion,
        p.id_producto,
        p.cantidad,
        p.precio_unitario,
        descuento,
        subtotal,
        iva,
        total
      ]);
      console.log(`✅ Producto insertado:`, p.id_producto); // ✅ ahora dentro del for


    }
  }

  async obtenerCotizacionParaEdicion(id) {
    const [cabecera] = await this.db.query(`
  SELECT c.*, cl.razon_social, cl.cuit
  FROM cotizaciones c
  JOIN cliente cl ON c.id_cliente = cl.id
  WHERE c.id = ?
`, [id]);


    const [rows] = await this.db.query(`
  SELECT
    cd.*, p.detalle, p.part_number, p.marca, p.categoria, p.subcategoria, p.tasa_iva, p.precio
  FROM detalle_cotizacion cd
  JOIN productos p ON cd.id_producto = p.id
  WHERE cd.id_cotizacion = ?
`, [id]);

    console.log('🧪 Productos recuperados para edición:', rows);

    return {
      cabecera: cabecera[0],
      productos: rows
    };

  }

}


