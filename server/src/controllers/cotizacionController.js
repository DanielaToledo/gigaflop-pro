// controllers/cotizacionController.js
import { Cotizacion } from '../models/CotizacionModels.js';


//iniciar una nueva cotizacion Crea una nueva cotización en estado  con número autogenerado 'borrador'
export async function iniciarCotizacion(req, res) {
  const db = req.app.get('db');
  const id_usuario = req.user?.id;
  const { id_cliente, id_contacto, productos = [], id_direccion_cliente } = req.body;

  // 🔒 Validación de autenticación
  if (!id_usuario) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  // 🔒 Validación de cliente
  if (!id_cliente || typeof id_cliente !== 'number') {
    return res.status(400).json({ error: 'Cliente inválido o no especificado' });
  }

  // 🔒 Validación de dirección (opcional pero recomendable)
  if (!id_direccion_cliente || typeof id_direccion_cliente !== 'number') {
    return res.status(400).json({ error: 'Dirección del cliente inválida o no especificada' });
  }

  const cotizacionModel = new Cotizacion(db);
  const contactoId = typeof id_contacto === 'string' ? parseInt(id_contacto) : id_contacto;

  try {
    const numero = await cotizacionModel.generarNumeroCotizacion();
    const fecha = new Date();

    const nuevaCabecera = {
      numero_cotizacion: numero,
      id_usuario,
      fecha,
      estado: 'borrador',
      id_cliente,
      id_contacto: contactoId,
      id_direccion_cliente
    };

    console.log('🧪 Datos enviados a crearCabecera:', nuevaCabecera);

    const idCotizacion = await cotizacionModel.crearCabecera(nuevaCabecera);

    if (Array.isArray(productos) && productos.length > 0) {
      await cotizacionModel.reemplazarProductos(idCotizacion, productos);
    }

    res.status(201).json({
      id_cotizacion: idCotizacion,
      numero_cotizacion: numero,
      estado: 'borrador'
    });
  } catch (err) {
    console.error("❌ Error al iniciar cotización:", err);
    res.status(500).json({ error: 'Error al iniciar cotización' });
  }
}


// Obtener cotizaciones en estado 'borrador' para un vendedor específico
export async function obtenerCotizacionesBorrador(req, res) {
  const db = req.app.get('db');
  const { id_usuario } = req.params; // Obtener id_vendedor de los parámetros de la ruta
  const cotizacionModel = new Cotizacion(db); // Crear instancia del modelo Cotizacion pasando la conexión a la base de datos
  try {
    const borradores = await cotizacionModel.obtenerBorradoresPorUsuario(id_usuario);
    console.log('Borradores encontrados:', borradores);
    res.json(borradores);
  } catch (err) {
    console.error('❌ Error en obtenerCotizacionesBorrador:', err);
    res.status(500).json({ error: 'Error al obtener cotizaciones en borrador' });
  }
}

// Actualiza la cabecera, agrega productos y cambia el estado a 'pendiente'
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
    productos
  } = req.body;

  try {
    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: 'La cotización debe tener al menos un producto' });
    }

    await cotizacionModel.actualizarCabecera(cotizacionId, {
      id_cliente,
      id_contacto,
      id_usuario,
      id_condicion,
      vigencia_hasta,
      observaciones,
      plazo_entrega,
      costo_envio,
      estado: 'pendiente',
      fecha_envio: new Date()
    });

    await cotizacionModel.reemplazarProductos(cotizacionId, productos);

    res.json({ mensaje: 'Cotización finalizada y enviada al cliente' });
  } catch (err) {
    console.error("❌ Error al finalizar cotización:", err);
    res.status(500).json({ error: 'Error al finalizar cotización' });
  }
}

//Devuelve toda la información de una cotización (cabecera + productos + condiciones)
export async function verCotizacionCompleta(req, res) {
  const db = req.app.get('db');
  const cotizacionModel = new Cotizacion(db);
  const { id } = req.params;

  try {
    const cotizacion = await cotizacionModel.obtenerCotizacionCompleta(id);
    res.json(cotizacion);
  } catch (err) {
    console.error("Error al obtener detalle de la cotización:", err);
    res.status(500).json({ error: 'Error al obtener detalle de la cotización' });
  }
}

// Obtener una cotización en estado 'borrador' por su ID para edición
export async function obtenerCotizacionBorradorPorId(req, res) {
  const db = req.app.get('db');
  const cotizacionModel = new Cotizacion(db);
  const { id } = req.params;

  try {
    const cotizacion = await cotizacionModel.obtenerCotizacionParaEdicion(id);
    res.json(cotizacion);
    console.log('Cotización recuperada:', cotizacion);


  } catch (err) {
    console.error("Error al obtener borrador:", err);
    res.status(500).json({ error: 'Error al obtener borrador' });
  }
}


// Actualiza una cotización en estado 'borrador' (cabecera y productos)
export async function actualizarCotizacionBorrador(req, res) {
  const db = req.app.get('db');
  const cotizacionModel = new Cotizacion(db);
  const { id } = req.params;
  const data = req.body;

  try {
   const cabecera = {
  id_cliente: data.id_cliente,
  id_contacto: typeof data.id_contacto === 'object' ? data.id_contacto.id : data.id_contacto,
  id_direccion_cliente: data.id_direccion_cliente,
  id_condicion: data.id_condicion,
  vigencia_hasta: data.vigencia_hasta,
  observaciones: data.observaciones,
  plazo_entrega: data.plazo_entrega,
  costo_envio: data.costo_envio,
  estado: data.estado || 'borrador'
};

    await cotizacionModel.actualizarCabecera(id, cabecera);

    console.log('🧪 Productos recibidos en el backend:', data.productos);

    if (Array.isArray(data.productos) && data.productos.length > 0) {
      await cotizacionModel.reemplazarProductos(id, data.productos);
    }

    res.json({ mensaje: 'Cotización actualizada como borrador' });
  } catch (err) {
    console.error("❌ Error al actualizar borrador:", err);
    res.status(500).json({ error: 'Error al actualizar borrador' });
  }
}