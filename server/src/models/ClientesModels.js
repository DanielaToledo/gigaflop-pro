import pool from '../config/db.js';


// modelo para crear cliente
export const crearCliente = async ({razon_social,cuit}) => { //recibe un objeto como parametro
    const query = 'INSERT INTO cliente (razon_social,cuit) VALUES (?,?)';//consulta SQL para insertar un cliente
    const [result] = await pool.execute(query, [razon_social, cuit]);// ejecuta la consulta con los valores proporcionados
    
    return result.insertId; // devuelve el id del cliente creado
}

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