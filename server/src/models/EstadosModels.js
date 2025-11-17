// models/EstadoModels.js
import pool from '../config/db.js';

export class EstadoModel {
  constructor(db = pool) {
    this.db = db;
  }

  async listar() {
    const [rows] = await this.db.query(
      `SELECT id, nombre, descripcion, es_final, requiere_vencimiento, color_dashboard, orden_visual
       FROM estados
       ORDER BY orden_visual ASC, id ASC`
    );
    return rows;
  }

  async obtenerPorId(id) {
    const [rows] = await this.db.query(
      `SELECT id, nombre, descripcion, es_final, requiere_vencimiento, color_dashboard, orden_visual
       FROM estados WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] ?? null;
  }

  async crear({ nombre, descripcion = '', es_final = 0, requiere_vencimiento = 0, color_dashboard = null, orden_visual = 0 }) {
    const [result] = await this.db.query(
      `INSERT INTO estados (nombre, descripcion, es_final, requiere_vencimiento, color_dashboard, orden_visual)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion, Number(es_final), Number(requiere_vencimiento), color_dashboard, orden_visual]
    );
    return result.insertId;
  }

  async actualizar(id, { nombre, descripcion, es_final, requiere_vencimiento, color_dashboard, orden_visual }) {
    await this.db.query(
      `UPDATE estados SET
         nombre = COALESCE(?, nombre),
         descripcion = COALESCE(?, descripcion),
         es_final = COALESCE(?, es_final),
         requiere_vencimiento = COALESCE(?, requiere_vencimiento),
         color_dashboard = COALESCE(?, color_dashboard),
         orden_visual = COALESCE(?, orden_visual)
       WHERE id = ?`,
      [nombre, descripcion, es_final, requiere_vencimiento, color_dashboard, orden_visual, id]
    );
  }

  async eliminar(id) {
    await this.db.query(`DELETE FROM estados WHERE id = ?`, [id]);
  }

  async obtenerIdPorNombre(nombre) {
    const [rows] = await this.db.query(
      `SELECT id FROM estados WHERE nombre = ? LIMIT 1`,
      [nombre]
    );
    return rows && rows[0] ? Number(rows[0].id) : null;
  }
}