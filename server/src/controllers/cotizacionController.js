// controllers/cotizacionController.js
import { Cotizacion } from '../models/CotizacionModels.js';
import { aMySQLDateTime, aMySQLDate, sumarDias } from '../utils/helperDeFecha.js';




const toNumberOrNull = v => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const nullOr = v => (v === undefined ? null : v);

// Reglas: para GUARDAR borrador son obligatorios: req.user.id, id_cliente y id_contacto.
// El resto (dirección, condiciones, productos, etc.) es flexible.
// Al FINALIZAR se valida completitud adicional (contacto, dirección, condición y productos).

// Iniciar una nueva cotización (create cabecera en estado 'borrador' y opcionalmente detalle)
// controllers/cotizacionController.js (fragmento iniciarCotizacion traducido)

const aNumeroONulo = v => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const nuloSiUndefined = v => (v === undefined ? null : v);

export async function iniciarCotizacion(req, res) {
  const db = req.app.get('db');
  const usuarioAutenticadoId = req.user?.id ?? null;

  const {
    id_cliente,
    id_contacto,
    productos = [],
    id_direccion_cliente,
    id_condicion,
    dias_vencimiento,
    vigencia_hasta,
    observaciones,
    plazo_entrega,
    costo_envio,
    modalidad_envio,
    vencimiento
  } = req.body;

  // helpers locales
  const aNumeroONuloLocal = v => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const nuloSiUndefinedLocal = v => (v === undefined ? null : v);
  const normalizarNumero = raw => {
    if (raw === null || raw === undefined || raw === '') return null;
    const n = parseFloat(String(raw).replace(',', '.').trim());
    return Number.isFinite(n) ? n : null;
  };

  if (!usuarioAutenticadoId) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  const idClienteNum = aNumeroONuloLocal(id_cliente);
  const idContactoNum = aNumeroONuloLocal(id_contacto);
  const idDireccionNum = aNumeroONuloLocal(id_direccion_cliente);
  const idCondNum = aNumeroONuloLocal(id_condicion);

  if (!idClienteNum) {
    return res.status(400).json({ error: 'id_cliente es obligatorio para guardar un borrador' });
  }
  if (!idContactoNum) {
    return res.status(400).json({ error: 'id_contacto es obligatorio para guardar un borrador' });
  }

  const cotizacionModel = new Cotizacion(db);

  try {
    // resolver idCondicion por defecto si no vino
    let idCondFinal = idCondNum;
    let condicionSeleccionada = null;
    if (!idCondFinal) {
      const [prefRows] = await db.query(
        `SELECT id, forma_pago, tipo_cambio, dias_pago, mark_up_maximo, observaciones
         FROM condiciones_comerciales WHERE id_cliente = ? LIMIT 1`,
        [idClienteNum]
      );
      if (prefRows && prefRows[0]) {
        idCondFinal = aNumeroONuloLocal(prefRows[0].id);
        condicionSeleccionada = prefRows[0];
      }
    } else {
      // si vino id_condicion, leemos sus datos
      const [cRows] = await db.query(
        `SELECT id, forma_pago, tipo_cambio, dias_pago, mark_up_maximo, observaciones
         FROM condiciones_comerciales WHERE id = ? LIMIT 1`,
        [idCondFinal]
      );
      if (cRows && cRows[0]) condicionSeleccionada = cRows[0];
    }

    // calcular vigencia_hasta
    const fechaAhora = new Date();
    let vigenciaMySQL = null;
    const dias = aNumeroONuloLocal(dias_vencimiento);
    if (dias !== null) {
      const fechaVence = sumarDias(fechaAhora, dias);
      vigenciaMySQL = aMySQLDate(fechaVence); // formato YYYY-MM-DD
    } else if (vigencia_hasta) {
      const parsed = new Date(vigencia_hasta);
      const v = aMySQLDate(parsed);
      vigenciaMySQL = v;
    }

    // normalizar máximo de markup desde condiciones (si existe)
    const maxRaw = condicionSeleccionada?.mark_up_maximo ?? null;
    const maximoMarkup = normalizarNumero(maxRaw); // null => sin validación

    // validar productos recibidos respecto del máximo (si aplica)
    const productosBody = Array.isArray(productos) ? productos : [];
    if (maximoMarkup !== null && productosBody.length > 0) {
      for (const p of productosBody) {
        const ingreso = normalizarNumero(p.markup_ingresado ?? p.markup ?? 0) ?? 0;
        if (ingreso > maximoMarkup) {
          return res.status(400).json({
            error: `El markup del producto ${p.id_producto ?? p.id} (${ingreso}%) supera el máximo permitido (${maximoMarkup}%)`
          });
        }
      }
    }

    // Generar número y preparar cabecera
    const numero = await cotizacionModel.generarNumeroCotizacion();
    const fechaMysql = aMySQLDateTime(fechaAhora);

    const nuevaCabecera = {
      numero_cotizacion: numero,
      id_cliente: idClienteNum,
      id_contacto: idContactoNum,
      id_condicion: idCondFinal ?? null,
      fecha: fechaMysql,
      vigencia_hasta: vigenciaMySQL,
      observaciones: observaciones ?? '',
      plazo_entrega: plazo_entrega ?? '',
      costo_envio: costo_envio ?? 0,
      estado: 'borrador',
      id_direccion_cliente: idDireccionNum ?? null,
      id_usuario: usuarioAutenticadoId,
      modalidad_envio: nuloSiUndefinedLocal(modalidad_envio),
      vencimiento: nuloSiUndefinedLocal(vencimiento)
    };

    // Persistir cabecera + detalle dentro de transacción
    await db.query('START TRANSACTION');
    try {
      const [result] = await db.query(
        `INSERT INTO cotizaciones (
          numero_cotizacion, id_cliente, id_contacto, id_condicion, fecha,
          vigencia_hasta, observaciones, plazo_entrega, costo_envio,
          estado, id_direccion_cliente, id_usuario, modalidad_envio, vencimiento
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nuevaCabecera.numero_cotizacion,
          nuevaCabecera.id_cliente,
          nuevaCabecera.id_contacto,
          nuevaCabecera.id_condicion,
          nuevaCabecera.fecha,
          nuevaCabecera.vigencia_hasta,
          nuevaCabecera.observaciones,
          nuevaCabecera.plazo_entrega,
          nuevaCabecera.costo_envio,
          nuevaCabecera.estado,
          nuevaCabecera.id_direccion_cliente,
          nuevaCabecera.id_usuario,
          nuevaCabecera.modalidad_envio,
          nuevaCabecera.vencimiento
        ]
      );

      const idCotizacion = result.insertId;

      // Insertar productos (reemplazarProductos persiste markup_ingresado),
      // pero aquí los insertamos directamente para mantener la transacción
      if (productosBody.length > 0) {
        for (const item of productosBody) {
          const cantidad = Number(item.cantidad || 1);
          const precio_unitario = Number(item.precio_unitario ?? item.precio ?? 0);
          const descuento = Number(item.descuento ?? 0);
          const markup_ingresado = Number(item.markup_ingresado ?? item.markup ?? 0);
          const subtotal = (precio_unitario - descuento) * cantidad;
          const iva = 0;
          const total = subtotal;

          await db.query(
            `INSERT INTO detalle_cotizacion (
              id_cotizacion, id_producto, cantidad, precio_unitario,
              descuento, subtotal, iva, total_iva_incluido, markup_ingresado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              idCotizacion,
              item.id_producto,
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
      }

      await db.query('COMMIT');

      return res.status(201).json({
        id_cotizacion: idCotizacion,
        numero_cotizacion: numero,
        estado: 'borrador'
      });
    } catch (err) {
      await db.query('ROLLBACK');
      console.error('❌ Error al persistir cotización en transacción:', err);
      return res.status(500).json({ error: 'Error al guardar cotización' });
    }
  } catch (err) {
    console.error('❌ Error al iniciar cotización:', err);
    return res.status(500).json({ error: 'Error al iniciar cotización' });
  }
}

// Obtener cotizaciones en estado 'borrador' para un vendedor específico
export async function obtenerCotizacionesBorrador(req, res) {
  const db = req.app.get('db');
  const { id_usuario } = req.params;
  const cotizacionModel = new Cotizacion(db);
  try {
    const borradores = await cotizacionModel.obtenerBorradoresPorUsuario(id_usuario);
    console.log('Borradores encontrados:', borradores);
    res.json(borradores);
  } catch (err) {
    console.error('❌ Error en obtenerCotizacionesBorrador:', err);
    res.status(500).json({ error: 'Error al obtener cotizaciones en borrador' });
  }
}

// Finalizar cotización (actualiza cabecera y reemplaza productos) -> estado 'pendiente'
// Validaciones estrictas: contacto, dirección, condición y productos.
export async function finalizarCotizacion(req, res) {
  const db = req.app.get('db');
  const cotizacionId = req.params.id;
  const cotizacionModel = new Cotizacion(db);

  const {
    id_cliente,
    id_contacto,
    id_usuario,
    id_condicion,
    vigencia_hasta,
    observaciones,
    plazo_entrega,
    costo_envio,
    modalidad_envio,
    vencimiento,
    id_direccion_cliente,
    productos
  } = req.body;

  const idClienteNum = toNumberOrNull(id_cliente);
  const idContactoNum = toNumberOrNull(id_contacto);
  const idUsuarioNum = toNumberOrNull(id_usuario);
  const idCondNum = toNumberOrNull(id_condicion);
  const idDireccionNum = toNumberOrNull(id_direccion_cliente);

  if (!req.user?.id) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  if (!Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: 'La cotización debe tener al menos un producto para finalizar' });
  }

  if (!idClienteNum) {
    return res.status(400).json({ error: 'Cliente inválido o no especificado' });
  }
  if (!idContactoNum) {
    return res.status(400).json({ error: 'Debe asignarse un contacto antes de finalizar la cotización' });
  }
  if (!idDireccionNum) {
    return res.status(400).json({ error: 'Debe asignarse una dirección de entrega antes de finalizar la cotización' });
  }

  try {
    // Si no vino id_condicion, intentar obtener la condición por defecto del cliente
    let idCondFinal = idCondNum;
    if (!idCondFinal) {
      const [prefRows] = await db.query(
        `SELECT id FROM condiciones_comerciales WHERE id_cliente = ? LIMIT 1`,
        [idClienteNum]
      );
      if (prefRows && prefRows[0]) idCondFinal = toNumberOrNull(prefRows[0].id);
    }

    if (!idCondFinal) {
      return res.status(400).json({ error: 'Debe seleccionarse una condición comercial antes de finalizar la cotización' });
    }

    // Leer mark_up_maximo (referencia) usando idCondFinal
    let markUpMaximo = null;
    if (idCondFinal) {
      const [condRows] = await db.query(
        'SELECT mark_up_maximo FROM condiciones_comerciales WHERE id = ? AND id_cliente = ? LIMIT 1',
        [idCondFinal, idClienteNum]
      );
      if (condRows && condRows[0]) {
        const m = Number(condRows[0].mark_up_maximo);
        markUpMaximo = Number.isFinite(m) ? m : null;
      }
    }

    // Validar markups en productos
    for (const p of productos) {
      const markupIngresado = toNumberOrNull(p.markup_ingresado ?? p.markup) ?? 0;
      if (markUpMaximo !== null && markupIngresado > markUpMaximo) {
        return res.status(400).json({
          error: `El markup del producto ${p.id_producto} (${markupIngresado}%) supera el máximo permitido (${markUpMaximo}%)`
        });
      }
    }

    // Determinar id_usuario final (preferir body, si no usar usuario autenticado, si no leer DB)
    const usuarioAutenticadoId = req.user?.id ?? null;
    let idUsuarioFinal = toNumberOrNull(id_usuario) ?? usuarioAutenticadoId;
    if (!idUsuarioFinal) {
      const [row] = await db.query('SELECT id_usuario FROM cotizaciones WHERE id = ? LIMIT 1', [cotizacionId]);
      if (row && row[0] && row[0].id_usuario) idUsuarioFinal = row[0].id_usuario;
    }
    if (!idUsuarioFinal) {
      return res.status(400).json({ error: 'No se pudo determinar el usuario responsable de la cotización' });
    }

    // Actualizar cabecera (guardamos id_condicion y campos obligatorios)
    await cotizacionModel.actualizarCabecera(cotizacionId, {
      id_cliente: idClienteNum,
      id_contacto: idContactoNum,
      id_condicion: idCondFinal,
      fecha: new Date(),
      vigencia_hasta: vigencia_hasta ?? null,
      observaciones: observationsOrEmpty(observaciones),
      plazo_entrega: plazo_entrega ?? '',
      costo_envio: costo_envio ?? 0,
      estado: 'pendiente',
      id_direccion_cliente: idDireccionNum,
      id_usuario: idUsuarioFinal,
      modalidad_envio: nullOr(modalidad_envio),
      vencimiento: nullOr(vencimiento)
    });

    // Reemplazar productos (detalle debe persistir markup_ingresado)
    await cotizacionModel.reemplazarProductos(cotizacionId, productos);

    res.json({ mensaje: 'Cotización finalizada y enviada al cliente' });
  } catch (err) {
    console.error('❌ Error al finalizar cotización:', err);
    res.status(500).json({ error: 'Error al finalizar cotización' });
  }
}

// Devuelve toda la información de una cotización (cabecera + productos + condiciones)
export async function verCotizacionCompleta(req, res) {
  const db = req.app.get('db');
  const cotizacionModel = new Cotizacion(db);
  const { id } = req.params;

  try {
    const cotizacion = await cotizacionModel.obtenerCotizacionCompleta(id);
    res.json(cotizacion);
  } catch (err) {
    console.error('Error al obtener detalle de la cotización:', err);
    res.status(500).json({ error: 'Error al obtener detalle de la cotización' });
  }
}

// Obtener una cotización en estado 'borrador' por su ID para edición (cabecera + productos)
// Además devolvemos las condiciones del cliente para que el frontend pueda preseleccionar.
export async function obtenerCotizacionBorradorPorId(req, res) {
  const db = req.app.get('db');
  const cotizacionModel = new Cotizacion(db);
  const { id } = req.params;

  try {
    const cotizacion = await cotizacionModel.obtenerCotizacionParaEdicion(id);

    // intentar traer condiciones del cliente si existe cabecera y id_cliente
    let condicionesCliente = [];
    if (cotizacion?.cabecera?.id_cliente) {
      const [condRows] = await db.query(
        `SELECT id, forma_pago, tipo_cambio, dias_pago, mark_up_maximo
         FROM condiciones_comerciales
         WHERE id_cliente = ?`,
        [cotizacion.cabecera.id_cliente]
      );
      condicionesCliente = condRows || [];
    }

    res.json({ ...cotizacion, condiciones: condicionesCliente });
    console.log('Cotización recuperada:', cotizacion);
  } catch (err) {
    console.error('Error al obtener borrador:', err);
    res.status(500).json({ error: 'Error al obtener borrador' });
  }
}

// Actualiza una cotización en estado 'borrador' (cabecera y productos)
// Requeridos para actualizar borrador: usuario autenticado, id_cliente e id_contacto.
// El resto es flexible.
// controllers/cotizacionController.js (fragmento actualizarCotizacionBorrador traducido)
export async function actualizarCotizacionBorrador(req, res) {
  const db = req.app.get('db');
  const cotizacionModel = new Cotizacion(db);
  const { id } = req.params;
  const data = req.body;

  try {
    const usuarioAutenticadoId = req.user?.id ?? null;
    if (!usuarioAutenticadoId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Helpers locales
    const aNumeroONuloLocal = v => {
      if (v === null || v === undefined || v === '') return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    const nuloSiUndefinedLocal = v => (v === undefined ? null : v);
    const normalizarNumero = raw => {
      if (raw === null || raw === undefined || raw === '') return null;
      const n = parseFloat(String(raw).replace(',', '.').trim());
      return Number.isFinite(n) ? n : null;
    };

    const idClienteNum = aNumeroONuloLocal(data.id_cliente);
    // no sobrescribimos la direccion si no viene en body: fallback
    let idDireccionNum = aNumeroONuloLocal(data.id_direccion_cliente);
    const idCondNum = aNumeroONuloLocal(data.id_condicion);
    const idContactoNum = typeof data.id_contacto === 'object'
      ? aNumeroONuloLocal(data.id_contacto.id)
      : aNumeroONuloLocal(data.id_contacto);

    // Requeridos para guardar/actualizar borrador: cliente y contacto
    if (!idClienteNum) return res.status(400).json({ error: 'id_cliente es obligatorio para guardar un borrador' });
    if (!idContactoNum) return res.status(400).json({ error: 'id_contacto es obligatorio para guardar un borrador' });

    // fallback: si no viene idDireccionNum, leemos el valor actual en DB para no sobrescribirlo
    if (idDireccionNum === null) {
      const [cur] = await db.query('SELECT id_direccion_cliente FROM cotizaciones WHERE id = ? LIMIT 1', [id]);
      if (cur && cur[0]) idDireccionNum = cur[0].id_direccion_cliente ?? null;
    }

    // fallback para id_condicion y obtener datos de la condición (mark_up_maximo)
    let idCondFinal = idCondNum;
    let condicionSeleccionada = null;
    if (idCondFinal === null) {
      const [cur2] = await db.query('SELECT id_condicion FROM cotizaciones WHERE id = ? LIMIT 1', [id]);
      if (cur2 && cur2[0]) idCondFinal = cur2[0].id_condicion ?? null;
    }
    if (idCondFinal !== null) {
      const [cRows] = await db.query(
        `SELECT id, forma_pago, tipo_cambio, dias_pago, mark_up_maximo, observaciones
         FROM condiciones_comerciales WHERE id = ? LIMIT 1`,
        [idCondFinal]
      );
      if (cRows && cRows[0]) condicionSeleccionada = cRows[0];
    }

    // calcular vigencia_hasta según días si vienen
    const diasVenc = aNumeroONuloLocal(data.dias_vencimiento ?? data.plazo_entrega_dias) ?? null;
    let vigenciaMySQL = null;
    if (diasVenc !== null) {
      const base = data.fecha ? new Date(data.fecha) : new Date();
      const vence = sumarDias(base, diasVenc);
      vigenciaMySQL = aMySQLDate(vence);
    } else if (data.vigencia_hasta) {
      vigenciaMySQL = aMySQLDate(new Date(data.vigencia_hasta));
    } else {
      // mantener la vigencia actual si no viene en body
      const [cur3] = await db.query('SELECT vigencia_hasta FROM cotizaciones WHERE id = ? LIMIT 1', [id]);
      if (cur3 && cur3[0]) vigenciaMySQL = cur3[0].vigencia_hasta ?? null;
    }

    // Determinar id_usuario final (preferir data.id_usuario, si no usar usuario autenticado)
    let idUsuarioFinal = aNumeroONuloLocal(data.id_usuario) ?? usuarioAutenticadoId;
    if (!idUsuarioFinal) {
      const [row] = await db.query('SELECT id_usuario FROM cotizaciones WHERE id = ? LIMIT 1', [id]);
      if (row && row[0] && row[0].id_usuario) idUsuarioFinal = row[0].id_usuario;
    }
    if (!idUsuarioFinal) {
      return res.status(400).json({ error: 'No se pudo determinar el usuario responsable de la cotización' });
    }

    // Preparar cabecera para update (guardamos id_condicion si existe; resto flexible)
    const cabecera = {
      id_cliente: idClienteNum,
      id_contacto: idContactoNum,
      id_direccion_cliente: idDireccionNum ?? null,
      id_condicion: idCondFinal ?? null,
      fecha: aMySQLDateTime(new Date()),
      vigencia_hasta: vigenciaMySQL,
      observaciones: data.observaciones ?? '',
      plazo_entrega: data.plazo_entrega ?? '',
      costo_envio: data.costo_envio ?? 0,
      estado: data.estado || 'borrador',
      id_usuario: idUsuarioFinal,
      modalidad_envio: data.modalidad_envio ?? null,
      vencimiento: data.vencimiento ?? null
    };

    // Obtener productos recibidos
    const productosBody = Array.isArray(data.productos) ? data.productos : [];

    // Normalizar maximo de markup y validar productos antes de persistir
    const maxRaw = condicionSeleccionada?.mark_up_maximo ?? null;
    const maximoMarkup = normalizarNumero(maxRaw); // null => no validar

    if (maximoMarkup !== null && productosBody.length > 0) {
      for (const p of productosBody) {
        const ingreso = normalizarNumero(p.markup_ingresado ?? p.markup ?? 0) ?? 0;
        if (ingreso > maximoMarkup) {
          return res.status(400).json({
            error: `El markup del producto ${p.id_producto ?? p.id} (${ingreso}%) supera el máximo permitido (${maximoMarkup}%)`
          });
        }
      }
    }

    // Persistir cabecera + detalle dentro de transacción
    await db.query('START TRANSACTION');
    try {
      // actualizar cabecera
      await cotizacionModel.actualizarCabecera(id, cabecera);

      // reemplazar productos: borramos detalle y reinsertamos incluyendo markup_ingresado
      // usamos queries directas dentro de la transacción para asegurar atomicidad
      await db.query('DELETE FROM detalle_cotizacion WHERE id_cotizacion = ?', [id]);

      if (productosBody.length > 0) {
        for (const item of productosBody) {
          const cantidad = Number(item.cantidad || 1);
          const precio_unitario = Number(item.precio_unitario ?? item.precio ?? 0);
          const descuento = Number(item.descuento ?? 0);
          const markup_ingresado = Number(item.markup_ingresado ?? item.markup ?? 0);
          const subtotal = parseFloat(((precio_unitario - descuento) * cantidad).toFixed(2));
          const iva = 0;
          const total = subtotal;

          await db.query(
            `INSERT INTO detalle_cotizacion (
              id_cotizacion, id_producto, cantidad, precio_unitario,
              descuento, subtotal, iva, total_iva_incluido, markup_ingresado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              item.id_producto,
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
      }

      await db.query('COMMIT');
      return res.json({ mensaje: 'Cotización actualizada como borrador' });
    } catch (err) {
      await db.query('ROLLBACK');
      console.error('❌ Error al persistir actualización en transacción:', err);
      return res.status(500).json({ error: 'Error al actualizar borrador' });
    }
  } catch (err) {
    console.error('❌ Error al actualizar borrador:', err);
    res.status(500).json({ error: 'Error al actualizar borrador' });
  }
}

// Helpers locales
function observationsOrEmpty(v) {
  // Aceptar '' como texto vacío; evitar undefined
  return v === undefined ? '' : v;
}