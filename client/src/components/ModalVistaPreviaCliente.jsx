import React from 'react';
import { Modal, Button } from 'react-bootstrap';

export default function ModalVistaPreviaCliente({ visible, onClose, cliente }) {
    if (!visible || !cliente) return null;

    const {
        razon_social,
        cuit,
        activo,
        fecha_modificacion,
        direcciones = [],
        contactos = [],
        condiciones_comerciales = {}
    } = cliente;



    return (
    <Modal
  show={visible}
  onHide={onClose}
  size="xl"
  centered
  dialogClassName="modal-dialog-scrollable"
>
  <Modal.Header closeButton className="bg-light flex-column align-items-start border-bottom">
    <Modal.Title className="mb-2">Vista previa del cliente</Modal.Title>
    <div className="w-100">
      <div className="fw-semibold">{razon_social}</div>
      <small className="text-muted">CUIT: {cuit}</small><br />
      <small className="text-muted">Estado: {activo ? 'Activo' : 'Inactivo'}</small><br />
      <small className="text-muted">Última modificación: {fecha_modificacion || 'Sin registro'}</small>
    </div>
  </Modal.Header>

  <Modal.Body>
    {/* Direcciones */}
    <h6 className="text-secondary fw-bold text-uppercase mt-4">Direcciones</h6>
    {direcciones.length > 0 ? (
      <div className="table-responsive">
        <table className="table table-sm table-bordered align-middle text-nowrap">
          <thead className="table-light text-center">
            <tr>
              <th>#</th>
              <th>Calle</th>
              <th>Localidad</th>
              <th>Provincia</th>
              <th>CP</th>
              <th>Piso</th>
              <th>Depto</th>
              <th>Locación</th>
              <th>Zona de envío</th>
            </tr>
          </thead>
          <tbody>
            {direcciones.map((dir, i) => (
              <tr key={i}>
                <td className="text-center">{i + 1}</td>
                <td>{dir.calle} {dir.numeracion}</td>
                <td>{dir.localidad}</td>
                <td>{dir.provincia}</td>
                <td>{dir.codigo_postal}</td>
                <td>{dir.piso || '—'}</td>
                <td>{dir.depto || '—'}</td>
                <td>{dir.locacion || '—'}</td>
                <td>{dir.zona_envio || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p className="text-muted">Sin direcciones registradas.</p>
    )}

    {/* Contactos */}
    <h6 className="text-secondary fw-bold text-uppercase mt-4">Contactos</h6>
    {contactos.length > 0 ? (
      <div className="table-responsive">
        <table className="table table-sm table-bordered align-middle text-nowrap">
          <thead className="table-light text-center">
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Área</th>
              <th>Teléfono</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {contactos.map((c, i) => (
              <tr key={i}>
                <td className="text-center">{i + 1}</td>
                <td>{c.nombre_contacto} {c.apellido}</td>
                <td>{c.area_contacto}</td>
                <td>{c.telefono}</td>
                <td>{c.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p className="text-muted">Sin contactos registrados.</p>
    )}

    {/* Condiciones Comerciales */}
    <h6 className="text-secondary fw-bold text-uppercase mt-4">Condiciones Comerciales</h6>
    {condiciones_comerciales.length > 0 ? (
      <div className="table-responsive">
        <table className="table table-sm table-bordered align-middle text-nowrap">
          <thead className="table-light text-center">
            <tr>
              <th>#</th>
              <th>Forma de pago</th>
              <th>Tipo de cambio</th>
              <th>Días de pago</th>
              <th>Mark-up</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {condiciones_comerciales.map((cond, i) => (
              <tr key={i}>
                <td className="text-center">{i + 1}</td>
                <td className="text-capitalize">{cond.forma_pago}</td>
                <td>{cond.tipo_cambio}</td>
                <td>{cond.dias_pago}</td>
                <td>{cond.mark_up_maximo}%</td>
                <td>{cond.observaciones || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p className="text-muted">Sin condiciones comerciales registradas.</p>
    )}
  </Modal.Body>

  <Modal.Footer className="d-flex justify-content-between">
    <Button variant="outline-primary" onClick={() => window.print()}>
      Exportar como PDF
    </Button>
    <Button variant="secondary" onClick={onClose}>
      Cerrar
    </Button>
  </Modal.Footer>
</Modal>




    );
}