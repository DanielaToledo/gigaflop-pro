// src/routes/configuracionRoutes.js
import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { authorize } from "../middlewares/roleAuth.js";
import * as ConfiguracionController from "../controllers/ConfiguracionControllers.js";

const router = Router();

// Usuarios
//este metodo es solo para administradores listar usuarios
router.get("/usuarios", authRequired, authorize(["administrador"]), ConfiguracionController.listarUsuarios);

//este metodo es solo para administradores crear usuarios
router.post("/usuarios", authRequired, authorize(["administrador"]), ConfiguracionController.crearUsuario);

// Datos fiscales

// Crear datos fiscales (solo administradores)
router.post("/datos-fiscales",authRequired,authorize(["administrador"]),ConfiguracionController.crearDatosFiscales);


//estos metodos son solo para administradores ver
router.get("/datos-fiscales", authRequired, authorize(["administrador"]), ConfiguracionController.obtenerDatosFiscales);

//estos metodos son solo para administradores actualizar
router.put("/datos-fiscales", authRequired, authorize(["administrador"]), ConfiguracionController.actualizarDatosFiscales);

export default router;