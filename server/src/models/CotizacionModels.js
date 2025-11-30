
// models/CotizacionModels.js
import pool from '../config/db.js';

export class Cotizacion {
  constructor(db = pool) {
    this.db = db;
  }

  async obtenerPorId(id) {
    const [rows] = await this.db.query(`
    SELECT
      c.*,
      e.nombre AS estado_nombre,
      e.es_final,
      e.requiere_vencimiento,
      e.orden_visual,
      cl.razon_social AS cliente_nombre,
      ct.email AS cliente_email
    FROM cotizaciones c
    LEFT JOIN estados e ON c.id_estado = e.id
    LEFT JOIN cliente cl ON c.id_cliente = cl.id
    LEFT JOIN contactos ct ON ct.id_cliente = cl.id
    WHERE c.id = ?
    LIMIT 1
  `, [id]);

    return rows[0] ?? null;
  }

  async generarNumeroCotizacion() {
    const año = new Date().getFullYear();
    const [rows] = await this.db.query(
      `SELECT numero_cotizacion FROM cotizaciones WHERE numero_cotizacion LIKE ? ORDER BY id DESC LIMIT 1`,
      [`COT-${año}-%`]
    );

    let nuevo = 1;
    if (rows.length > 0) {
      const partes = rows[0].numero_cotizacion.split('-');
      nuevo = parseInt(partes[2], 10) + 1;
    }

    return `COT-${año}-${String(nuevo).padStart(4, '0')}`;
  }

  // Crear la cabecera de una nueva cotización (ajustada a las columnas reales)
  async crearCabecera({
    numero_cotizacion,
    fecha = null,
    id_estado,
    id_usuario,
    id_cliente,
    id_contacto,
    id_direccion_cliente,
    id_condicion = null,
    vigencia_hasta = null,
    observaciones = '',
    plazo_entrega = '',
    costo_envio = 0,
    modalidad_envio = null,
    vencimiento = null
  }) {
    const fechaInsert = fecha ?? new Date();

    const [result] = await this.db.query(
      `INSERT INTO cotizaciones (
        numero_cotizacion, id_cliente, id_contacto, id_condicion, fecha,
        vigencia_hasta, observaciones, plazo_entrega, costo_envio,
        id_estado, id_direccion_cliente, id_usuario, modalidad_envio, vencimiento
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        numero_cotizacion,
        id_cliente,
        id_contacto,
        id_condicion,
        fechaInsert,
        vigencia_hasta ?? null,
        observaciones ?? '',
        plazo_entrega ?? '',
        costo_envio ?? 0,
        id_estado,
        id_direccion_cliente ?? null,
        id_usuario ?? null,
        modalidad_envio ?? null,
        vencimiento ?? null
      ]
    );

    return result.insertId;
  }

  // Actualizar la cabecera de una cotización existente (ajustada a las columnas reales)
  async actualizarCabecera(id, data) {
    await this.db.query(
      `UPDATE cotizaciones SET
        id_cliente = ?, id_contacto = ?, id_condicion = ?,
        fecha = ?, vigencia_hasta = ?, observaciones = ?, plazo_entrega = ?, costo_envio = ?,
        id_estado = ?, id_direccion_cliente = ?, id_usuario = ?, modalidad_envio = ?, vencimiento = ?
      WHERE id = ?`,
      [
        data.id_cliente ?? null,
        data.id_contacto ?? null,
        data.id_condicion ?? null,
        data.fecha ?? null,
        data.vigencia_hasta ?? null,
        data.observaciones ?? '',
        data.plazo_entrega ?? '',
        data.costo_envio ?? 0,
        data.id_estado,
        data.id_direccion_cliente ?? null,
        data.id_usuario ?? null,
        data.modalidad_envio ?? null,
        data.vencimiento ?? null,
        id
      ]
    );
  }




  // Agregar detalle tomando precios desde tabla productos (opcional)
  async agregarDetalle(idCotizacion, productos) {
    for (const item of productos) {
      const [productoRows] = await this.db.query(
        `SELECT precio, tasa_iva FROM productos WHERE id = ?`,
        [item.id_producto]
      );
      const producto = productoRows[0];
      if (!producto) continue;

      const precioConIva = Number(producto.precio);
      const descuento = Number(item.descuento || 0);
      const cantidad = Number(item.cantidad || 1);

      const subtotal = (precioConIva - descuento) * cantidad;
      const iva = 0;
      const total = subtotal;

      await this.db.query(
        `INSERT INTO detalle_cotizacion (
          id_cotizacion, id_producto, cantidad, precio_unitario,
          descuento, subtotal, iva, total_iva_incluido, markup_ingresado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          idCotizacion,
          item.id_producto,
          cantidad,
          precioConIva,
          descuento,
          subtotal,
          iva,
          total,
          Number(item.markup_ingresado ?? item.markup ?? 0)
        ]
      );
    }
  }

  // Reemplaza los productos del detalle y persiste markup_ingresado
  // Ejecuta delete + inserts dentro de una transacción para atomicidad
  async reemplazarProductos(idCotizacion, productos) {
    await this.db.query('START TRANSACTION');
    try {
      await this.db.query(`DELETE FROM detalle_cotizacion WHERE id_cotizacion = ?`, [idCotizacion]);

      for (const p of productos) {
        if (!p.id_producto || Number(p.cantidad) <= 0) continue;

        const cantidad = Number(p.cantidad) || 1;
        const precio_unitario = Number(p.precio_unitario ?? p.precio ?? 0);
        const descuento = Number(p.descuento ?? 0);
        const markup_ingresado = Number(p.markup_ingresado ?? p.markup ?? 0);
        const subtotal = (precio_unitario - descuento) * cantidad;
        const iva = 0;
        const total = subtotal;

        await this.db.query(
          `INSERT INTO detalle_cotizacion (
            id_cotizacion, id_producto, cantidad, precio_unitario,
            descuento, subtotal, iva, total_iva_incluido, markup_ingresado
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            idCotizacion,
            p.id_producto,
            cantidad,
            precio_unitario,
            descuento,
            subtotal,
            iva,
            total,
            markup_ingresado
          ]
        );
      }

      await this.db.query('COMMIT');
    } catch (err) {
      await this.db.query('ROLLBACK');
      throw err;
    }
  }


  async actualizarVencidas() {
    await this.db.query(`
    UPDATE cotizaciones
    SET id_estado = 5
    WHERE id_estado = 2
      AND vigencia_hasta IS NOT NULL
      AND vigencia_hasta < CURRENT_DATE
  `);
  }



  async actualizarEstado(id, id_estado) {
    await this.db.query(`
    UPDATE cotizaciones
    SET id_estado = ?
    WHERE id = ?
  `, [id_estado, id]);

    return this.obtenerPorId(id); // devuelve la cotización actualizada con JOIN
  }


  // Obtener borradores por usuario
  async obtenerBorradoresPorUsuario(id_usuario) {
    const [rows] = await this.db.query(
      `SELECT
        c.id,
        c.numero_cotizacion,
        c.fecha,
        e.id AS estado_id,
        e.nombre AS estado_nombre,
        e.es_final AS estado_es_final,
        e.requiere_vencimiento AS estado_requiere_vencimiento,
        
        cl.razon_social AS cliente_nombre,
        
        u.nombre AS usuario_nombre,
        
        ct.nombre_contacto AS contacto_nombre,
        ct.apellido AS contacto_apellido,
        
        c.vigencia_hasta,
        COALESCE(SUM(dp.precio_unitario * dp.cantidad * (1 - dp.descuento / 100)), 0) AS total
      FROM cotizaciones c
      LEFT JOIN estados e ON c.id_estado = e.id
      LEFT JOIN cliente cl ON c.id_cliente = cl.id
      LEFT JOIN usuarios u ON c.id_usuario = u.id
      LEFT JOIN contactos ct ON c.id_contacto = ct.id
      LEFT JOIN detalle_cotizacion dp ON c.id = dp.id_cotizacion
      WHERE c.id_estado = (SELECT id FROM estados WHERE nombre = 'borrador' LIMIT 1)
        AND c.id_usuario = ?
      GROUP BY c.id
      ORDER BY c.fecha DESC;`,
      [id_usuario]
    );

    const normalized = (rows || []).map(r => ({
      id: r.id,
      numero_cotizacion: r.numero_cotizacion,
      fecha: r.fecha ? new Date(r.fecha).toISOString() : null,
      vigencia_hasta: r.vigencia_hasta ? new Date(r.vigencia_hasta).toISOString() : null,
      cliente_nombre: r.cliente_nombre,
      contacto_nombre: r.contacto_nombre,
      contacto_apellido: r.contacto_apellido,
      total: r.total,
      estado: {
        id: r.estado_id,
        nombre: r.estado_nombre,
        es_final: Boolean(r.estado_es_final),
        requiere_vencimiento: Boolean(r.estado_requiere_vencimiento)
      }
    }));

    return normalized;
  }


  // CotizacionModels.js
 async obtenerTodasPorUsuario(id_usuario) {
    const [rows] = await this.db.query(
      `SELECT
      c.id,
      c.numero_cotizacion,
      c.fecha,
      c.vigencia_hasta,
      c.observaciones,
      e.id AS estado_id,
      e.nombre AS estado_nombre,
      e.es_final AS estado_es_final,
      e.requiere_vencimiento AS estado_requiere_vencimiento,
      cl.razon_social AS cliente_nombre,
      u.nombre AS usuario_nombre,
      ct.nombre_contacto AS contacto_nombre,
      ct.apellido AS contacto_apellido,
      COALESCE(SUM(dp.precio_unitario * dp.cantidad * (1 - dp.descuento / 100)), 0) AS total
    FROM cotizaciones c
    LEFT JOIN estados e ON c.id_estado = e.id
    LEFT JOIN cliente cl ON c.id_cliente = cl.id
    LEFT JOIN usuarios u ON c.id_usuario = u.id
    LEFT JOIN contactos ct ON c.id_contacto = ct.id
    LEFT JOIN detalle_cotizacion dp ON c.id = dp.id_cotizacion
    WHERE c.id_usuario = ?
    GROUP BY c.id
    ORDER BY c.fecha DESC`,
      [id_usuario]
    );

    return rows;
  }






  // Devuelve la cabecera + productos con datos enriquecidos (incluye mark_up_maximo desde condiciones_comerciales)
  async obtenerCotizacionCompleta(idCotizacion) {
    const [cabeceraRows] = await this.db.query(
      `SELECT c.*,
      e.id AS estado_id, 
      e.nombre AS estado_nombre,
      e.es_final AS estado_es_final,
     e.requiere_vencimiento AS estado_requiere_vencimiento,
     cl.razon_social AS cliente_nombre, cl.cuit,
     u.nombre AS usuario_nombre, u.apellido AS usuario_apellido,
     cc.forma_pago, cc.tipo_cambio, cc.dias_pago, cc.mark_up_maximo, cc.observaciones AS condiciones_observaciones,
     dc.locacion, dc.localidad, dc.provincia,
     con.nombre_contacto AS nombre_contacto,
     con.apellido AS contacto_apellido,
     con.email AS contacto_email,
     v.nombre AS vendedor_nombre,
      v.apellido AS vendedor_apellido,
      v.email AS vendedor_email,
     v.legajo AS vendedor_legajo,
     v.status AS vendedor_status,
     CONCAT_WS(' ', dir.calle, dir.numeracion, dir.piso, dir.depto, '-', dir.localidad, '-', dir.provincia) AS direccion_cliente
     FROM cotizaciones c
     LEFT JOIN estados e ON c.id_estado = e.id
     JOIN cliente cl ON c.id_cliente = cl.id
     JOIN usuarios u ON c.id_usuario = u.id
     LEFT JOIN condiciones_comerciales cc ON c.id_condicion = cc.id
     LEFT JOIN direccion_cliente dc ON c.id_direccion_cliente = dc.id
     LEFT JOIN contactos con ON con.id = c.id_contacto
     LEFT JOIN direccion_cliente dir ON dir.id = c.id_direccion_cliente
     LEFT JOIN vendedores v ON v.id_usuario = u.id
     WHERE c.id = ?`,
      [idCotizacion]
    );

    const cabeceraRaw = cabeceraRows[0] ?? null;
    let cabecera = cabeceraRaw;

const vendedor = {
  nombre: cabeceraRaw.vendedor_nombre ?? cabeceraRaw.usuario_nombre ?? '',
  apellido: cabeceraRaw.vendedor_apellido ?? cabeceraRaw.usuario_apellido ?? '',
  email: cabeceraRaw.vendedor_email ?? '',
  legajo: cabeceraRaw.vendedor_legajo ?? null,
  estado: cabeceraRaw.vendedor_status ?? null
};

    const [contactosCliente] = await this.db.query(
      `SELECT id, nombre_contacto FROM contactos WHERE id_cliente = ?`,
      [cabecera.id_cliente]
    );

    const [direccionesCliente] = await this.db.query(
      `SELECT id,
        CONCAT_WS(' ', calle, numeracion, piso, depto, '-', localidad, '-', provincia) AS texto
     FROM direccion_cliente
     WHERE id_cliente = ?`,
      [cabecera.id_cliente]
    );

    cabecera.contactos = contactosCliente ?? [];
    cabecera.direcciones = direccionesCliente ?? [];

    if (cabecera) {
      const rawMark = cabecera.mark_up_maximo;
      if (rawMark === null || rawMark === undefined || rawMark === '') {
        cabecera.mark_up_maximo = null;
      } else {
        const parsed = parseFloat(String(rawMark).replace(',', '.').trim());
        cabecera.mark_up_maximo = Number.isFinite(parsed) ? parsed : null;
      }

      cabecera.fecha = cabecera.fecha ? new Date(cabecera.fecha).toISOString() : null;
      cabecera.vigencia_hasta = cabecera.vigencia_hasta ? new Date(cabecera.vigencia_hasta).toISOString() : null;
      cabecera.estado = {
        id: cabecera.id_estado,
        nombre: cabecera.estado_nombre,
        es_final: Boolean(cabecera.estado_es_final),
        requiere_vencimiento: Boolean(cabecera.estado_requiere_vencimiento)
      };
    }


    const [detalleRows] = await this.db.query(
      `SELECT dc.*, p.detalle, p.part_number, p.marca, p.categoria, p.subcategoria, p.tasa_iva, p.precio
     FROM detalle_cotizacion dc
     JOIN productos p ON dc.id_producto = p.id
     WHERE dc.id_cotizacion = ?`,
      [idCotizacion]
    );

    const productos = (detalleRows || []).map(item => {
      const tasa = Number(item.tasa_iva ?? 21);
      const precio_unitario_raw = Number(item.precio_unitario ?? item.precio ?? 0);
      const precio_unitario = parseFloat(precio_unitario_raw.toFixed(2));
      const descuento = parseFloat(Number(item.descuento ?? 0).toFixed(2));
      const cantidad = Number(item.cantidad ?? 1);
      const subtotal = parseFloat(Number(item.subtotal ?? (precio_unitario - descuento) * cantidad).toFixed(2));
      const ivaDesglosado = tasa > 0 ? precio_unitario * (tasa / (100 + tasa)) : 0;

      return {
        ...item,
        precio_unitario,
        descuento,
        cantidad,
        subtotal,
        iva_desglosado: parseFloat(ivaDesglosado.toFixed(2)),
        markup_ingresado: item.markup_ingresado !== undefined && item.markup_ingresado !== null
          ? Number(item.markup_ingresado)
          : 0
      };
    });

    // 🧮 Cálculo fiscal extendido
    let base21 = 0, base105 = 0, descuentosTotales = 0;

    productos.forEach(p => {
      const base = p.subtotal ?? 0;
      const iva = Number(p.tasa_iva ?? 21);
      const descuento = Number(p.descuento ?? 0);

      descuentosTotales += descuento;

      if (iva === 21) base21 += base;
      else if (iva === 10.5) base105 += base;
      else base21 += base; // fallback
    });

    const iva21 = base21 * 0.21;
    const iva105 = base105 * 0.105;
    const baseImponible = base21 + base105;
    const totalFinal = baseImponible + iva21 + iva105;

    // 🧾 Asignación a cabecera
    cabecera.total = parseFloat(totalFinal.toFixed(2));
    cabecera.resumen_fiscal = {
      base21: parseFloat(base21.toFixed(2)),
      base105: parseFloat(base105.toFixed(2)),
      iva21: parseFloat(iva21.toFixed(2)),
      iva105: parseFloat(iva105.toFixed(2)),
      baseImponible: parseFloat(baseImponible.toFixed(2)),
      descuentosTotales: parseFloat(descuentosTotales.toFixed(2)),
      totalFinal: parseFloat(totalFinal.toFixed(2))
    };

    return {
      cabecera,
      productos,
      vendedor
    };
  }


  // Obtener cotización para edición (cabecera + productos) — devuelve estado_nombre y fechas normalizadas
  async obtenerCotizacionParaEdicion(id) {
    const [cabeceraRows] = await this.db.query(
      `SELECT c.*,
        e.id AS estado_id,
        e.nombre AS estado_nombre,
        e.es_final AS estado_es_final,
        e.requiere_vencimiento AS estado_requiere_vencimiento, 
            cl.razon_social AS cliente_nombre,
            cl.cuit,
            con.nombre_contacto AS nombre_contacto,
            con.apellido AS contacto_apellido,
            con.email AS contacto_email,
            CONCAT_WS(' ', dir.calle, dir.numeracion, dir.piso, dir.depto, '-', dir.localidad, '-', dir.provincia) AS direccion_cliente
     FROM cotizaciones c
     LEFT JOIN estados e ON c.id_estado = e.id
     JOIN cliente cl ON c.id_cliente = cl.id
     LEFT JOIN contactos con ON con.id = c.id_contacto
     LEFT JOIN direccion_cliente dir ON dir.id = c.id_direccion_cliente
     WHERE c.id = ?`,
      [id]
    );

    const cabeceraRaw = cabeceraRows[0] ?? null;
    let cabecera = cabeceraRaw;

    if (cabecera) {
      cabecera.fecha = cabecera.fecha ? new Date(cabecera.fecha).toISOString() : null;
      cabecera.vigencia_hasta = cabecera.vigencia_hasta ? new Date(cabecera.vigencia_hasta).toISOString() : null;
      cabecera.estado = {
        id: cabecera.id_estado,
        nombre: cabecera.estado_nombre,
        es_final: Boolean(cabecera.estado_es_final),
        requiere_vencimiento: Boolean(cabecera.estado_requiere_vencimiento)
      };
      // Enriquecer con arrays decorativos
      const [contactosCliente] = await this.db.query(
        `SELECT id, nombre_contacto FROM contactos WHERE id_cliente = ?`,
        [cabecera.id_cliente]
      );

      const [direccionesCliente] = await this.db.query(
        `SELECT id,
              CONCAT_WS(' ', calle, numeracion, piso, depto, '-', localidad, '-', provincia) AS texto
       FROM direccion_cliente
       WHERE id_cliente = ?`,
        [cabecera.id_cliente]
      );

      cabecera.contactos = contactosCliente ?? [];
      cabecera.direcciones = direccionesCliente ?? [];
    }

    const [rows] = await this.db.query(
      `SELECT
      cd.*, p.detalle, p.part_number, p.marca, p.categoria, p.subcategoria, p.tasa_iva, p.precio
     FROM detalle_cotizacion cd
     JOIN productos p ON cd.id_producto = p.id
     WHERE cd.id_cotizacion = ?`,
      [id]
    );

    const productos = (rows || []).map(item => {
      const tasa = Number(item.tasa_iva ?? 21);
      const precio_unitario_raw = Number(item.precio_unitario ?? item.precio ?? 0);
      const precio_unitario = parseFloat(precio_unitario_raw.toFixed(2));
      const descuento = parseFloat(Number(item.descuento ?? 0).toFixed(2));
      const cantidad = Number(item.cantidad ?? 1);
      const subtotal = parseFloat(Number(item.subtotal ?? (precio_unitario - descuento) * cantidad).toFixed(2));
      const ivaDesglosado = tasa > 0 ? precio_unitario * (tasa / (100 + tasa)) : 0;

      return {
        ...item,
        precio_unitario,
        descuento,
        cantidad,
        subtotal,
        iva_desglosado: parseFloat(ivaDesglosado.toFixed(2)),
        markup_ingresado: item.markup_ingresado !== undefined && item.markup_ingresado !== null
          ? Number(item.markup_ingresado)
          : 0
      };
    });

    return {
      cabecera,
      productos
    };
  }

//este método obtiene todas las cotizaciones sin filtrar por usuario es para los administradores
async obtenerTodas() {
  const [rows] = await this.db.query(
    `SELECT
     c.id,
     c.numero_cotizacion,
     c.fecha,
     c.vigencia_hasta,
     c.observaciones,
     e.id AS estado_id,
     e.nombre AS estado_nombre,
     e.es_final AS estado_es_final,
     e.requiere_vencimiento AS estado_requiere_vencimiento,
     cl.razon_social AS cliente_nombre,
     u.nombre AS usuario_nombre,
     ct.nombre_contacto AS contacto_nombre,
     ct.apellido AS contacto_apellido,
     COALESCE(SUM(dp.precio_unitario * dp.cantidad * (1 - dp.descuento / 100)), 0) AS total
   FROM cotizaciones c
   LEFT JOIN estados e ON c.id_estado = e.id
   LEFT JOIN cliente cl ON c.id_cliente = cl.id
   LEFT JOIN usuarios u ON c.id_usuario = u.id
   LEFT JOIN contactos ct ON c.id_contacto = ct.id
   LEFT JOIN detalle_cotizacion dp ON c.id = dp.id_cotizacion
   GROUP BY c.id
   ORDER BY c.fecha DESC`
  );
  return rows;
}

// Devuelve todas las cotizaciones con productos y marcas (solo para dashboard)
async obtenerTodasParaDashboard() {
  const [rows] = await this.db.query(
    `SELECT
       c.id,
       c.numero_cotizacion,
       c.fecha,
       c.vigencia_hasta,
       c.observaciones,
       e.id AS estado_id,
       e.nombre AS estado_nombre,
       e.es_final AS estado_es_final,
       e.requiere_vencimiento AS estado_requiere_vencimiento,
       cl.razon_social AS cliente_nombre,
       u.nombre AS usuario_nombre,
       ct.nombre_contacto AS contacto_nombre,
       ct.apellido AS contacto_apellido,
       GROUP_CONCAT(p.detalle SEPARATOR ', ') AS productos,
       GROUP_CONCAT(p.marca SEPARATOR ', ') AS marcas,
       COALESCE(SUM(dp.total_iva_incluido), 0) AS total
     FROM cotizaciones c
     LEFT JOIN estados e ON c.id_estado = e.id
     LEFT JOIN cliente cl ON c.id_cliente = cl.id
     LEFT JOIN usuarios u ON c.id_usuario = u.id
     LEFT JOIN contactos ct ON c.id_contacto = ct.id
     LEFT JOIN detalle_cotizacion dp ON c.id = dp.id_cotizacion
     LEFT JOIN productos p ON dp.id_producto = p.id
     GROUP BY c.id
     ORDER BY c.fecha DESC`
  );

  return rows;
}




}