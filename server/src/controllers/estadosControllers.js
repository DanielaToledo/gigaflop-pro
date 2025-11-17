// controllers/estadoControllers.js
import { EstadoModel } from '../models/EstadosModels.js';

const CACHE = {
  byName: new Map()
};

function cacheSetNombre(nombre, id) {
  CACHE.byName.set(String(nombre), Number(id));
}
function cacheGetNombre(nombre) {
  return CACHE.byName.has(String(nombre)) ? CACHE.byName.get(String(nombre)) : null;
}
function cacheClear() {
  CACHE.byName.clear();
}

export async function listarEstados(req, res) {
  const db = req.app.get('db');
  const model = new EstadoModel(db);
  try {
    const rows = await model.listar();
    res.json(rows);
  } catch (err) {
    console.error('Error listarEstados:', err);
    res.status(500).json({ error: 'Error al listar estados' });
  }
}

export async function obtenerEstado(req, res) {
  const db = req.app.get('db');
  const model = new EstadoModel(db);
  const { id } = req.params;
  try {
    const estado = await model.obtenerPorId(id);
    if (!estado) return res.status(404).json({ error: 'Estado no encontrado' });
    res.json(estado);
  } catch (err) {
    console.error('Error obtenerEstado:', err);
    res.status(500).json({ error: 'Error al obtener estado' });
  }
}

export async function crearEstado(req, res) {
  const db = req.app.get('db');
  const model = new EstadoModel(db);
  const { nombre, descripcion, es_final = 0, requiere_vencimiento = 0, color_dashboard = null, orden_visual = 0 } = req.body;

  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Permiso denegado' });
  }

  if (!nombre || String(nombre).trim() === '') {
    return res.status(400).json({ error: 'nombre es obligatorio' });
  }

  try {
    const existingId = await model.obtenerIdPorNombre(nombre.trim());
    if (existingId) return res.status(409).json({ error: 'Ya existe un estado con ese nombre' });

    const id = await model.crear({ nombre: nombre.trim(), descripcion, es_final, requiere_vencimiento, color_dashboard, orden_visual });
    cacheSetNombre(nombre.trim(), id);
    res.status(201).json({ id });
  } catch (err) {
    console.error('Error crearEstado:', err);
    res.status(500).json({ error: 'Error al crear estado' });
  }
}

export async function actualizarEstado(req, res) {
  const db = req.app.get('db');
  const model = new EstadoModel(db);
  const { id } = req.params;
  const payload = req.body;

  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Permiso denegado' });
  }

  try {
    const exist = await model.obtenerPorId(id);
    if (!exist) return res.status(404).json({ error: 'Estado no encontrado' });

    if (payload.nombre && payload.nombre !== exist.nombre) {
      const same = await model.obtenerIdPorNombre(payload.nombre);
      if (same) return res.status(409).json({ error: 'Ya existe un estado con ese nombre' });
    }

    await model.actualizar(id, payload);
    cacheClear();
    res.json({ mensaje: 'Estado actualizado' });
  } catch (err) {
    console.error('Error actualizarEstado:', err);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
}

export async function eliminarEstado(req, res) {
  const db = req.app.get('db');
  const model = new EstadoModel(db);
  const { id } = req.params;

  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Permiso denegado' });
  }

  try {
    const [refs] = await db.query('SELECT COUNT(1) AS cnt FROM cotizaciones WHERE id_estado = ?', [id]);
    if (refs && refs[0] && refs[0].cnt > 0) {
      return res.status(409).json({ error: 'No se puede eliminar el estado: usado por cotizaciones' });
    }

    await model.eliminar(id);
    cacheClear();
    res.json({ mensaje: 'Estado eliminado' });
  } catch (err) {
    console.error('Error eliminarEstado:', err);
    res.status(500).json({ error: 'Error al eliminar estado' });
  }
}

// Exportar helper utilitario para otros controladores
export async function getEstadoId(db, nombre) {
  const cached = cacheGetNombre(nombre);
  if (cached) return cached;
  const model = new EstadoModel(db);
  const id = await model.obtenerIdPorNombre(nombre);
  if (id) cacheSetNombre(nombre, id);
  return id;
}