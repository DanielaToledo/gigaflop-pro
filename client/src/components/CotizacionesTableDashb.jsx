import React from 'react';
import '../CSS/dashboard.css';  
import '../CSS/menu.css';


function usd(n) {
  return typeof n === 'number'
    ? n.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      })
    : '—';
}

// 🔹 Normaliza nombres de estado para mostrar en la UI
function mostrarEstado(nombre) {
  if (!nombre) return "—";
  const estado = nombre.toLowerCase();
  switch (estado) {
    case "finalizada_aceptada":
    case "aprobada":
      return "Aceptada";
    case "finalizada_rechazada":
    case "rechazada":
      return "Rechazada";
    case "pendiente":
      return "Pendiente";
    case "vencida":
      return "Vencida";
    default:
      return nombre.charAt(0).toUpperCase() + nombre.slice(1);
  }
}

const CotizacionesTableDashb = ({ slice, page, pages, setPage, filtered }) => {
  return (
    <section className="table-wrap ">
      <div className="table-head ">
        <h2 className='cotizatitle'>Resultados</h2>
        <div className="right"><span>Total: {filtered.length}</span></div>
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead className="table-primary">
           <tr > 
            <th style={{ fontSize: '0.9rem' }}>#</th> 
            <th style={{ fontSize: '0.9rem' }}>Fecha</th> 
            <th style={{ fontSize: '0.9rem' }}>Cliente</th> 
            <th style={{ fontSize: '0.9rem' }}>Vendedor</th> 
            <th style={{ fontSize: '0.9rem' }}>Total (USD)</th> 
            <th style={{ fontSize: '0.9rem' }}>Estado</th> 
            <th style={{ fontSize: '0.9rem' }}>Marca</th> 
            <th style={{ fontSize: '0.9rem' }}>Productos</th> 
            </tr>
          </thead>
          <tbody>
            {slice.map(r => {
              // 🔹 ocultar borrador
              if (r.estado_nombre?.toLowerCase() === "borrador") {
                return null;
              }

              let badgeClass = "badge";
              switch (r.estado_nombre?.toLowerCase()) {
                case "aprobada":
                case "aceptada":
                case "finalizada_aceptada":
                  badgeClass += " ok"; // verde
                  break;
                case "pendiente":
                  badgeClass += " warn"; // amarillo
                  break;
                case "rechazada":
                case "finalizada_rechazada":
                  badgeClass += " danger"; // rojo
                  break;
                case "vencida":
                  badgeClass += " expired"; // gris
                  break;
                default:
                  badgeClass += " neutral"; // azul
              }

              return (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.fecha}</td>
                  <td>{r.cliente_nombre}</td>
                  <td>{r.usuario_nombre}</td>
                  <td>{usd(Number(r.total))}</td>
                  <td><span className={badgeClass}>{mostrarEstado(r.estado_nombre)}</span></td>
                  <td>{r.marcas}</td> 
                  <td>{r.productos}</td>
                </tr>
              );
            })}
            {slice.filter(r => r.estado_nombre?.toLowerCase() !== "borrador").length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', opacity: 0.7 }}>
                  No hay resultados con los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          className="btn-outline dashbtn"
          disabled={page <= 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
        >
          « Anterior
        </button>
        <span>{page} / {pages}</span>
        <button
          className="btn-outline dashbtn"
          disabled={page >= pages}
          onClick={() => setPage(p => Math.min(pages, p + 1))}
        >
          Siguiente »
        </button>
      </div>
    </section>
  );
};

export default CotizacionesTableDashb;