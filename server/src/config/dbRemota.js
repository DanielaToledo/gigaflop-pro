//conexion remota
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbRemota = mysql.createPool({
  host: process.env.DB_REMOTA_HOST,
  port: process.env.DB_REMOTA_PORT,
  user: process.env.DB_REMOTA_USER,
  password: process.env.DB_REMOTA_PASSWORD,
  database: process.env.DB_REMOTA_NAME
});

export default dbRemota;