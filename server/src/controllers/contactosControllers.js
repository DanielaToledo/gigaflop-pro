import { obtenerContactosPorCliente } from '../models/ContactosModels.js';

export const obtenerContactosPorClienteController = async (req, res) => {
  const { id } = req.params;
  try {
    const contactos = await obtenerContactosPorCliente(id);
    res.status(200).json(contactos);
  } catch (error) {
    console.error("Error al obtener contactos del cliente:", error);
    res.status(500).json({ error: "No se pudo obtener los contactos del cliente" });
  }
};