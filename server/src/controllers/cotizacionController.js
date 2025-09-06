// controllers/cotizacionController.js
import { Cotizacion } from '../models/CotizacionModels.js';


//iniciar una nueva cotizacion Crea una nueva cotización en estado  con número autogenerado 'borrador'
export async function iniciarCotizacion(req, res) {
  const db = req.app.get('db');
  const { id_vendedor, id_cliente } = req.body; // extrae id_vendedor e id_cliente del cuerpo de la solicitud
  const cotizacionModel = new Cotizacion(db);

  try {
    const numero = await cotizacionModel.generarNumeroCotizacion(); // Genera un nuevo número de cotización
    const fecha = new Date();

    const idCotizacion = await cotizacionModel.crearCabecera({
      numero_cotizacion: numero,
      fecha,
      estado: 'borrador',
      id_vendedor,
      id_cliente
    });

    res.status(201).json({
      id_cotizacion: idCotizacion,
      numero_cotizacion: numero,
      estado: 'borrador'
    });
  } catch (err) {
  console.error("Error al iniciar cotización:", err); // 👈 Esto te muestra el error real
  res.status(500).json({ error: 'Error al iniciar cotización' });
}
  }

// Obtener cotizaciones en estado 'borrador' para un vendedor específico
export async function obtenerCotizacionesBorrador(req, res) {
  const db = req.app.get('db');
  const { id_vendedor } = req.params;
  const cotizacionModel = new Cotizacion(db);

  try {
    const borradores = await cotizacionModel.obtenerBorradoresPorVendedor(id_vendedor);
    res.json(borradores);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener cotizaciones en borrador' });
  }
}

// Actualiza la cabecera, agrega productos y cambia el estado a 'pendiente'
export async function finalizarCotizacion(req, res) {
  const db = req.app.get('db');
  const cotizacionId = req.params.id;
  const cotizacionModel = new Cotizacion(db);

  // Datos esperados en el cuerpo de la solicitud
  const {
    id_cliente, id_contacto, id_condicion,
    vigencia_hasta, observaciones, plazo_entrega,
    costo_envio, productos
  } = req.body;

  try {
    await cotizacionModel.actualizarCabecera(cotizacionId, {  
      id_cliente, id_contacto, id_condicion,
      vigencia_hasta, observaciones, plazo_entrega,
      costo_envio, estado: 'pendiente'
    });

    await cotizacionModel.agregarDetalle(cotizacionId, productos);  // Agrega los detalles de los productos a la cotización

    res.json({ mensaje: 'Cotización finalizada y enviada al cliente' }); // Respuesta exitosa

  } catch (err) {
  console.error("Error al finalizar cotización:", err);
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
