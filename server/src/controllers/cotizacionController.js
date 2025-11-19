// controllers/cotizacionController.js
import { Cotizacion } from '../models/CotizacionModels.js';
import { aMySQLDateTime, aMySQLDate, sumarDias } from '../utils/helperDeFecha.js';
import { getEstadoId } from './estadosControllers.js';



// Helpers locales
function observationsOrEmpty(v) {
  // Aceptar '' como texto vacío; evitar undefined
  return v === undefined ? '' : v;
}

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
        const ingreso = normalizarNumero(p.markup_ingresado);
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

    // resolver id_estado de 'borrador'
    const idEstadoBorrador = await getEstadoId(db, 'borrador');
    if (!idEstadoBorrador) {
      return res.status(500).json({ error: 'Estado borrador no configurado en la base de datos' });
    }

    const nuevaCabecera = {
      numero_cotizacion: numero,
      id_cliente: idClienteNum,
      id_contacto: idContactoNum,
      id_condicion: idCondFinal ?? null,
      fecha: fechaMysql,
      // para borrador preferimos no persistir vigencia/vencimiento salvo que lo quieras explícito
      vigencia_hasta: null,
      observaciones: observaciones ?? '',
      plazo_entrega: plazo_entrega ?? '',
      costo_envio: costo_envio ?? 0,
      id_estado: idEstadoBorrador,
      id_direccion_cliente: idDireccionNum ?? null,
      id_usuario: usuarioAutenticadoId,
      modalidad_envio: nuloSiUndefinedLocal(modalidad_envio),
      vencimiento: null
    };

    // Persistir cabecera + detalle dentro de transacción
    await db.query('START TRANSACTION');
    try {
      const [result] = await db.query(
        `INSERT INTO cotizaciones (
          numero_cotizacion, id_cliente, id_contacto, id_condicion, fecha,
          vigencia_hasta, observaciones, plazo_entrega, costo_envio,
          id_estado, id_direccion_cliente, id_usuario, modalidad_envio, vencimiento
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
          nuevaCabecera.id_estado,
          nuevaCabecera.id_direccion_cliente,
          nuevaCabecera.id_usuario,
          nuevaCabecera.modalidad_envio,
          nuevaCabecera.vencimiento
        ]
      );

      const idCotizacion = result.insertId;

      const [clienteRows] = await db.query(
        'SELECT razon_social, cuit FROM cliente WHERE id = ? LIMIT 1',
        [idClienteNum]
      );
      const clienteNombreReal = clienteRows[0]?.razon_social ?? '';

      const [contactoRows] = await db.query(
        `SELECT nombre_contacto, apellido AS contacto_apellido, email FROM contactos WHERE id = ?`,
        [idContactoNum]
      );
      const contacto = contactoRows[0] ?? {};

      // Insertar productos (reemplazarProductos persiste markup_ingresado),
      if (productosBody.length > 0) {
        for (const item of productosBody) {
          const cantidad = Number(item.cantidad || 1);
          const precio_unitario = Number(item.precio_unitario ?? item.precio ?? 0);
          const descuento = Number(item.descuento ?? 0);
          const markup_ingresado = aNumeroONuloLocal(item.markup_ingresado);
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
        estado: 'borrador',
        cliente: {
          nombre: clienteNombreReal, // ✅ nombre del cliente
          cuit: clienteRows[0]?.cuit ?? '',
          contacto_nombre: contacto.nombre_contacto ?? '',
          contacto_apellido: contacto.contacto_apellido ?? '',
          email: contacto.email ?? ''
        }
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
  const idContactoNum = typeof id_contacto === 'object'
    ? toNumberOrNull(id_contacto.id)
    : toNumberOrNull(id_contacto);
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
    // resolver id_condicion por defecto si no vino
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
      const markupIngresado = toNumberOrNull(p.markup_ingresado);
      if (markUpMaximo !== null && markupIngresado > markUpMaximo) {
        return res.status(400).json({
          error: `El markup del producto ${p.id_producto} (${markupIngresado}%) supera el máximo permitido (${markUpMaximo}%)`
        });
      }
    }

    // Determinar id_usuario final (preferir body, si no usar usuario autenticado)
    const usuarioAutenticadoId = req.user?.id ?? null;
    let idUsuarioFinal = toNumberOrNull(id_usuario) ?? usuarioAutenticadoId;
    if (!idUsuarioFinal) {
      const [row] = await db.query('SELECT id_usuario FROM cotizaciones WHERE id = ? LIMIT 1', [cotizacionId]);
      if (row && row[0] && row[0].id_usuario) idUsuarioFinal = row[0].id_usuario;
    }
    if (!idUsuarioFinal) {
      return res.status(400).json({ error: 'No se pudo determinar el usuario responsable de la cotización' });
    }

    // --- calcular vigencia_hasta correctamente ---
    let vigenciaHastaSQL = null;
    const vencimientoDias = toNumberOrNull(vencimiento ?? null);

    if (vencimientoDias !== null) {
      const [rowFecha] = await db.query('SELECT fecha FROM cotizaciones WHERE id = ? LIMIT 1', [cotizacionId]);
      const fechaOrigen = (rowFecha && rowFecha[0] && rowFecha[0].fecha) ? new Date(rowFecha[0].fecha) : new Date();
      const fechaVence = sumarDias(fechaOrigen, vencimientoDias);
      vigenciaHastaSQL = aMySQLDate(fechaVence); // YYYY-MM-DD
    } else if (vigencia_hasta) {
      const parsed = new Date(vigencia_hasta);
      if (!isNaN(parsed.getTime())) {
        vigenciaHastaSQL = aMySQLDate(parsed);
      } else {
        return res.status(400).json({ error: 'vigencia_hasta inválida' });
      }
    } else {
      return res.status(400).json({ error: 'Debe indicarse vencimiento (días) o vigencia_hasta para finalizar la cotización' });
    }

    // resolver id_estado pendiente
    const idEstadoPendiente = await getEstadoId(db, 'pendiente');
    if (!idEstadoPendiente) {
      return res.status(500).json({ error: 'Estado pendiente no configurado en la base de datos' });
    }

    // Actualizar cabecera con id_estado numérico y vigencia_hasta calculada
    await cotizacionModel.actualizarCabecera(cotizacionId, {
      id_cliente: idClienteNum,
      id_contacto: idContactoNum,
      id_condicion: idCondFinal,
      fecha: new Date(),
      vigencia_hasta: vigenciaHastaSQL,
      observaciones: observationsOrEmpty(observaciones),
      plazo_entrega: plazo_entrega ?? '',
      costo_envio: costo_envio ?? 0,
      id_estado: idEstadoPendiente,
      id_direccion_cliente: idDireccionNum,
      id_usuario: idUsuarioFinal,
      modalidad_envio: nullOr(modalidad_envio),
      vencimiento: vencimientoDias !== null ? vencimientoDias : null
    });

    // Reemplazar productos (detalle debe persistir markup_ingresado)
    await cotizacionModel.reemplazarProductos(cotizacionId, productos);

    const [clienteRows] = await db.query(
      'SELECT razon_social, cuit FROM cliente WHERE id = ? LIMIT 1',
      [idClienteNum]
    );
    const clienteNombreReal = clienteRows[0]?.razon_social ?? '';

    // Obtener email del contacto
    const [contactoRows] = await db.query(
      `SELECT nombre_contacto, apellido AS contacto_apellido, email FROM contactos WHERE id = ?`,
      [idContactoNum]
    );
    const contacto = contactoRows[0] ?? {};


    // Obtener número de cotización
    const [numRows] = await db.query(
      'SELECT numero_cotizacion FROM cotizaciones WHERE id = ? LIMIT 1',
      [cotizacionId]
    );
    const numeroCotizacion = numRows[0]?.numero_cotizacion ?? '';

    // Enriquecer productos con decorativos
    const productosDecorados = await Promise.all(productos.map(async p => {
      const [decoradoRows] = await db.query(
        'SELECT marca, categoria, subcategoria FROM productos WHERE id = ? LIMIT 1',
        [p.id_producto]
      );
      const decorado = decoradoRows[0] ?? {};
      return {
        ...p,
        marca: decorado.marca ?? '',
        categoria: decorado.categoria ?? '',
        subcategoria: decorado.subcategoria ?? ''
      };
    }));

    // Respuesta final
    const respuestaFinal = {
      mensaje: 'Cotización finalizada y enviada al cliente',
      estado: 'pendiente',
      id_cotizacion: cotizacionId,
      numero_cotizacion: numeroCotizacion,
      cliente: {
        nombre: clienteNombreReal,
        cuit: clienteRows[0]?.cuit ?? '',
        contacto_nombre: contacto.nombre_contacto ?? '',
        contacto_apellido: contacto.contacto_apellido ?? '',
        email: contacto.email ?? ''
      },
      productos: productosDecorados
    };

    console.log('🧾 Respuesta enviada al frontend:\n', JSON.stringify(respuestaFinal, null, 2));

    res.json(respuestaFinal);

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
    let clienteNombreReal = '';
    let clienteRows = [];

    if (cotizacion?.cabecera?.id_cliente) {
      const [clienteRows] = await db.query(
        'SELECT razon_social, cuit FROM cliente WHERE id = ? LIMIT 1',
        [cotizacion.cabecera.id_cliente]
      );
      clienteNombreReal = clienteRows[0]?.razon_social ?? '';
    }

    let contacto = {};
    let idContactoNum = null;

    if (typeof cotizacion?.cabecera?.id_contacto === 'object') {
      idContactoNum = toNumberOrNull(cotizacion.cabecera.id_contacto.id);
    } else {
      idContactoNum = toNumberOrNull(cotizacion.cabecera.id_contacto);
    }

    if (idContactoNum) {
      const [contactoRows] = await db.query(
        `SELECT nombre_contacto, apellido AS contacto_apellido, email FROM contactos WHERE id = ?`,
        [idContactoNum]
      );
      contacto = contactoRows[0] ?? {};
    }


    if (cotizacion?.cabecera?.id_contacto) {
      const [contactoRows] = await db.query(
        `SELECT nombre_contacto, apellido AS contacto_apellido, email FROM contactos WHERE id = ?`,
        [cotizacion.cabecera.id_contacto]
      );
      contacto = contactoRows[0] ?? {};
    }

    const productosDecorados = await Promise.all((cotizacion.productos || []).map(async p => {
      const [decoradoRows] = await db.query(
        'SELECT marca, categoria, subcategoria FROM productos WHERE id = ? LIMIT 1',
        [p.id_producto]
      );
      const decorado = decoradoRows[0] ?? {};
      return {
        ...p,
        marca: decorado.marca ?? '',
        categoria: decorado.categoria ?? '',
        subcategoria: decorado.subcategoria ?? ''
      };
    }));

    cotizacion.productos = productosDecorados;



    res.json({
      ...cotizacion,
      numero_cotizacion: cotizacion?.cabecera?.numero_cotizacion ?? '',
      cliente: {
        nombre: clienteNombreReal, // ✅ razón social del cliente
        cuit: clienteRows[0]?.cuit ?? '',
        contacto_nombre: contacto.nombre_contacto ?? '',
        contacto_apellido: contacto.contacto_apellido ?? '',
        email: contacto.email ?? ''
      }
    });

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

    let clienteNombreReal = '';
    let clienteRows = [];
    if (cotizacion?.cabecera?.id_cliente) {
      const [clienteRows] = await db.query(
        'SELECT razon_social, cuit FROM cliente WHERE id = ? LIMIT 1',
        [cotizacion.cabecera.id_cliente]
      );
      clienteNombreReal = clienteRows[0]?.razon_social ?? '';
    }

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


    let contacto = {};
    let idContactoNum = null;

    if (typeof cotizacion?.cabecera?.id_contacto === 'object') {
      idContactoNum = Number(cotizacion.cabecera.id_contacto.id);
    } else {
      idContactoNum = Number(cotizacion.cabecera.id_contacto);
    }

    if (Number.isFinite(idContactoNum)) {
      const [contactoRows] = await db.query(
        `SELECT nombre_contacto, apellido AS contacto_apellido, email FROM contactos WHERE id = ?`,
        [idContactoNum]
      );
      contacto = contactoRows[0] ?? {};
    }




    const productosEnriquecidos = await Promise.all(
      (cotizacion.productos || []).map(async p => {
        const [decoradoRows] = await db.query(
          `SELECT marca, categoria, subcategoria FROM productos WHERE id = ? LIMIT 1`,
          [p.id_producto]
        );
        const decorado = decoradoRows[0] ?? {};

        return {
          ...p,
          detalle: p.detalle ?? decorado.nombre ?? '[Sin nombre]',
          marca: decorado.marca ?? '',
          categoria: decorado.categoria ?? '',
          subcategoria: decorado.subcategoria ?? ''
        };
      })
    );

    cotizacion.productos = productosEnriquecidos;

    const numeroCotizacion = cotizacion?.cabecera?.numero_cotizacion ?? '';
    console.log('🧪 contacto resuelto:', contacto);
    res.json({
      ...cotizacion,
      numero_cotizacion: numeroCotizacion,
      condiciones: condicionesCliente,
      cliente: {
        nombre: clienteNombreReal, // ✅ razón social del cliente
        cuit: clienteRows[0]?.cuit ?? '',
        contacto_nombre: contacto.nombre_contacto ?? '',
        contacto_apellido: contacto.contacto_apellido ?? '',
        email: contacto.email ?? ''
      }
    });

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

    // Helpers de normalización
    const aNumeroONuloLocal = v => {
      if (v === null || v === undefined || v === '') return null;
      const n = Number(String(v).replace(',', '.').trim());
      return Number.isFinite(n) ? n : null;
    };
    const normalizarNumero = raw => {
      if (raw === null || raw === undefined || raw === '') return null;
      const n = parseFloat(String(raw).replace(',', '.').trim());
      return Number.isFinite(n) ? n : null;
    };

    const idClienteNum = aNumeroONuloLocal(data.id_cliente);
    let idDireccionNum = aNumeroONuloLocal(data.id_direccion_cliente);
    const idCondNum = aNumeroONuloLocal(data.id_condicion);
    const idContactoNum = typeof data.id_contacto === 'object'
      ? aNumeroONuloLocal(data.id_contacto.id)
      : aNumeroONuloLocal(data.id_contacto);

    if (!idClienteNum) return res.status(400).json({ error: 'id_cliente es obligatorio para guardar un borrador' });
    if (!idContactoNum) return res.status(400).json({ error: 'id_contacto es obligatorio para guardar un borrador' });

    if (idDireccionNum === null) {
      const [cur] = await db.query('SELECT id_direccion_cliente FROM cotizaciones WHERE id = ? LIMIT 1', [id]);
      if (cur && cur[0]) idDireccionNum = cur[0].id_direccion_cliente ?? null;
    }

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

    const diasVenc = aNumeroONuloLocal(data.dias_vencimiento ?? data.plazo_entrega_dias) ?? null;
    let vigenciaMySQL = null;
    if (diasVenc !== null) {
      const base = data.fecha ? new Date(data.fecha) : new Date();
      const vence = sumarDias(base, diasVenc);
      vigenciaMySQL = aMySQLDate(vence);
    } else if (data.vigencia_hasta) {
      vigenciaMySQL = aMySQLDate(new Date(data.vigencia_hasta));
    } else {
      const [cur3] = await db.query('SELECT vigencia_hasta FROM cotizaciones WHERE id = ? LIMIT 1', [id]);
      if (cur3 && cur3[0]) vigenciaMySQL = cur3[0].vigencia_hasta ?? null;
    }

    let idUsuarioFinal = aNumeroONuloLocal(data.id_usuario) ?? usuarioAutenticadoId;
    if (!idUsuarioFinal) {
      const [row] = await db.query('SELECT id_usuario FROM cotizaciones WHERE id = ? LIMIT 1', [id]);
      if (row && row[0] && row[0].id_usuario) idUsuarioFinal = row[0].id_usuario;
    }
    if (!idUsuarioFinal) {
      return res.status(400).json({ error: 'No se pudo determinar el usuario responsable de la cotización' });
    }

    let idEstadoFinal = null;
    if (data.id_estado !== undefined && data.id_estado !== null) {
      idEstadoFinal = aNumeroONuloLocal(data.id_estado);
    } else if (data.estado) {
      idEstadoFinal = await getEstadoId(db, data.estado);
    } else {
      const [cur4] = await db.query('SELECT id_estado FROM cotizaciones WHERE id = ? LIMIT 1', [id]);
      if (cur4 && cur4[0]) idEstadoFinal = cur4[0].id_estado ?? null;
    }

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
      id_estado: idEstadoFinal,
      id_usuario: idUsuarioFinal,
      modalidad_envio: data.modalidad_envio ?? null,
      vencimiento: data.vencimiento ?? null
    };

    const productosBody = Array.isArray(data.productos) ? data.productos : [];

    const maxRaw = condicionSeleccionada?.mark_up_maximo ?? null;
    const maximoMarkup = normalizarNumero(maxRaw);

    if (maximoMarkup !== null && productosBody.length > 0) {
      for (const p of productosBody) {
        const ingreso = aNumeroONuloLocal(p.markup_ingresado);
        if (ingreso !== null && ingreso > maximoMarkup) {
          return res.status(400).json({
            error: `El markup del producto ${p.id_producto ?? p.id} (${ingreso}%) supera el máximo permitido (${maximoMarkup}%)`
          });
        }
      }
    }

    await db.query('START TRANSACTION');
    try {
      await cotizacionModel.actualizarCabecera(id, cabecera);
      await db.query('DELETE FROM detalle_cotizacion WHERE id_cotizacion = ?', [id]);

      if (productosBody.length > 0) {
        for (const item of productosBody) {
          const cantidad = Number(item.cantidad || 1);
          const precio_unitario = Number(item.precio_unitario ?? item.precio ?? 0);
          const descuento = Number(item.descuento ?? 0);
          const markup_ingresado = aNumeroONuloLocal(item.markup_ingresado);
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

      const [prodRows] = await db.query(
        `SELECT
           dc.id AS id_detalle,
           dc.id_producto,
           dc.cantidad,
           dc.precio_unitario,
           dc.descuento,
           dc.subtotal,
           p.tasa_iva AS tasa_iva,
           p.part_number,
           p.detalle AS detalle,
           dc.markup_ingresado
         FROM detalle_cotizacion dc
         LEFT JOIN productos p ON p.id = dc.id_producto
         WHERE dc.id_cotizacion = ? ORDER BY dc.id`,
        [id]
      );

      const productosResp = (prodRows || []).map(r => ({
        id_detalle: r.id_detalle,
        id_producto: r.id_producto,
        cantidad: r.cantidad,
        precio_unitario: r.precio_unitario,
        descuento: r.descuento,
        subtotal: r.subtotal,
        tasa_iva: r.tasa_iva ?? null,
        part_number: r.part_number ?? null,
        detalle: r.detalle ?? null,
        markup_ingresado: r.markup_ingresado
      }));
      const productosDecorados = await Promise.all(productosResp.map(async p => {
        const [decoradoRows] = await db.query(
          'SELECT marca, categoria, subcategoria FROM productos WHERE id = ? LIMIT 1',
          [p.id_producto]
        );
        const decorado = decoradoRows[0] ?? {};
        return {
          ...p,
          marca: decorado.marca ?? '',
          categoria: decorado.categoria ?? '',
          subcategoria: decorado.subcategoria ?? ''
        };
      }));


      // ✅ Enriquecer cabecera decorativa
      const { cabecera: cabeceraDecorada } = await cotizacionModel.obtenerCotizacionParaEdicion(id);
      let clienteNombreReal = '';
      let clienteRows = [];

      if (cabeceraDecorada?.id_cliente) {
        const [clienteRows] = await db.query(
          'SELECT razon_social, cuit FROM cliente WHERE id = ? LIMIT 1',
          [cabeceraDecorada.id_cliente]
        );
        clienteNombreReal = clienteRows[0]?.razon_social ?? '';
      }


      let idContactoFinal = idContactoNum;

      if (idContactoFinal === null) {
        const [row] = await db.query('SELECT id_contacto FROM cotizaciones WHERE id = ? LIMIT 1', [id]);
        if (row && row[0]) idContactoFinal = aNumeroONuloLocal(row[0].id_contacto);
      }

      let contacto = {};
      if (idContactoFinal !== null) {
        const [contactoRows] = await db.query(
          `SELECT nombre_contacto, apellido AS contacto_apellido, email FROM contactos WHERE id = ?`,
          [idContactoFinal]
        );
        contacto = contactoRows[0] ?? {};

      }

      const numeroCotizacion = cabeceraDecorada?.numero_cotizacion ?? '';

      return res.json({
        mensaje: 'Cotización actualizada como borrador',
        cotizacion: {
          id: Number(id),
          numero_cotizacion: numeroCotizacion,
          cabecera: cabeceraDecorada,
          productos: productosDecorados, // ✅ productos enriquecidos
          cliente: {
            nombre: clienteNombreReal,
            cuit: clienteRows?.[0]?.cuit ?? '',
            contacto_nombre: contacto.nombre_contacto ?? '',
            contacto_apellido: contacto.contacto_apellido ?? '',
            email: contacto.email ?? ''
          }
        }
      });



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


//cambiar estado de una cotizacion
export async function marcarCotizacionComoPendiente(req, res) {
  const db = req.app.get('db');
  const { id } = req.params;

  try {
    const id_estado = await getEstadoId(db, 'PENDIENTE');
    if (!id_estado) return res.status(404).json({ error: 'Estado "PENDIENTE" no encontrado' });

    await db.query('UPDATE cotizaciones SET id_estado = ? WHERE id_cotizacion = ?', [id_estado, id]);
    res.json({ mensaje: 'Cotización marcada como pendiente' });
  } catch (err) {
    console.error('Error al marcar como pendiente:', err);
    res.status(500).json({ error: 'No se pudo actualizar el estado' });
  }
}

