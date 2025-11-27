// src/routes/configuracionRoutes.js
import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { authorize } from "../middlewares/roleAuth.js";
import * as configuracionControllers from "../controllers/configuracionControllers.js";

const router = Router();

// Usuarios
//este metodo es solo para administradores listar usuarios
router.get("/usuarios", authRequired, authorize(["administrador"]), configuracionControllers.listarUsuarios);

//este metodo es solo para administradores crear usuarios
router.post("/usuarios", authRequired, authorize(["administrador"]), configuracionControllers.crearUsuario);

// este método es solo para administradores editar usuarios
router.put("/usuarios/:id", authRequired, authorize(["administrador"]), configuracionControllers.actualizarUsuario);

// Datos fiscales

// Crear datos fiscales (solo administradores)
router.post("/datos-fiscales",authRequired,authorize(["administrador"]),configuracionControllers.crearDatosFiscales);


//estos metodos son solo para administradores ver
router.get("/datos-fiscales", authRequired, authorize(["administrador"]), configuracionControllers.obtenerDatosFiscales);
//estos metodos son solo para administradores actualizar
router.put("/datos-fiscales", authRequired, authorize(["administrador"]), configuracionControllers.actualizarDatosFiscales);

export default router;