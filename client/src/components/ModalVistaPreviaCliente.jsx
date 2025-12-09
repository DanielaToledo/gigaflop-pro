import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function ModalVistaPreviaCliente({ visible, onClose, cliente }) {
  if (!visible || !cliente) return null;

  const {
    razon_social,
    cuit,
    activo, // Aunque 'activo' no se usa, lo dejamos por si se necesita en el futuro
    fecha_modificacion,
    direcciones = [],
    contactos = [],
    condiciones_comerciales = []
  } = cliente;

  // Función auxiliar para formatear fecha
  const formatFecha = (fecha) => {
    if (!fecha) return 'Sin registro';
    const date = new Date(fecha);
    return `${date.toLocaleDateString('es-AR')} ${date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Función para exportar PDF con la misma info que el modal
  const descargarClientePDF = () => {
    const doc = new jsPDF();

    // Encabezado
    doc.setFontSize(16);
    doc.text(`Vista previa del cliente`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Razón Social: ${razon_social}`, 14, 30);
    doc.text(`CUIT: ${cuit}`, 14, 36);
    doc.text(`Última modificación: ${formatFecha(fecha_modificacion)}`, 14, 42);

    let y = 55;

    // Direcciones
    if (direcciones.length) {
      doc.text("Direcciones", 14, y);
      doc.autoTable({
        startY: y + 5,
        head: [["#", "Calle", "Localidad", "Provincia", "CP", "Piso", "Depto", "Locación", "Zona"]],
        body: direcciones.map((d, i) => [
          i + 1,
          `${d.calle} ${d.numeracion}`,
          d.localidad,
          d.provincia,
          d.codigo_postal,
          d.piso || "—",
          d.depto || "—",
          d.locacion || "—",
          d.zona_envio || "—",
        ]),
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // Contactos
    if (contactos.length) {
      doc.text("Contactos", 14, y);
      doc.autoTable({
        startY: y + 5,
        head: [["#", "Nombre", "Área", "Teléfono", "Email"]],
        body: contactos.map((c, i) => [
          i + 1,
          `${c.nombre_contacto} ${c.apellido}`,
          c.area_contacto,
          c.telefono,
          c.email,
        ]),
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // Condiciones comerciales
    if (condiciones_comerciales.length) {
      doc.text("Condiciones Comerciales", 14, y);
      doc.autoTable({
        startY: y + 5,
        head: [["#", "Forma de pago", "Tipo de cambio", "Días de pago", "Mark-up", "Observaciones"]],
        body: condiciones_comerciales.map((cond, i) => [
          i + 1,
          cond.forma_pago,
          cond.tipo_cambio,
          cond.dias_pago,
          `${cond.mark_up_maximo}%`,
          cond.observaciones || "—",
        ]),
      });
    }

    doc.save(`Cliente_${razon_social}.pdf`);
  };

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
          <small className="text-muted">
            Última modificación: {formatFecha(fecha_modificacion)}
          </small>
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
        <Button variant="outline-primary" onClick={descargarClientePDF}>
          Exportar como PDF
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}