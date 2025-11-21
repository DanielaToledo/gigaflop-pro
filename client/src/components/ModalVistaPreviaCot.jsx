// ModalVistaPreviaCot.jsx
import React from 'react';
export default function ModalVistaPreviaCot({ visible, onClose, cotizacion }) {
  if (!visible || !cotizacion) return null;

  const {
    cliente: clienteObj = {},
    estado,
    fecha,
    vigencia_hasta,
    margen,
    total,
    numero_cotizacion: numero,
    observaciones,
    vendedor = {}
  } = cotizacion;

  const productos = cotizacion.productos ?? [];

  const {
    nombre: clienteNombre,
    cuit,
    contacto_nombre,
    contacto_apellido,
    email: clienteEmail
  } = clienteObj;

  const {
    nombre: vendedorNombre,
    apellido: vendedorApellido,
    email: vendedorEmail,
    legajo,
    estado: estadoVendedor
  } = vendedor;

  return (
    <>
      <div className="modal-backdrop show"></div>

      <div className="modal fade show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
          <div className="modal-content shadow rounded-3">

            {/* Encabezado */}
            <div className="modal-header bg-primary text-white align-items-center">
              <h5 className="modal-title d-flex align-items-center">
                <i className="bi bi-file-earmark-text me-2"></i>
                Cotización <strong className="ms-1">{numero || '—'}</strong>
              </h5>
              {estado?.nombre && (
                <span className="badge bg-light text-dark ms-3">{estado.nombre}</span>
              )}
              <button type="button" className="btn-close btn-close-white ms-auto" onClick={onClose}></button>
            </div>

            {/* Cuerpo con scroll */}
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {/* Datos del cliente y vendedor */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <h6 className="fw-semibold text-secondary">Datos del Cliente</h6>
                  <ul className="list-unstyled mb-0">
                    <li><i className="bi bi-person-fill me-2"></i><strong>Cliente:</strong> {clienteNombre || '—'}</li>
                    <li><i className="bi bi-credit-card-2-front-fill me-2"></i><strong>CUIT:</strong> {cuit || '—'}</li>
                    <li><i className="bi bi-person-lines-fill me-2"></i><strong>Contacto:</strong> {contacto_nombre} {contacto_apellido}</li>
                    <li><i className="bi bi-envelope-fill me-2"></i><strong>Email:</strong> {clienteEmail || '—'}</li>
                    <li><i className="bi bi-calendar-event me-2"></i><strong>Fecha de creación:</strong> {fecha ? new Date(fecha).toLocaleDateString('es-AR') : '—'}</li>
                    <li><i className="bi bi-calendar-check me-2"></i><strong>Vigencia hasta:</strong> {vigencia_hasta ? new Date(vigencia_hasta).toLocaleDateString('es-AR') : '—'}</li>
                  </ul>
                </div>

                <div className="col-md-6">
                  <h6 className="fw-semibold text-secondary">Datos del Vendedor</h6>
                  <ul className="list-unstyled mb-0">
                    <li><i className="bi bi-person-badge me-2"></i><strong>Nombre:</strong> {vendedorNombre} {vendedorApellido}</li>
                    <li><i className="bi bi-envelope-fill me-2"></i><strong>Email:</strong> {vendedorEmail || '—'}</li>
                    <li><i className="bi bi-card-list me-2"></i><strong>Legajo:</strong> {legajo ?? '—'}</li>
                    <li>
                      <i className="bi bi-check-circle me-2"></i>
                      <strong>Estado:</strong>{' '}
                      <span className={`badge ${estadoVendedor === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                        {estadoVendedor === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Productos */}
              <div className="border-top pt-3 mt-3">
                <h6 className="fw-semibold text-secondary mb-2">Productos</h6>
                {productos.length > 0 ? (
                  <table className="table table-sm table-hover table-bordered rounded-2 overflow-hidden">
                    <thead className="table-light">
                      <tr>
                        <th>Nombre</th>
                        <th>Cantidad</th>
                        <th>Unitario</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos.map((p, i) => (
                        <tr key={i}>
                          <td>{p.detalle || '—'}</td>
                          <td>{p.cantidad ?? '—'}</td>
                          <td>${p.precio_unitario?.toFixed(2) ?? '—'}</td>
                          <td>${p.subtotal?.toFixed(2) ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-muted">Sin productos registrados</p>
                )}
                {margen !== undefined && (
                  <p className="mt-2"><strong>Margen:</strong> {margen}%</p>
                )}
                {total !== undefined && (
                  <p><strong>Total:</strong> ${Number(total).toFixed(2)}</p>
                )}
              </div>

              {/* Resumen Fiscal */}
              {cotizacion.resumen_fiscal && (
                <div className="card mt-4 shadow-sm border-0">
                  <div className="card-header bg-light fw-semibold">
                    <i className="bi bi-receipt me-2"></i>Resumen Fiscal
                  </div>
                  <div className="card-body p-3">
                    <table className="table table-sm mb-0">
                      <tbody>
                        <tr>
                          <td>Base 21%</td>
                          <td className="text-end text-primary">${cotizacion.resumen_fiscal.base21.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td>IVA 21%</td>
                          <td className="text-end text-primary">${cotizacion.resumen_fiscal.iva21.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td>Base 10.5%</td>
                          <td className="text-end text-info">${cotizacion.resumen_fiscal.base105.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td>IVA 10.5%</td>
                          <td className="text-end text-info">${cotizacion.resumen_fiscal.iva105.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td>Descuentos</td>
                          <td className="text-end text-danger">${cotizacion.resumen_fiscal.descuentosTotales.toFixed(2)}</td>
                        </tr>
                        <tr className="table-light">
                          <td><strong>Total Final</strong></td>
                          <td className="text-end"><strong>${cotizacion.resumen_fiscal.totalFinal.toFixed(2)}</strong></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Observaciones */}
              <div className="border-top pt-3 mt-3">
                <h6 className="fw-semibold text-secondary">
                  <i className="bi bi-chat-left-text me-2"></i>Observaciones
                </h6>
                <p className={observaciones?.trim() ? 'bg-light p-2 rounded' : 'text-muted'}>
                  {observaciones?.trim() ? observaciones : 'Sin observaciones registradas'}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer bg-light d-flex justify-content-between">
              <button className="btn btn-outline-primary" onClick={() => {/* lógica para descargar */ }}>
                <i className="bi bi-file-earmark-pdf me-2"></i>Descargar PDF
              </button>
              <button className="btn btn-outline-secondary" onClick={onClose}>
                <i className="bi bi-x-circle me-2"></i>Cerrar
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}