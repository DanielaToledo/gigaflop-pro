import pool from '../config/db.js';
import bcrypt from "bcrypt";



// Buscar usuario por email

// Buscar usuario por email
export const findUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  return rows[0];
};


// Crear usuario
// Crear usuario (con hash de contraseña)
export const createUser = async (usuario, email, password, nombre, apellido, rol, estado = true) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    'INSERT INTO usuarios (usuario, email, password, nombre, apellido, rol, estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [usuario, email, hashedPassword, nombre, apellido, rol, estado]
  );

  return result.insertId;
};



  // Si el rol es vendedor, insertarlo también en la tabla vendedores
//if (rolSeguro === 'vendedor') {
  //await pool.query(
    //'INSERT INTO vendedores (id_usuario, nombre, apellido, legajo, email) VALUES (?, ?, ?, ?, ?)',
    //[userId, usuario, apellido, legajo, email]
  //);


// Buscar usuario por ID
export const findUserById = async (id) => {
  const [rows] = await pool.query(
    `SELECT id, usuario, email, nombre, apellido, rol, estado
     FROM usuarios
     WHERE id = ?`,
    [id]
  );
  return rows[0];
};

