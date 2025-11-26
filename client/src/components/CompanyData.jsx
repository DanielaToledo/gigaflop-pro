// ES UN COMPONENTE DENTRO DEL MODULO CONFIGURACION 
// ACA ESTA EL COMPONENTE DE DATOS DE LA EMPRESA
// SE PUEDE EDITAR LA INFORMACION DE LA EMPRESA Y GUARDARLA O DESCARTAR LOS CAMBIOS

import React, { useState, useEffect } from "react";
import "../CSS/configuracion.css";

const CompanyData = ({ empresa, onUpdate, mensaje, esExito, onRefresh }) => {
  const [formData, setFormData] = useState({
    id: null,                // 👈 incluimos id en el estado
    razon_social: "",
    direccion: "",
    cuit: "",
    condicion_fiscal: "",
    contacto_principal: "",
    email: ""
  });

  const [cuitError, setCuitError] = useState("");
  const [visibleMensaje, setVisibleMensaje] = useState(true);

  // 👇 Siempre copiamos lo que llega del padre, incluyendo el id si existe
  useEffect(() => {
    setFormData(empresa);
  }, [empresa]);

  // Ocultar mensaje automáticamente después de 4 segundos
  useEffect(() => {
    if (mensaje) {
      setVisibleMensaje(true);
      const timer = setTimeout(() => setVisibleMensaje(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === "cuit") {
      const soloNumeros = value.replace(/\D/g, "");
      if (soloNumeros.length <= 11) {
        setFormData({ ...formData, [id]: soloNumeros });
      }
      setCuitError("");
    } else {
      setFormData({ ...formData, [id]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar campos obligatorios
    const camposObligatorios = [
      "razon_social",
      "direccion",
      "cuit",
      "contacto_principal",
      "email"
    ];
    const faltan = camposObligatorios.filter(campo => !formData[campo]?.trim());

    if (faltan.length > 0) {
      setCuitError(""); 
      setVisibleMensaje(true);
      onUpdate(null); // 👈 avisamos al padre que faltan campos
      return;
    }

    // Validación extra: CUIT exactamente 11 dígitos
    if (!/^\d{11}$/.test(formData.cuit)) {
      setCuitError("⚠️ El CUIT debe tener exactamente 11 números");
      return;
    }

    setCuitError("");
    onUpdate(formData); // 👈 enviamos todo, incluyendo id si existe
  };

  const handleReset = () => {
    setFormData(
      empresa || {
        id: null,
        razon_social: "",
        direccion: "",
        cuit: "",
        condicion_fiscal: "",
        contacto_principal: "",
        email: ""
      }
    );
    setCuitError("");
  };

  return (
    <section className="config-card config-card-company">
      <div className="config-card-header">
        <i className="bi bi-building config-card-icon" aria-hidden="true"></i>
        <h2 className="config-card-title">Datos de la empresa</h2>
      </div>

      <form className="config-company-form" onSubmit={handleSubmit}>
        <div className="config-grid">
          <div className="config-field">
            <label htmlFor="razon_social">
              Nombre o Razón Social <span className="required">*</span>
            </label>
            <input
              id="razon_social"
              type="text"
              className="form-control"
              value={formData.razon_social}
              onChange={handleChange}
              required
            />
          </div>

          <div className="config-field">
            <label htmlFor="direccion">
              Dirección <span className="required">*</span>
            </label>
            <input
              id="direccion"
              type="text"
              className="form-control"
              value={formData.direccion}
              onChange={handleChange}
              required
            />
          </div>

          <div className="config-field">
            <label htmlFor="cuit">
              CUIT <span className="required">*</span>
            </label>
            <input
              id="cuit"
              type="text"
              className={`form-control ${cuitError ? "is-invalid" : ""}`}
              value={formData.cuit}
              onChange={handleChange}
              required
              maxLength={11}
              inputMode="numeric"
            />
            {cuitError && (
              <div className="invalid-feedback d-block">{cuitError}</div>
            )}
          </div>

          <div className="config-field">
            <label htmlFor="condicion_fiscal">Situación Fiscal</label>
            <input
              id="condicion_fiscal"
              type="text"
              className="form-control"
              value={formData.condicion_fiscal}
              onChange={handleChange}
            />
          </div>

          <div className="config-field">
            <label htmlFor="contacto_principal">
              Contacto principal <span className="required">*</span>
            </label>
            <input
              id="contacto_principal"
              type="text"
              className="form-control"
              value={formData.contacto_principal}
              onChange={handleChange}
              required
            />
          </div>

          <div className="config-field">
            <label htmlFor="email">
              Email <span className="required">*</span>
            </label>
            <input
              id="email"
              type="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Botones alineados */}
        <div className="config-actions-right d-flex justify-content-between">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={handleReset}
          >
            Descartar cambios
          </button>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary btn-sm">
              Guardar datos
            </button>

            {esExito && !visibleMensaje && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onRefresh}
              >
                Actualizar datos
              </button>
            )}
          </div>
        </div>
      </form>

      {mensaje && visibleMensaje && (
        <div
          className={`alert ${
            mensaje.includes("correctamente") ? "alert-success" : "alert-danger"
          } mt-3`}
        >
          {mensaje}
        </div>
      )}
    </section>
  );
};

export default CompanyData;