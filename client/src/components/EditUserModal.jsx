//este es un componente dentro del modulo configuracion.jsx
// es el componente para editar un usuario
//cuando le damos a editar usuario en la tabla de usuarios se abre este modal


// src/components/EditUserModal.jsx
import React, { useState, useEffect } from "react";

const EditUserModal = ({ usuario, onClose, onSubmit, mensaje, exito }) => {
  const [formData, setFormData] = useState(usuario || {});

  useEffect(() => {
    setFormData(usuario || {});
  }, [usuario]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!usuario) return null;

  return (
    <>
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{ backgroundColor: "rgba(128, 128, 128, 0.4)", zIndex: 1040 }}
      ></div>

      <div className="modal fade show" style={{ display: "block", zIndex: 1050 }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-warning text-white">
              <h5 className="modal-title">Editar Usuario</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Usuario</label>
                  <input
                    type="text"
                    name="usuario"
                    value={formData.usuario || ""}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre || ""}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Apellido</label>
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido || ""}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Rol</label>
                  <select
                    name="rol"
                    value={formData.rol || ""}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="vendedor">Vendedor</option>
                    <option value="gerente">Gerente</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Estado</label>
                  <select
                    name="estado"
                    value={formData.estado || ""}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                  </select>
                </div>

                {/* 👇 Mensaje de éxito o error */}
                {mensaje && (
                  <div className={`alert ${exito ? "alert-success" : "alert-danger"} mt-3`}>
                    {mensaje}
                  </div>
                )}
              </div>

              <div className="modal-footer bg-white">
                <button type="button" className="btn btn-danger" onClick={onClose}>
                  Cerrar
                </button>
                <button type="submit" className="btn btn-warning">
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditUserModal;