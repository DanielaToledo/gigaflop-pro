//Dos grandes responsabilidades:
//Usuarios: alta, listado, actualización de rol/estado.
//Datos fiscales: guardar y recuperar CUIT, razón social, email, dirección, contacto principal.

// src/controllers/ConfiguracionController.js
import * as ConfiguracionModels from "../models/ConfiguracionModels.js";

// ver usuarios por parte de administradores
export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await ConfiguracionModels.getUsuarios();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: "Error al listar usuarios" });
  }
};

// crear usuario por parte de administradores
export const crearUsuario = async (req, res) => {
  try {
    const { usuario, email, password, nombre, apellido, rol, estado } = req.body;

    if (!usuario || !email || !password || !nombre || !apellido || !rol || estado === undefined) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const id = await ConfiguracionModels.createUsuario(req.body);
    res.json({ message: "Usuario creado", id });
  } catch (error) {
    console.error("Error en crearUsuario:", error);
    res.status(500).json({ message: "Error al crear usuario" });
  }
};

// actualizar usuario por parte de administradores
export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario, email, nombre, apellido, rol, estado } = req.body;

    if (!usuario || !email || !nombre || !apellido || !rol || estado === undefined) {
      return res.status(400).json({ message: "⚠️ Faltan campos obligatorios" });
    }

    await ConfiguracionModels.updateUsuario(id, req.body);
    res.json({ message: "✅ Usuario actualizado correctamente" });
  } catch (error) {
    console.error("Error en actualizarUsuario:", error.sqlMessage || error);
    res.status(500).json({ message: "❌ Error al actualizar usuario" });
  }
};

// obtener datos fiscales
export const obtenerDatosFiscales = async (req, res) => {
  try {
    const datos = await ConfiguracionModels.getDatosFiscales();
    res.json(datos);
  } catch (error) {
    console.error("Error en obtenerDatosFiscales:", error);
    res.status(500).json({ message: "❌ Error al obtener datos fiscales" });
  }
};

// actualizar datos fiscales
export const actualizarDatosFiscales = async (req, res) => {
  try {
    const { id, cuit, razon_social, email, direccion, contacto_principal, condicion_fiscal } = req.body;

    if (!id || !cuit || !razon_social || !email || !direccion || !contacto_principal || !condicion_fiscal) {
      return res.status(400).json({ message: "⚠️ Faltan campos obligatorios" });
    }

    await ConfiguracionModels.updateDatosFiscales(req.body);
    res.json({ message: "✅ Datos fiscales actualizados correctamente" });
  } catch (error) {
    console.error("Error en actualizarDatosFiscales:", error.sqlMessage || error);
    res.status(500).json({ message: "❌ Error al actualizar datos fiscales" });
  }
};

// crear datos fiscales
export const crearDatosFiscales = async (req, res) => {
  try {
    const { cuit, razon_social, email, direccion, contacto_principal, condicion_fiscal } = req.body;

    if (!cuit || !razon_social || !email || !direccion || !contacto_principal || !condicion_fiscal) {
      return res.status(400).json({ message: "⚠️ Faltan campos obligatorios" });
    }

    console.log("Body recibido:", req.body); // 👈 log para depurar
    const id = await ConfiguracionModels.createDatosFiscales(req.body);
    res.json({ message: "✅ Datos fiscales creados", id });
  } catch (error) {
    console.error("Error en crearDatosFiscales:", error.sqlMessage || error);
    res.status(500).json({ message: "❌ Error al crear datos fiscales" });
  }
};