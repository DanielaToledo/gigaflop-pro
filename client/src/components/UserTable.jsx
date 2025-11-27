// Este componente representa la tabla de usuarios en el módulo de configuración
// Muestra la lista de usuarios y sus roles, con opción de editar

// src/components/UserTable.jsx
import React from "react";

const UserTable = ({ usuarios, onEdit }) => {
  // función para asignar color según rol
  const getRolStyle = (rol) => {
    switch (rol) {
      case "vendedor":
        return { backgroundColor: "gold", color: "black" }; // amarillo
      case "gerente":
        return { backgroundColor: "green", color: "white" }; // verde
      case "administrador":
        return { backgroundColor: "blue", color: "white" }; // azul
      default:
        return { backgroundColor: "#6c757d", color: "white" }; // gris por defecto
    }
  };

  // función para traducir estado
  const getEstadoLabel = (estado) => {
    if (estado === 1 || estado === "1" || estado === "Activo") return "Activo";
    if (estado === 0 || estado === "0" || estado === "Inactivo") return "Inactivo";
    return estado; // fallback por si viene otro valor
  };

  const getEstadoStyle = (estado) => {
    const label = getEstadoLabel(estado);
    return {
      backgroundColor: label === "Activo" ? "green" : "red",
      color: "white"
    };
  };

  // 👉 ordenar: activos primero, inactivos después
  const usuariosOrdenados = [...(usuarios || [])].sort((a, b) => {
    const estadoA = getEstadoLabel(a.estado) === "Activo" ? 1 : 0;
    const estadoB = getEstadoLabel(b.estado) === "Activo" ? 1 : 0;
    return estadoB - estadoA; // primero los 1 (activos), luego los 0 (inactivos)
  });

  return (
    <section className="config-card">
      <div className="config-card-header config-card-header--users">
        <div className="config-card-header-left">
          <i className="bi bi-people config-card-icon" aria-hidden="true"></i>
          <h2 className="config-card-title">Usuarios del sistema</h2>
        </div>
      </div>

      <div className="config-table-wrapper">
        <table className="table table-hover align-middle mb-0 config-table">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Usuario</th>
              <th scope="col">Nombre</th>
              <th scope="col">Apellido</th>
              <th scope="col">Rol</th>
              <th scope="col">Email</th>
              <th scope="col">Estado</th>
              <th scope="col" className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosOrdenados.length > 0 ? (
              usuariosOrdenados.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.usuario}</td>
                  <td>{u.nombre}</td>
                  <td>{u.apellido}</td>
                  <td>
                    <span
                      className="badge rounded-pill"
                      style={getRolStyle(u.rol)}
                    >
                      {u.rol}
                    </span>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span
                      className="badge rounded-pill"
                      style={getEstadoStyle(u.estado)}
                    >
                      {getEstadoLabel(u.estado)}
                    </span>
                  </td>
                  <td className="text-end">
                    <button
                      type="button"
                      className="btn btn-link p-0 icon-btn edit"
                      title="Editar usuario"
                      onClick={() => onEdit && onEdit(u)}
                    >
                      <i
                        className="bi bi-pencil-square"
                        style={{ fontSize: "1.2rem", color: "#0d6efd" }}
                      ></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center text-muted">
                  No hay usuarios registrados todavía
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default UserTable;