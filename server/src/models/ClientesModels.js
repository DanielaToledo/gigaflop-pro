import pool from '../config/db.js';


// modelo para crear cliente
export const crearCliente = async ({razon_social,cuit}) => { //recibe un objeto como parametro
    const query = 'INSERT INTO cliente (razon_social,cuit) VALUES (?,?)';//consulta SQL para insertar un cliente
    const [result] = await pool.execute(query, [razon_social, cuit]);// ejecuta la consulta con los valores proporcionados
    
    return result.insertId; // devuelve el id del cliente creado
}


export const listarClientesPorTexto = async (texto) => {
  const query = texto.trim();

  const [rows] = await pool.execute(
    `SELECT id, razon_social, cuit 
     FROM cliente 
     WHERE razon_social LIKE ? OR cuit LIKE ? 
     ORDER BY razon_social ASC 
     LIMIT 10`,
    [`%${query}%`, `%${query}%`]
  );

  return rows;
};


//modelo para listar clientes
export const listarClientes = async () => {
    const [rows] = await pool.execute('SELECT * FROM cliente');// ejecuta la consulta para obtener todos los clientes
    return rows; // devuelve todas las filas de la tabla cliente
}

//modelo para listar cliente por razon social
export const listarCliente = async ({ razon_social }) => {
  const query = 'SELECT * FROM cliente WHERE razon_social LIKE ?';
  const [rows] = await pool.execute(query, [`%${razon_social}%`]);
  return rows;
  
};


export const obtenerCondicionesComerciales = async (idCliente) => {
  if (!idCliente || isNaN(Number(idCliente))) {
    throw new Error('ID de cliente inválido');
  }

  const [rows] = await pool.query(
    `SELECT forma_pago, tipo_cambio, dias_pago
     FROM condiciones_comerciales
     WHERE id_cliente = ?`,
    [idCliente]
  );

  if (!rows.length) return null;

  const { forma_pago, tipo_cambio, dias_pago } = rows[0];

  return {
    forma_pago: forma_pago || '',
    tipo_cambio: tipo_cambio || '',
    dias_pago: dias_pago || ''
  };
};

//modelo para obtener dias de pago por cliente
export const obtenerDiasPagoPorCliente = async (idCliente) => {
  const [rows] = await pool.query(
    `SELECT DISTINCT dias_pago
     FROM condiciones_comerciales
     WHERE id_cliente = ?`,
    [idCliente]
  );
  return rows.map(r => String(r.dias_pago));
};





//modelo para listar un cliente por razon social o cuit o id
//export const listarCliente = async ({ id = '', razon_social = '', cuit = '' }) => {
  //let query = 'SELECT * FROM cliente WHERE 1=1';
  //const valores = [];

  //if (id) {
    //query += ' AND id = ?';
    //valores.push(id);
  //}
  //if (razon_social) {
    //query += ' AND razon_social LIKE ?';
    //valores.push(`%${razon_social}%`);
  //}
  //if (cuit) {
    //query += ' AND cuit LIKE ?';
    //valores.push(`%${cuit}%`);
  //}

  //query += ' LIMIT 1'; // solo un cliente

  //const [rows] = await pool.execute(query, valores);
  //return rows[0];
//};

    


//modelo para actualizar un cliente por cuit
export const actualizarCliente = async (cuit, {razon_social}) => {
   const query ='UPDATE cliente SET razon_social = ? WHERE cuit = ?';
   const [result] = await pool.execute(query, [razon_social, cuit]);// ejecuta la consulta para actualizar un cliente por su cuit
   return result.affectedRows;// devuelve el número de filas afectadas por la actualización
};

//modelo para eliminar un cliente por cuit
export const eliminarCliente = async (cuit) => {
    const query = 'DELETE FROM cliente WHERE cuit = ?'; // consulta SQL para eliminar un cliente por cuit
    const [result] = await pool.execute(query, [cuit]); // ejecuta la consulta con el cuit proporcionado
    return result.affectedRows; // devuelve el número de filas afectadas por la eliminación
};

//modelo para obtener direcciones de un cliente por su id junto con el nombre de la zona de envio
export const obtenerDireccionesConZona = async (idCliente) => {
  const [rows] = await pool.query(`
    SELECT id AS id_direccion, locacion, calle, numeracion, localidad, provincia, zona_envio, codigo_postal
    FROM direccion_cliente
    WHERE id_cliente = ?
  `, [idCliente]);

  return rows;
};


//modelo para obtener costo de envio por zona
export const obtenerCostoEnvioPorZona = async (zona) => {
  const [rows] = await pool.query(`
    SELECT costo_base, tasa_iva, bonificable FROM costos_envio WHERE zona_envio = ?
  `, [zona]);

  return rows.length ? rows[0].costo_base : null;
};

//modelo para obtener zona por id de direccion
export const obtenerZonaPorDireccion = async (id_direccion) => {
  const [rows] = await pool.query(`
    SELECT zona_envio FROM direccion_cliente WHERE id = ?
  `, [id_direccion]);

  return rows.length ? rows[0].zona_envio : null;
};




//modelo para listar todas las zonas con su costo
export const listarZonasConCosto = async () => {
  const [rows] = await pool.query(`
    SELECT zona_envio, costo_base FROM costos_envio
  `);
  return rows;
};





//modelos necesarias para crear un cliente completo con todos sus datos (razon_social, cuit, email, direcciones y contactos)
// 🔍 Verifica si ya existe un cliente completo por CUIT
export const existeClienteCompletoPorCuit = async (cuit) => {
  const [rows] = await pool.execute('SELECT id FROM cliente WHERE cuit = ?', [cuit]);
  return rows.length > 0;
};

// 🧾 Crea un cliente completo (razón social, CUIT, email)
export const crearClienteCompleto = async ({ razon_social, cuit }) => {
  const query = 'INSERT INTO cliente (razon_social, cuit) VALUES (?, ?)';
  const [result] = await pool.execute(query, [razon_social, cuit]);
  return result.insertId;
};

// 📍 Inserta una dirección asociada al cliente completo
export const insertarDireccionClienteCompleto = async (id_cliente, dir) => {
  const query = `
    INSERT INTO direccion_cliente 
    (id_cliente, calle, numeracion, localidad, provincia, codigo_postal) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  await pool.execute(query, [
    id_cliente,
    dir.calle,
    dir.numeracion,
    dir.localidad,
    dir.provincia,
    dir.codigo_postal
  ]);
};

// 📞 Inserta un contacto asociado al cliente completo
export const insertarContactoClienteCompleto = async (id_cliente, contacto) => {
  const query = `
    INSERT INTO contactos 
    (id_cliente, nombre_contacto,apellido, telefono, email) 
    VALUES (?, ?, ?, ?, ?)
  `;
  await pool.execute(query, [ 
    id_cliente, 
    contacto.nombre_contacto,
    contacto.apellido,
    contacto.telefono, 
    contacto.email ]
);
};




export const eliminarDireccionesPorCliente = async (id_cliente) => {
  await pool.query('DELETE FROM direccion_cliente WHERE id_cliente = ?', [id_cliente]);
};