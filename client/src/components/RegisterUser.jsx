import React, { useState } from "react";

const RegisterUser = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    usuario: "",
    password: "",
    email: "",
    rol: "",
    nombre: "",
    apellido: "",
    estado: "Activo"
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validación: todos los campos obligatorios deben estar completos
    if (
      !formData.usuario ||
      !formData.password ||
      !formData.email ||
      !formData.rol ||
      !formData.nombre ||
      !formData.apellido
    ) {
      setError("⚠️ Faltan datos obligatorios. Por favor complete todos los campos.");
      return;
    }

    setError(""); // limpiamos error si todo está bien
    onSubmit(formData);
  };

  return (

    
    <form id="registerUserForm" onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-danger mb-3" role="alert">
          {error}
        </div>
      )}

      <div className="row g-3">
        <div className="col-md-6">
          <label htmlFor="usuario" className="form-label">
            Usuario <span className="text-danger">*</span>
          </label>
          <input id="usuario" type="text" className="form-control"
            value={formData.usuario} onChange={handleChange} />
        </div>

        <div className="col-md-6">
          <label htmlFor="password" className="form-label">
            Contraseña <span className="text-danger">*</span>
          </label>
          <input id="password" type="password" className="form-control"
            value={formData.password} onChange={handleChange} />
        </div>

        <div className="col-md-6">
          <label htmlFor="email" className="form-label">
            E-mail <span className="text-danger">*</span>
          </label>
          <input id="email" type="email" className="form-control"
            value={formData.email} onChange={handleChange} />
        </div>

        <div className="col-md-6">
          <label htmlFor="rol" className="form-label">
            Rol <span className="text-danger">*</span>
          </label>
          <select id="rol" className="form-select"
            value={formData.rol} onChange={handleChange}>
            <option value="">Seleccionar...</option>
            <option value="vendedor">Vendedor</option>
            <option value="gerente">Gerente</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>

        <div className="col-md-6">
          <label htmlFor="nombre" className="form-label">
            Nombre <span className="text-danger">*</span>
          </label>
          <input id="nombre" type="text" className="form-control"
            value={formData.nombre} onChange={handleChange} />
        </div>

        <div className="col-md-6">
          <label htmlFor="apellido" className="form-label">
            Apellido <span className="text-danger">*</span>
          </label>
          <input id="apellido" type="text" className="form-control"
            value={formData.apellido} onChange={handleChange} />
        </div>
      </div>
    </form>
  );
};

export default RegisterUser;