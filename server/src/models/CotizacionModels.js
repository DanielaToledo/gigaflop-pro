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

  async crearCabecera({ numero_cotizacion, fecha, estado, id_vendedor, id_cliente}) {  // Crea la cabecera de la nueva cotización utilizando el número generado
    const [result] = await this.db.query(
      `INSERT INTO cotizaciones (numero_cotizacion, fecha, estado, id_vendedor, id_cliente) VALUES (?, ?, ?, ? , ? )`,
      [numero_cotizacion, fecha, estado, id_vendedor, id_cliente]
    );
    return result.insertId;
  }

  async actualizarCabecera(id, data) {  // Actualiza la cabecera de una cotización existente para finalizarla
    await this.db.query(
      `UPDATE cotizaciones SET
        id_cliente = ?, id_contacto = ?, id_condicion = ?,
        vigencia_hasta = ?, observaciones = ?, plazo_entrega = ?,
        costo_envio = ?, estado = ?
      WHERE id = ?`,
      [
        data.id_cliente, data.id_contacto, data.id_condicion,
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

  async obtenerBorradoresPorVendedor(id_vendedor) {  // Obtiene todas las cotizaciones en estado 'borrador' para un vendedor específico
    const [rows] = await this.db.query(
      `SELECT * FROM cotizaciones WHERE estado = 'borrador' AND id_vendedor = ?`,
      [id_vendedor]
    );
    return rows;
  }

async obtenerCotizacionCompleta(idCotizacion) {
  const [cabecera] = await this.db.query(`
    SELECT c.*, 
           cl.razon_social AS cliente_nombre, cl.cuit,
           v.nombre AS vendedor_nombre,
           cc.forma_pago, cc.tipo_cambio, cc.dias_pago, cc.mark_up_maximo, cc.observaciones AS condiciones_observaciones
    FROM cotizaciones c
    JOIN cliente cl ON c.id_cliente = cl.id
    JOIN vendedores v ON c.id_vendedor = v.id
    JOIN condiciones_comerciales cc ON c.id_condicion = cc.id
    WHERE c.id = ?
  `, [idCotizacion]);

  const [detalle] = await this.db.query(`
    SELECT dc.*, p.detalle AS producto_nombre, p.part_number, p.marca, p.tasa_iva
    FROM detalle_cotizacion dc
    JOIN productos p ON dc.id_producto = p.id
    WHERE dc.id_cotizacion = ?
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
}



