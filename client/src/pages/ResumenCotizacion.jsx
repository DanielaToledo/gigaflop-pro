// ESTO ES LA PAGINA QUE SE ABRE CUANDO FINALIZAMOS UNA COTIZACION Y VEMOS EL RESUMEN 
//PODEMOS DESCARGAR EL PDF
//PODEMOS ENVIAR LA COTIZACION AL CLIENTE POR EMAIL + PDF ADJUNTO

import React, { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';
import EtiquetaEstado from '../components/ui/EtiquetaEstado';

const ResumenCotizacion = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const resumenRef = useRef();
  const cotizacion = state?.cotizacion;
  const [estadoVisual, setEstadoVisual] = useState(null);
  const [mensajeExito, setMensajeExito] = useState('');
  const [mensajeError, setMensajeError] = useState('');

  if (!cotizacion) return <div>No hay datos para mostrar.</div>;

  // ✅ Lectura tolerante de condiciones comerciales
 const formaPago = cotizacion.condiciones?.forma_pago || cotizacion.forma_pago || cotizacion.cabecera?.forma_pago || '-';
const tipoCambio = cotizacion.condiciones?.tipo_cambio || cotizacion.tipo_cambio || cotizacion.cabecera?.tipo_cambio || '-';
const diasPago = cotizacion.condiciones?.dias_pago || cotizacion.dias_pago || cotizacion.cabecera?.dias_pago || '-';
// ❌ markupMaximo ya no lo usamos en la vista
const observaciones = cotizacion.condiciones?.observaciones || cotizacion.observaciones || cotizacion.cabecera?.observaciones || '';

  const contactoTexto = [cotizacion?.cliente?.contacto_nombre ?? cotizacion?.cliente?.contacto, cotizacion?.cliente?.contacto_apellido]
    .filter(Boolean)
    .join(' ')
    .trim() || 'Sin contacto';

  const direccionTexto = typeof cotizacion?.cliente?.direccion === 'string'
    ? cotizacion.cliente.direccion
    : 'Sin dirección';

  const generarHtmlCotizacion = () => {
    return `
      <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
        <h2 style="color: #004080;">Cotización Nº ${cotizacion.numero_cotizacion || 'Sin número'}</h2>
        <p><strong>Fecha:</strong> ${cotizacion.cliente?.fecha_emision || new Date().toLocaleDateString()}</p>
        <p><strong>Vendedor:</strong> ${cotizacion.cliente?.vendedor || '-'}</p>
        <p><strong>Cliente:</strong> ${cotizacion.cliente?.nombre || '-'}</p>  
        <p><strong>CUIT:</strong> ${cotizacion.cliente?.cuit || '-'}</p>
        <p><strong>Contacto:</strong> ${contactoTexto}</p>     
        <p><strong>Email:</strong> ${cotizacion.cliente?.email || 'Sin email definido'}</p>
        <p><strong>Dirección:</strong> ${direccionTexto}</p>
        <hr />
        <h3 style="color: #004080;">Condiciones comerciales</h3>
        <p><strong>Forma de pago:</strong> ${formaPago}</p>
        <p><strong>Tipo de cambio:</strong> ${tipoCambio}</p>
        <p><strong>Plazo de pago:</strong> ${diasPago}</p>
        ${observaciones ? `<p><strong>Observaciones:</strong> ${observaciones}</p>` : ''}
      </div>
    `;
  };

 const generarPDFCotizacion = () => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const margin = 10;
  let y = margin;

  pdf.setFontSize(16);
  pdf.setTextColor(0, 70, 140);
  pdf.text(`Cotización Nº ${cotizacion.numero_cotizacion || 'Sin número'}`, margin, y);
  y += 10;

  pdf.setDrawColor(180);
  pdf.line(margin, y, 200, y);
  y += 4;

  pdf.setFontSize(10);
  pdf.setTextColor(50, 50, 50);

  const contactoCompleto = [cotizacion.cliente?.contacto, cotizacion.cliente?.contacto_apellido]
    .filter(Boolean)
    .join(' ')
    .trim();

  const datos = [
    `Fecha: ${cotizacion.fecha || new Date().toLocaleDateString()}`,
    `Vendedor: ${cotizacion.vendedor || '-'}`,
    `Vigencia hasta: ${cotizacion.vigencia_hasta || '-'}`,
    `Cliente: ${cotizacion.cliente?.nombre || '-'}`,
    `Contacto: ${contactoCompleto || 'Sin contacto'}`,
    `CUIT: ${cotizacion.cliente?.cuit || '-'}`,
    `Email: ${cotizacion.cliente?.email || 'Sin email'}`,
    `Dirección: ${direccionTexto}`,
    // ✅ Condiciones comerciales desde variables tolerantes
    `Forma de pago: ${formaPago}`,
    `Tipo de cambio: ${tipoCambio}`,
    `Plazo de pago: ${diasPago}`,
    observaciones ? `Observaciones: ${observaciones}` : null
  ];

  datos.filter(Boolean).forEach(linea => {
    pdf.text(linea, margin, y);
    y += 6;
  });

  const headers = ['Producto', 'Cantidad', 'Unitario', 'Descuento', 'Subtotal', 'IVA', 'Total'];
  const rows = cotizacion.productos.map(p => {
    const cantidad = Number(p.cantidad) || 0;
    const unitario = Number(p.precio_unitario) || 0;
    const descuento = Number(p.descuento) || 0;
    const tasaIVA = Number(p.tasa_iva ?? 21);
    const precioFinal = unitario - descuento;
    const subtotal = precioFinal * cantidad;
    const totalConIVA = subtotal * (1 + tasaIVA / 100);

    return [
      p.detalle || 'Sin nombre',
      cantidad,
      precioFinal.toFixed(2),
      descuento.toFixed(2),
      subtotal.toFixed(2),
      `${tasaIVA}%`,
      totalConIVA.toFixed(2)
    ];
  });

  autoTable(pdf, {
    startY: y,
    head: [headers],
    body: rows,
    margin: { left: margin },
    styles: { fontSize: 9 },
    headStyles: {
      fillColor: [0, 70, 140],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: { fillColor: [245, 245, 255] }
  });

  const totalSubtotal = rows.reduce((acc, r) => acc + Number(r[4]), 0);
  const totalFinal = rows.reduce((acc, r) => acc + Number(r[6]), 0);
  const totalIVA = totalFinal - totalSubtotal;

  autoTable(pdf, {
    startY: pdf.lastAutoTable.finalY + 10,
    head: [],
    body: [
      ['Subtotal', `$${totalSubtotal.toFixed(2)}`],
      ['IVA', `$${totalIVA.toFixed(2)}`],
      ['Total', `$${totalFinal.toFixed(2)}`]
    ],
    margin: { left: margin },
    styles: {
      fontSize: 10,
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 }
    },
    columnStyles: {
      0: { cellWidth: 100, halign: 'left' },
      1: { cellWidth: 50, halign: 'right' }
    },
    didParseCell: function (data) {
      if (data.row.index === 2) {
        data.cell.styles.fillColor = [220, 235, 255];
        data.cell.styles.textColor = [0, 70, 140];
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  return pdf;
};

const handleEnviarAlCliente = async () => {
  // ✅ Validar que exista email del cliente
  if (!cotizacion.cliente?.email) {
    setMensajeError('No se puede enviar la cotización: el contacto no tiene email definido');
    return;
  }

  try {
    // ✅ Finalizar la cotización si aún no está en estado final
    if (![3, 4].includes(cotizacion.estado?.id)) {
      await axios.put(
        `/api/cotizaciones/finalizar/${cotizacion.id_cotizacion}`,
        cotizacion,
        { withCredentials: true }
      );
    }

    // ✅ Generar HTML y PDF con condiciones comerciales correctas
    const htmlCotizacion = generarHtmlCotizacion();
    const pdf = generarPDFCotizacion();
    const pdfBlob = pdf.output('blob');
    const pdfFile = new File(
      [pdfBlob],
      `cotizacion_${cotizacion.numero_cotizacion || 'sin_numero'}.pdf`,
      { type: 'application/pdf' }
    );

    // ✅ Preparar datos para envío
    const formData = new FormData();
    formData.append('clienteEmail', cotizacion.cliente?.email);
    formData.append('asunto', `Cotización Nº ${cotizacion.numero_cotizacion || 'Sin número'}`);
    formData.append('htmlCotizacion', htmlCotizacion);
    formData.append('archivoPDF', pdfFile);
    formData.append('id_cotizacion', cotizacion.id_cotizacion);

    // ✅ Enviar al backend
    await axios.post('/api/email/enviar-con-adjunto', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true
    });

    // ✅ Actualizar estado visual y mensajes
    setMensajeExito('Cotización enviada al cliente con PDF adjunto');
    setMensajeError('');
    setEstadoVisual({
      id: 2,
      nombre: 'pendiente',
      es_final: false,
      requiere_vencimiento: true
    });
  } catch (error) {
    console.error('Error al enviar cotización:', error);
    setMensajeError('No se pudo enviar la cotización al cliente');
    setMensajeExito('');
  }
}; 
const handleDescargarPDF = () => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const margin = 10;
  let y = margin;

  pdf.setFontSize(16);
  pdf.setTextColor(0, 70, 140);
  pdf.text(`Cotización Nº ${cotizacion.numero_cotizacion || 'Sin número'}`, margin, y);
  y += 10;

  pdf.setDrawColor(180);
  pdf.line(margin, y, 200, y);
  y += 4;

  pdf.setFontSize(10);
  pdf.setTextColor(50, 50, 50);

  const contactoCompleto = [cotizacion.cliente?.contacto, cotizacion.cliente?.contacto_apellido]
    .filter(Boolean)
    .join(' ')
    .trim();

  const datos = [
    `Fecha: ${cotizacion.fecha || new Date().toLocaleDateString()}`,
    `Vendedor: ${cotizacion.vendedor || '-'}`,
    `Vigencia hasta: ${cotizacion.vigencia_hasta || '-'}`,
    `Cliente: ${cotizacion.cliente?.nombre || '-'}`,
    `Contacto: ${contactoCompleto || 'Sin contacto'}`,
    `CUIT: ${cotizacion.cliente?.cuit || '-'}`,
    `Email: ${cotizacion.cliente?.email || 'Sin email'}`,
    `Dirección: ${direccionTexto}`,
    // ✅ Condiciones comerciales desde variables tolerantes
    `Forma de pago: ${formaPago}`,
    `Tipo de cambio: ${tipoCambio}`,
    `Plazo de pago: ${diasPago}`,
    `Markup máximo: ${markupMaximo}%`,
    observaciones ? `Observaciones: ${observaciones}` : null
  ];

  datos.filter(Boolean).forEach(linea => {
    pdf.text(linea, margin, y);
    y += 6;
  });

  const headers = ['Producto', 'Cantidad', 'Unitario', 'Descuento', 'Subtotal', 'IVA', 'Total'];
  const rows = cotizacion.productos.map(p => {
    const cantidad = Number(p.cantidad) || 0;
    const unitario = Number(p.precio_unitario) || 0;
    const descuento = Number(p.descuento) || 0;
    const tasaIVA = Number(p.tasa_iva ?? 21);
    const precioFinal = unitario - descuento;
    const subtotal = precioFinal * cantidad;
    const totalConIVA = subtotal * (1 + tasaIVA / 100);

    return [
      p.detalle || 'Sin nombre',
      cantidad,
      precioFinal.toFixed(2),
      descuento.toFixed(2),
      subtotal.toFixed(2),
      `${tasaIVA}%`,
      totalConIVA.toFixed(2)
    ];
  });

  autoTable(pdf, {
    startY: y,
    head: [headers],
    body: rows,
    margin: { left: margin },
    styles: { fontSize: 9 },
    headStyles: {
      fillColor: [0, 70, 140],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: { fillColor: [245, 245, 255] }
  });

  const totalSubtotal = rows.reduce((acc, r) => acc + Number(r[4]), 0);
  const totalFinal = rows.reduce((acc, r) => acc + Number(r[6]), 0);
  const totalIVA = totalFinal - totalSubtotal;

  autoTable(pdf, {
    startY: pdf.lastAutoTable.finalY + 10,
    head: [],
    body: [
      ['Subtotal', `$${totalSubtotal.toFixed(2)}`],
      ['IVA', `$${totalIVA.toFixed(2)}`],
      ['Total', `$${totalFinal.toFixed(2)}`]
    ],
    margin: { left: margin },
    styles: {
      fontSize: 10,
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 }
    },
    columnStyles: {
      0: { cellWidth: 100, halign: 'left' },
      1: { cellWidth: 50, halign: 'right' }
    },
    didParseCell: function (data) {
      if (data.row.index === 2) {
        data.cell.styles.fillColor = [220, 235, 255];
        data.cell.styles.textColor = [0, 70, 140];
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  // ✅ Descargar el PDF localmente
  pdf.save(`cotizacion_${cotizacion.numero_cotizacion || 'sin_numero'}.pdf`);
};

  return (
    <div className="container mt-4">
      {/* Cabecera visual */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">
            <i className="bi bi-file-earmark-text me-2"></i>
            Cotización #{cotizacion.numero_cotizacion || '-'}
          </h4>
          <span className="badge bg-light text-dark">
            {cotizacion.vigencia_hasta ? `Vigente hasta ${cotizacion.vigencia_hasta}` : 'Sin vigencia'}
          </span>
        </div>
        <div className="card-body">
          <div className="row text-sm">
            <div className="col-md-4">
              <p><strong>Fecha:</strong> {cotizacion.cliente?.fecha_emision || new Date().toLocaleDateString()}</p>
              <p><strong>Vendedor:</strong> {cotizacion.cliente?.vendedor || '-'}</p>
            </div>
            <div className="col-md-4">
              <p><strong>Cliente:</strong> {cotizacion.cliente?.nombre || '-'}</p>
              <p><strong>Contacto:</strong> {
                [cotizacion.cliente?.contacto, cotizacion.cliente?.contacto_apellido]
                  .filter(Boolean)
                  .join(' ')
                  .trim() || 'Sin contacto'
              }</p>
              <p><strong>CUIT:</strong> {cotizacion.cliente?.cuit || '-'}</p>
              <p><strong>Email:</strong> {cotizacion.cliente?.email || 'Sin email definido'}</p>
            </div>

 {/* Condiciones comerciales */}
<div className="row mt-3">
  <div className="col-md-6">
    <p><strong>Forma de pago:</strong> {formaPago}</p>
    <p><strong>Tipo de cambio:</strong> {tipoCambio}</p>
    <p><strong>Plazo de pago:</strong> {diasPago}</p>
    {observaciones && (
      <p><strong>Observaciones:</strong> {observaciones}</p>
    )}
  </div>
  <div className="col-md-6">
    <p><strong>Costo de envío:</strong> ${Number(cotizacion.costo_envio || 0).toFixed(2)}</p>
    <p><strong>Envío bonificado:</strong> {cotizacion.envio_bonificado ? 'Sí' : 'No'}</p>
  </div>
</div>

            <div className="col-md-4">
              <p><strong>Dirección:</strong> {direccionTexto}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de productos */}
      <div ref={resumenRef} className="table-responsive">
        <table className="table table-bordered table-striped table-hover table-sm">
          <thead className="table-light">
            <tr>
              <th>Producto</th>
              <th>Marca</th>
              <th>Categoría</th>
              <th>Subcategoría</th>
              <th>Cantidad</th>
              <th>Precio unitario</th>
              <th>Descuento</th>
              <th>Subtotal</th>
              <th>Total c/IVA</th>
            </tr>
          </thead>
          <tbody>
            {cotizacion.productos?.map((p, i) => {
              const precioFinal = Number(p.precio_unitario) - Number(p.descuento);
              const subtotal = precioFinal * Number(p.cantidad);
              const totalConIVA = subtotal * (1 + (Number(p.tasa_iva ?? 21) / 100));
              return (
                <tr key={i}>
                  <td>{p.detalle || 'Sin nombre'}</td>
                  <td>{p.marca?.trim() || '-'}</td>
                  <td>{p.categoria?.trim() || '-'}</td>
                  <td>{p.subcategoria?.trim() || '-'}</td>
                  <td>{p.cantidad}</td>
                  <td>{Number(p.precio_unitario).toFixed(2)}</td>
                  <td>{Number(p.descuento).toFixed(2)}</td>
                  <td>{subtotal.toFixed(2)}</td>
                  <td>{totalConIVA.toFixed(2)}</td>
                </tr>
              );
            })}

            {/* Totales generales */}
            {cotizacion.productos?.length > 0 && (() => {
              const totalSinIVA = cotizacion.productos.reduce((acc, p) => {
                const precioFinal = Number(p.precio_unitario) - Number(p.descuento);
                return acc + (precioFinal * Number(p.cantidad));
              }, 0);

              const totalConIVA = cotizacion.productos.reduce((acc, p) => {
                const precioFinal = Number(p.precio_unitario) - Number(p.descuento);
                const subtotal = precioFinal * Number(p.cantidad);
                return acc + (subtotal * (1 + (Number(p.tasa_iva ?? 21) / 100)));
              }, 0);

              return (
                <tr className="table-secondary fw-bold">
                  <td colSpan="7" className="text-end">Totales generales:</td>
                  <td>{totalSinIVA.toFixed(2)}</td>
                  <td>{totalConIVA.toFixed(2)}</td>
                </tr>
              );
            })()}
          </tbody>
        </table>
      </div>

      {/* Mensajes */}
      {(estadoVisual || cotizacion.estado) && (
        <div className="mb-2">
          <EtiquetaEstado estado={estadoVisual || cotizacion.estado} />
        </div>
      )}

      {mensajeError && (
        <div className="alert alert-danger mt-3">
          {mensajeError}
        </div>
      )}

      {mensajeExito && (
        <div className="alert alert-success" role="alert">
          {mensajeExito}
        </div>
      )}


      {/* Botones */}
      <div className="d-flex justify-content-end gap-2 mt-4">
        <button className="btn btn-outline-secondary" onClick={handleDescargarPDF}>
          <i className="bi bi-download me-1"></i> Descargar cotización
        </button>

        <button className="btn btn-success" onClick={handleEnviarAlCliente}>
          <i className="bi bi-envelope me-1"></i> Enviar al cliente
        </button>
        <button className="btn btn-light border" onClick={() => navigate('/menu')}>
          <i className="bi bi-arrow-left me-1"></i> Volver a mis cotizaciones
        </button>
      </div>
    </div>
  );



};

export default ResumenCotizacion;