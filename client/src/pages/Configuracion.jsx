// src/pages/Configuracion.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import CompanyData from "../components/CompanyData";
import UserTable from "../components/UserTable";
import RegisterUser from "../components/RegisterUser";
import EditUserModal from "../components/EditUserModal";
import "../CSS/menu.css";
import "../CSS/configuracion.css";

const Configuracion = () => {
  const [empresa, setEmpresa] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [showNuevoUsuario, setShowNuevoUsuario] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [esExito, setEsExito] = useState(false);
  const [mensajeEmpresa, setMensajeEmpresa] = useState("");

  // 👇 estados exclusivos para edición
  const [mensajeEditar, setMensajeEditar] = useState("");
  const [exitoEditar, setExitoEditar] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("/api/configuracion/datos-fiscales", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      setEmpresa(res.data && Object.keys(res.data).length > 0 ? res.data : null);
    })
    .catch((err) => console.error("Error al obtener datos fiscales:", err));

    axios.get("/api/configuracion/usuarios", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => setUsuarios(res.data))
    .catch((err) => console.error("Error al obtener usuarios:", err));
  }, [token]);

  // ---------- NUEVO USUARIO ----------
  const handleOpenModal = () => {
    setShowNuevoUsuario(true);
    setMensaje("");
    setEsExito(false);
    setError("");
  };

  const handleCloseModal = () => {
    setShowNuevoUsuario(false);
    setMensaje("");
    setEsExito(false);
  };

  const handleSubmitNuevoUsuario = (nuevoUsuario) => {
    axios.post("/api/configuracion/usuarios", nuevoUsuario, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      setUsuarios([...usuarios, { id: res.data.id, ...nuevoUsuario }]);
      setMensaje("Usuario creado con éxito ");
      setEsExito(true);
      setError("");
    })
    .catch((err) => {
      console.error("Error al crear usuario:", err);
      setMensaje("No se pudo registrar el usuario. Verifique permisos o datos. ");
      setEsExito(false);
    });
  };

  // ---------- EDITAR USUARIO ----------
  const handleOpenEditModal = (usuario) => {
    setUsuarioEditando(usuario);
    setMensajeEditar("");
    setExitoEditar(false);
  };

  const handleCloseEditModal = () => {
    setUsuarioEditando(null);
    setMensajeEditar("");
    setExitoEditar(false);
  };

  const handleSubmitEditarUsuario = (usuarioActualizado) => {
    axios.put(`/api/configuracion/usuarios/${usuarioActualizado.id}`, usuarioActualizado, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      setUsuarios(prev =>
        prev.map(u => u.id === usuarioActualizado.id ? usuarioActualizado : u)
      );
      setMensajeEditar("✅ Usuario actualizado correctamente");
      setExitoEditar(true);
      // 👇 ya no cerramos el modal automáticamente
    })
    .catch(err => {
      console.error("Error al actualizar usuario:", err);
      setMensajeEditar("❌ Error al actualizar usuario");
      setExitoEditar(false);
    });
  };

  // ---------- EMPRESA ----------
  const handleUpdateEmpresa = (datosEmpresa) => {
    if (!datosEmpresa) {
      setMensajeEmpresa("⚠️ Faltan rellenar campos obligatorios");
      setEsExito(false);
      return;
    }

    const metodo = empresa ? "put" : "post";
    const url = "/api/configuracion/datos-fiscales";

    axios[metodo](url, datosEmpresa, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      const empresaConId = metodo === "post"
        ? { ...datosEmpresa, id: res.data.id }
        : datosEmpresa;

      setEmpresa(empresaConId);
      setMensajeEmpresa(
        metodo === "post"
          ? "Datos fiscales creados correctamente"
          : "Datos fiscales actualizados correctamente"
      );
      setEsExito(true);
    })
    .catch(err => {
      console.error("Error al guardar datos fiscales:", err);
      setMensajeEmpresa(" No se pudieron guardar los datos fiscales");
      setEsExito(false);
    });
  };

  return (
    <>
      {/* HEADER */}
      
      <div className="encabezado-fijo">
        <Sidebar />
        <div className="background-container-menu">
          <header className="header">
            <div className="title-container">
              <h2 className="title-menu">GIGAFLOP</h2>
            </div>
            <div className="container-icon">
              <label htmlFor="btn-menu"><i className="bi bi-person-circle custom-icon"></i></label>
            </div>
          </header>

          <div className="option" >
            <NavLink className="option-button" to="/dashboard">Dashboard</NavLink>
            <NavLink className="option-button" to="/menu">Cotizaciones</NavLink>
            <NavLink className="option-button" to="/clientes">Clientes</NavLink>
            <NavLink className="option-button" to="/productos">Productos</NavLink>
            <NavLink className="option-button2" to="/configuracion">Configuración</NavLink>
          </div>
        </div>
      

      {/* TOPBAR */}
      <section className="menu-superior-prod" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px'}}>
        <div className="cotizatitlecontainer">
          <h1 className="cotizatitle"  >Configuración</h1>
          
        </div>
       <button
  type="button"
  className="btn nc config-topbar-btn"
  onClick={handleOpenModal}
>
  + Nuevo usuario
</button> 
      </section>
      </div>

      {/* CONTENIDO */}
      <main className="config-page"style={{marginTop: '15%'}}>
        <CompanyData
          empresa={empresa || {
            razon_social: "",
            direccion: "",
            cuit: "",
            condicion_fiscal: "",
            contacto_principal: "",
            email: "",
          }}
          onUpdate={handleUpdateEmpresa}
          mensaje={mensajeEmpresa}
          esExito={esExito}
          onRefresh={() => {
            axios.get("/api/configuracion/datos-fiscales", {
              headers: { Authorization: `Bearer ${token}` }
            })
              .then(res => setEmpresa(res.data))
              .catch(err => console.error("Error al refrescar datos fiscales:", err));
          }}
        />
        {/* 👇 la lista SIEMPRE visible */}
        <UserTable usuarios={usuarios} onEdit={handleOpenEditModal} />
      </main>

      {/* MODAL NUEVO USUARIO */}
      {showNuevoUsuario && (
        <>
          <div className="position-fixed top-0 start-0 w-100 h-100"
            style={{ backgroundColor: "rgba(128, 128, 128, 0.4)", zIndex: 1040 }}></div>

          <div className="modal fade show" style={{ display: "block", zIndex: 1050 }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">Nuevo Usuario</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal}></button>
                </div>

                <div className="modal-body">
                  <RegisterUser onSubmit={handleSubmitNuevoUsuario} />
                  {mensaje && (
                    <div className={`alert ${esExito ? "alert-success" : "alert-danger"} mt-3`}>
                      {mensaje}
                    </div>
                  )}
                </div>

                <div className="modal-footer bg-white">
                  <div className="w-100 d-flex justify-content-between">
                    <button type="button" className="btn btn-danger" onClick={handleCloseModal}>
                      Cancelar
                    </button>
                    <button type="submit" form="registerUserForm" className="btn btn-primary">
                      Registrar Usuario
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </>
      )}

      {/* MODAL EDITAR USUARIO */}
      {usuarioEditando && (
        <EditUserModal
          usuario={usuarioEditando}
          onClose={handleCloseEditModal}
          onSubmit={handleSubmitEditarUsuario}
          mensaje={mensajeEditar}
          exito={exitoEditar}
        />
      )}
    </>
  );
};
export default Configuracion;