// src/models/ConfiguracionModel.js
import pool from '../config/db.js';

export const getUsuarios = async () => {
  const [rows] = await pool.query("SELECT * FROM usuarios");
  return rows;
};

//crear usuario por parte de administradores
export const createUsuario = async (usuario) => {
  const [result] = await pool.query(
    "INSERT INTO usuarios (usuario, email, password, nombre, apellido, rol, estado) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [usuario.usuario, usuario.email, usuario.password, usuario.nombre, usuario.apellido, usuario.rol, usuario.estado]
  );
  return result.insertId;
};

// actualizar usuario por parte de administradores
export const updateUsuario = async (id, usuario) => {
  await pool.query(
    `UPDATE usuarios 
     SET usuario = ?, email = ?, nombre = ?, apellido = ?, rol = ?, estado = ? 
     WHERE id = ?`,
    [
      usuario.usuario,
      usuario.email,
      usuario.nombre,
      usuario.apellido,
      usuario.rol,
      usuario.estado,
      id
    ]
  );
};





// Datos fiscales
export const getDatosFiscales = async () => {
  const [rows] = await pool.query("SELECT * FROM datos_fiscales LIMIT 1");
  return rows[0];
};

export const updateDatosFiscales = async (datos) => {
  await pool.query(
    "UPDATE datos_fiscales SET cuit=?, razon_social=?, email=?, direccion=?, contacto_principal=?, condicion_fiscal=? WHERE id=?",
    [
      datos.cuit,
      datos.razon_social,
      datos.email,
      datos.direccion,
      datos.contacto_principal,
      datos.condicion_fiscal,
      datos.id 
    ]
  );
};


export const createDatosFiscales = async ({ cuit, razon_social, email, direccion, contacto_principal, condicion_fiscal }) => {
  const [result] = await pool.query(
    `INSERT INTO datos_fiscales (cuit, razon_social, email, direccion, contacto_principal, condicion_fiscal)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [cuit, razon_social, email, direccion, contacto_principal, condicion_fiscal]
  );
  return result.insertId;
};