import pool from '../config/db.js';

// Buscar usuario por email
export const findUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  return rows[0];
};

// Crear usuario
export const createUser = async (usuario, email, password,nombre, apellido, rol, estado = true) => {
  //const rolesPermitidos = ['vendedor', 'administrador', 'gerente'];
  //const rolSeguro = rolesPermitidos.includes(rol?.toLowerCase()) ? rol.toLowerCase() : 'vendedor';

  const [result] = await pool.query(
    'INSERT INTO usuarios (usuario, email, password,nombre, apellido, rol, estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [usuario, email, password, nombre, apellido, rol, estado]
  );

  const userId = result.insertId;
  //const legajo = userId; // legajo único basado en el ID del usuario


  // Si el rol es vendedor, insertarlo también en la tabla vendedores
//if (rolSeguro === 'vendedor') {
  //await pool.query(
    //'INSERT INTO vendedores (id_usuario, nombre, apellido, legajo, email) VALUES (?, ?, ?, ?, ?)',
    //[userId, usuario, apellido, legajo, email]
  //);



  return userId;
};

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