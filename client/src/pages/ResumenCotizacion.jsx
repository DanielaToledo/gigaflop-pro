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
  const observaciones = cotizacion.condiciones?.observaciones || cotizacion.observaciones || cotizacion.cabecera?.observaciones || '';

  const calcularResumenFiscal = (productos, costoEnvio = 0) => {
    let base21 = 0, base105 = 0, descuentosTotales = 0;

    productos.forEach(p => {
      const precioFinal = Number(p.precio_unitario) - Number(p.descuento);
      const subtotal = precioFinal * Number(p.cantidad);
      const iva = Number(p.tasa_iva ?? 21);

      descuentosTotales += Number(p.descuento ?? 0);

      if (iva === 21) base21 += subtotal;
      else if (iva === 10.5) base105 += subtotal;
      else base21 += subtotal; // fallback
    });

    const iva21 = (base21 + costoEnvio) * 0.21;
    const iva105 = base105 * 0.105;
    const baseImponible = base21 + base105 + costoEnvio;
    const totalFinal = baseImponible + iva21 + iva105 - descuentosTotales;

    return { base21, base105, costoEnvio, iva21, iva105, descuentosTotales, baseImponible, totalFinal };
  };
  // ✅ Usala para obtener el resumen
  const resumenFiscal = calcularResumenFiscal(cotizacion.productos, cotizacion.costo_envio || 0);



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

    // Encabezado principal
    pdf.setFontSize(16);
    pdf.setTextColor(0, 70, 140);
    pdf.text(`Cotización Nº ${cotizacion.numero_cotizacion || 'Sin número'}`, margin, y);
    y += 10;

    pdf.setDrawColor(180);
    pdf.line(margin, y, 200, y);
    y += 6;

    pdf.setFontSize(11);
    pdf.setTextColor(40, 40, 40);

    // ✅ Contacto del cliente
    const contactoCompleto = [
      cotizacion.cliente?.contacto,
      cotizacion.cliente?.contacto_apellido
    ].filter(Boolean).join(' ').trim();

    // ✅ Vendedor: detección automática (string u objeto)
    let vendedorNombreCompleto = '-';

    // Caso 1: viene como string dentro de cliente (lo que pasa en esta pantalla)
    if (typeof cotizacion.cliente?.vendedor === 'string') {
      vendedorNombreCompleto = cotizacion.cliente.vendedor;
    }

    // Caso 2: viene como objeto en cotizacion.vendedor (lo que pasa en ResumenCo.jsx)
    else if (cotizacion.vendedor && typeof cotizacion.vendedor === 'object') {
      vendedorNombreCompleto = [
        cotizacion.vendedor.nombre,
        cotizacion.vendedor.apellido
      ].filter(Boolean).join(' ').trim();
    }

    // 🗓️ Datos de la cotización
    pdf.setFontSize(12);
    pdf.setTextColor(0, 70, 140);
    pdf.setFont("helvetica", "bold");
    pdf.text("Datos de la cotización", margin, y);
    y += 6;

    pdf.setFontSize(10);
    pdf.setTextColor(50, 50, 50);
    pdf.setFont("helvetica", "normal");

    pdf.text(`Fecha: ${cotizacion.fecha || new Date().toLocaleDateString()}`, margin, y);
    y += 5;

    // ✅ Ahora SIEMPRE muestra el nombre correcto
    pdf.text(`Vendedor: ${vendedorNombreCompleto}`, margin, y);
    y += 5;

    pdf.text(`Vigente hasta: ${cotizacion.vigencia_hasta || '-'}`, margin, y);
    y += 8;

    // 👤 Cliente
    pdf.setFontSize(12);
    pdf.setTextColor(0, 70, 140);
    pdf.setFont("helvetica", "bold");
    pdf.text("Cliente", margin, y);
    y += 6;

    pdf.setFontSize(10);
    pdf.setTextColor(50, 50, 50);
    pdf.setFont("helvetica", "normal");

    pdf.text(`Nombre: ${cotizacion.cliente?.nombre || '-'}`, margin, y);
    y += 5;

    pdf.text(`Contacto: ${contactoCompleto || 'Sin contacto'}`, margin, y);
    y += 5;

    pdf.text(`CUIT: ${cotizacion.cliente?.cuit || '-'}`, margin, y);
    y += 5;

    pdf.text(`Email: ${cotizacion.cliente?.email || 'Sin email'}`, margin, y);
    y += 5;

    pdf.text(`Dirección: ${direccionTexto}`, margin, y);
    y += 8;

    // 📦 Condiciones comerciales
    pdf.setFontSize(12);
    pdf.setTextColor(0, 70, 140);
    pdf.setFont("helvetica", "bold");
    pdf.text("Condiciones comerciales", margin, y);
    y += 6;

    pdf.setFontSize(10);
    pdf.setTextColor(50, 50, 50);
    pdf.setFont("helvetica", "normal");

    pdf.text(`Forma de pago: ${formaPago}`, margin, y);
    y += 5;

    pdf.text(`Tipo de cambio: ${tipoCambio}`, margin, y);
    y += 5;

    pdf.text(`Plazo de pago: ${diasPago}`, margin, y);
    y += 5;

    if (observaciones) {
      pdf.text(`Observaciones: ${observaciones}`, margin, y);
      y += 5;
    }

    pdf.text(`Costo de envío: $${Number(cotizacion.costo_envio || 0).toFixed(2)}`, margin, y);
    y += 5;

    pdf.text(`Envío bonificado: ${cotizacion.envio_bonificado ? 'Sí' : 'No'}`, margin, y);
    y += 8;


    // ✅ Tabla de productos — CORREGIDA
    const headers = [
      'Producto',
      'Categoría',
      'Subcategoría',
      'Cantidad',
      'Precio unitario',
      'IVA %',
      'Descuento',
      'Subtotal s/IVA',
      'Total c/IVA'
    ];

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
        p.marca || '-',
        p.categoria || '-',
        p.subcategoria || '-',
        cantidad,
        unitario.toFixed(2),
        `${tasaIVA}%`,
        descuento.toFixed(2),
        subtotal.toFixed(2),
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

    // ✅ Resumen Fiscal (sin cambios)
    const calcularResumenFiscal = (productos, costoEnvio = 0) => {
      let base21 = 0, base105 = 0, descuentosTotales = 0;

      productos.forEach(p => {
        const precioFinal = Number(p.precio_unitario) - Number(p.descuento);
        const subtotal = precioFinal * Number(p.cantidad);
        const iva = Number(p.tasa_iva ?? 21);

        descuentosTotales += Number(p.descuento ?? 0);

        if (iva === 21) base21 += subtotal;
        else if (iva === 10.5) base105 += subtotal;
        else base21 += subtotal;
      });

      const iva21 = (base21 + costoEnvio) * 0.21;
      const iva105 = base105 * 0.105;
      const baseImponible = base21 + base105 + costoEnvio;
      const totalFinal = baseImponible + iva21 + iva105 - descuentosTotales;

      return { base21, base105, costoEnvio, iva21, iva105, descuentosTotales, baseImponible, totalFinal };
    };

    const resumenFiscal = calcularResumenFiscal(cotizacion.productos, cotizacion.costo_envio || 0);

    const subtotalProductos = (resumenFiscal.base21 + resumenFiscal.base105).toFixed(2);
    const totalFinal = resumenFiscal.totalFinal.toFixed(2);

    autoTable(pdf, {
      startY: pdf.lastAutoTable.finalY + 4,
      head: [],
      body: [
        ['Subtotal productos (sin envío)', '', '', '', '', '', '', '', '', `$${subtotalProductos}`],
        ['Total Final (con envío e IVA)', '', '', '', '', '', '', '', '', `$${totalFinal}`]
      ],
      margin: { left: margin },
      styles: { fontSize: 10 },
      columnStyles: {
        9: { halign: 'right' }
      },
      didParseCell: function (data) {
        if (data.row.index === 1) {
          data.cell.styles.fillColor = [220, 235, 255];
          data.cell.styles.textColor = [0, 70, 140];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    autoTable(pdf, {
      startY: pdf.lastAutoTable.finalY + 10,
      head: [['Concepto', 'Monto']],
      body: [
        ['Base 21% (productos con IVA 21%)', `$${resumenFiscal.base21.toFixed(2)}`],
        ['Base 10.5% (productos con IVA 10.5%)', `$${resumenFiscal.base105.toFixed(2)}`],
        ['Costo de envío', `$${resumenFiscal.costoEnvio.toFixed(2)}`],
        ['IVA 21% (incluye envío)', `$${resumenFiscal.iva21.toFixed(2)}`],
        ['IVA 10.5%', `$${resumenFiscal.iva105.toFixed(2)}`],
        ['Descuentos', `$${resumenFiscal.descuentosTotales.toFixed(2)}`],
        ['Base imponible (incluye envío)', `$${resumenFiscal.baseImponible.toFixed(2)}`],
        ['Total Final (con envío e IVA)', `$${resumenFiscal.totalFinal.toFixed(2)}`],
      ],
      margin: { left: margin },
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: [0, 70, 140],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 100, halign: 'left' },
        1: { cellWidth: 50, halign: 'right' }
      },
      didParseCell: function (data) {
        if (data.row.index === 7) {
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

    // Encabezado principal
    pdf.setFontSize(16);
    pdf.setTextColor(0, 70, 140);
    pdf.text(`Cotización Nº ${cotizacion.numero_cotizacion || 'Sin número'}`, margin, y);
    y += 10;

    pdf.setDrawColor(180);
    pdf.line(margin, y, 200, y);
    y += 6;

    // ✅ Contacto del cliente
    const contactoCompleto = [
      cotizacion.cliente?.contacto,
      cotizacion.cliente?.contacto_apellido
    ].filter(Boolean).join(' ').trim();

    // ✅ Vendedor: detección automática (string u objeto)
    let vendedorNombreCompleto = '-';

    // Caso 1: viene como string dentro de cliente (lo que pasa en esta pantalla)
    if (typeof cotizacion.cliente?.vendedor === 'string') {
      vendedorNombreCompleto = cotizacion.cliente.vendedor;
    }

    // Caso 2: viene como objeto en cotizacion.vendedor (lo que pasa en ResumenCo.jsx)
    else if (cotizacion.vendedor && typeof cotizacion.vendedor === 'object') {
      vendedorNombreCompleto = [
        cotizacion.vendedor.nombre,
        cotizacion.vendedor.apellido
      ].filter(Boolean).join(' ').trim();
    }

    // 🗓️ Datos de la cotización
    pdf.setFontSize(12);
    pdf.setTextColor(0, 70, 140);
    pdf.setFont("helvetica", "bold");
    pdf.text("Datos de la cotización", margin, y);
    y += 6;

    pdf.setFontSize(10);
    pdf.setTextColor(50, 50, 50);
    pdf.setFont("helvetica", "normal");

    pdf.text(`Fecha: ${cotizacion.fecha || new Date().toLocaleDateString()}`, margin, y);
    y += 5;

    // ✅ Ahora SIEMPRE muestra el nombre correcto
    pdf.text(`Vendedor: ${vendedorNombreCompleto}`, margin, y);
    y += 5;

    pdf.text(`Vigente hasta: ${cotizacion.vigencia_hasta || '-'}`, margin, y);
    y += 8;

    // 👤 Cliente
    pdf.setFontSize(12);
    pdf.setTextColor(0, 70, 140);
    pdf.setFont("helvetica", "bold");
    pdf.text("Cliente", margin, y);
    y += 6;

    pdf.setFontSize(10);
    pdf.setTextColor(50, 50, 50);
    pdf.setFont("helvetica", "normal");

    pdf.text(`Nombre: ${cotizacion.cliente?.nombre || '-'}`, margin, y);
    y += 5;

    pdf.text(`Contacto: ${contactoCompleto || 'Sin contacto'}`, margin, y);
    y += 5;

    pdf.text(`CUIT: ${cotizacion.cliente?.cuit || '-'}`, margin, y);
    y += 5;

    pdf.text(`Email: ${cotizacion.cliente?.email || 'Sin email'}`, margin, y);
    y += 5;

    pdf.text(`Dirección: ${direccionTexto}`, margin, y);
    y += 8;

    // 📦 Condiciones comerciales
    pdf.setFontSize(12);
    pdf.setTextColor(0, 70, 140);
    pdf.setFont("helvetica", "bold");
    pdf.text("Condiciones comerciales", margin, y);
    y += 6;

    pdf.setFontSize(10);
    pdf.setTextColor(50, 50, 50);
    pdf.setFont("helvetica", "normal");

    pdf.text(`Forma de pago: ${formaPago}`, margin, y);
    y += 5;

    pdf.text(`Tipo de cambio: ${tipoCambio}`, margin, y);
    y += 5;

    pdf.text(`Plazo de pago: ${diasPago}`, margin, y);
    y += 5;

    if (observaciones) {
      pdf.text(`Observaciones: ${observaciones}`, margin, y);
      y += 5;
    }

    pdf.text(`Costo de envío: $${Number(cotizacion.costo_envio || 0).toFixed(2)}`, margin, y);
    y += 5;

    pdf.text(`Envío bonificado: ${cotizacion.envio_bonificado ? 'Sí' : 'No'}`, margin, y);
    y += 8;



    // Tabla de productos con IVA %
    // Tabla de productos con IVA %
    const headers = [
      'Producto',
      'Categoría',
      'Subcategoría',
      'Cantidad',
      'Precio unitario',
      'IVA %',
      'Descuento',
      'Subtotal s/IVA',
      'Total c/IVA'
    ];

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
        p.marca || '-',
        p.categoria || '-',
        p.subcategoria || '-',
        cantidad,
        unitario.toFixed(2),
        `${tasaIVA}%`,
        descuento.toFixed(2),
        subtotal.toFixed(2),
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
      alternateRowStyles: { fillColor: [245, 245, 255] },
      columnStyles: {
        0: { cellWidth: 40, overflow: 'linebreak' },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 }
      }
    });

    // Función para calcular resumen fiscal
    const calcularResumenFiscal = (productos, costoEnvio = 0) => {
      let base21 = 0, base105 = 0, descuentosTotales = 0;

      productos.forEach(p => {
        const precioFinal = Number(p.precio_unitario) - Number(p.descuento);
        const subtotal = precioFinal * Number(p.cantidad);
        const iva = Number(p.tasa_iva ?? 21);

        descuentosTotales += Number(p.descuento ?? 0);

        if (iva === 21) base21 += subtotal;
        else if (iva === 10.5) base105 += subtotal;
        else base21 += subtotal;
      });

      const iva21 = (base21 + costoEnvio) * 0.21;
      const iva105 = base105 * 0.105;
      const baseImponible = base21 + base105 + costoEnvio;
      const totalFinal = baseImponible + iva21 + iva105 - descuentosTotales;

      return { base21, base105, costoEnvio, iva21, iva105, descuentosTotales, baseImponible, totalFinal };
    };

    const resumenFiscal = calcularResumenFiscal(cotizacion.productos, cotizacion.costo_envio || 0);

    const subtotalProductos = (resumenFiscal.base21 + resumenFiscal.base105).toFixed(2);
    const totalFinal = resumenFiscal.totalFinal.toFixed(2);

    // Totales debajo de la tabla de productos
    autoTable(pdf, {
      startY: pdf.lastAutoTable.finalY + 4,
      head: [],
      body: [
        ['Total Final (con envío e IVA)', '', '', '', '', '', '', '', '', `$${totalFinal}`]
      ],
      margin: { left: margin },
      styles: { fontSize: 10 },
      columnStyles: {
        9: { halign: 'right' }   // 👈 columna donde va el total
      },
      didParseCell: function (data) {
        // Resaltar la única fila
        data.cell.styles.fillColor = [220, 235, 255];
        data.cell.styles.textColor = [0, 70, 140];
        data.cell.styles.fontStyle = 'bold';
      }
    });

    // Resumen Fiscal completo
    autoTable(pdf, {
      startY: pdf.lastAutoTable.finalY + 10,
      head: [['Concepto', 'Monto']],
      body: [
        ['Base 21% (productos)', `$${resumenFiscal.base21.toFixed(2)}`],
        ['Base 10.5% (productos)', `$${resumenFiscal.base105.toFixed(2)}`],
        ['Costo de envío', `$${resumenFiscal.costoEnvio.toFixed(2)}`],
        ['IVA 21% (incluye envío)', `$${resumenFiscal.iva21.toFixed(2)}`],
        ['IVA 10.5%', `$${resumenFiscal.iva105.toFixed(2)}`],
        ['Descuentos', `$${resumenFiscal.descuentosTotales.toFixed(2)}`],
        ['Base imponible (incluye envío)', `$${resumenFiscal.baseImponible.toFixed(2)}`],
        ['Total Final (con envío e IVA)', `$${resumenFiscal.totalFinal.toFixed(2)}`],
      ],
      margin: { left: margin },
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: [0, 70, 140],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 100, halign: 'left' },
        1: { cellWidth: 50, halign: 'right' }
      },
      didParseCell: function (data) {
        if (data.row.index === 7) { // 👈 resaltar Total Final
          data.cell.styles.fillColor = [220, 235, 255];
          data.cell.styles.textColor = [0, 70, 140];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    // 👇 cierre de la función
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

            {/* 🗓️ Datos de la cotización */}
            <div className="col-md-4 mb-3">
              <h6 className="text-primary border-bottom pb-1">Datos de la cotización</h6>
              <p><strong>Fecha:</strong> {cotizacion.cliente?.fecha_emision || new Date().toLocaleDateString()}</p>
              <p><strong>Vendedor:</strong> {cotizacion.cliente?.vendedor || '-'}</p>
              <p><strong>Vigente hasta:</strong> {cotizacion.vigencia_hasta || '-'}</p>
            </div>

            {/* 👤 Cliente */}
            <div className="col-md-4 mb-3">
              <h6 className="text-primary border-bottom pb-1">Cliente</h6>
              <p><strong>Nombre:</strong> {cotizacion.cliente?.nombre || '-'}</p>
              <p><strong>Contacto:</strong> {
                [cotizacion.cliente?.contacto, cotizacion.cliente?.contacto_apellido]
                  .filter(Boolean)
                  .join(' ')
                  .trim() || 'Sin contacto'
              }</p>
              <p><strong>CUIT:</strong> {cotizacion.cliente?.cuit || '-'}</p>
              <p><strong>Email:</strong> {cotizacion.cliente?.email || 'Sin email definido'}</p>
              <p><strong>Dirección:</strong> {direccionTexto}</p>
            </div>

            {/* 📦 Condiciones comerciales */}
            <div className="col-md-4 mb-3">
              <h6 className="text-primary border-bottom pb-1">Condiciones comerciales</h6>
              <p><strong>Forma de pago:</strong> {formaPago}</p>
              <p><strong>Tipo de cambio:</strong> {tipoCambio}</p>
              <p><strong>Plazo de pago:</strong> {diasPago}</p>
              {observaciones && <p><strong>Observaciones:</strong> {observaciones}</p>}
              <p><strong>Costo de envío:</strong> ${Number(cotizacion.costo_envio || 0).toFixed(2)}</p>
              <p><strong>Envío bonificado:</strong> {cotizacion.envio_bonificado ? 'Sí' : 'No'}</p>
            </div>

          </div>
        </div>


      </div>

      {/* Tabla de productos */}
      <div ref={resumenRef} className="table-responsive">
        <table className="table table-bordered table-striped table-hover table-sm">
          <thead className="table-light">
            <tr>
              <th style={{ width: '35%' }}>Producto</th>
              <th>Marca</th>
              <th>Categoría</th>
              <th>Subcategoría</th>
              <th>Cantidad</th>
              <th>Precio unitario</th>
              <th>IVA %</th>   {/* 👈 nueva columna */}
              <th>Descuento</th>
              <th>Subtotal s/IVA</th>
              <th>Total c/IVA</th>
            </tr>
          </thead>
          <tbody>
            {cotizacion.productos?.map((p, i) => {
              const precioFinal = Number(p.precio_unitario) - Number(p.descuento);
              const subtotal = precioFinal * Number(p.cantidad);
              const tasaIVA = Number(p.tasa_iva ?? 21); // 👈 puede ser 21 o 10.5
              const totalConIVA = subtotal * (1 + (Number(p.tasa_iva ?? 21) / 100));
              return (
                <tr key={i}>
                  <td className="text-wrap text-break">{p.detalle || 'Sin nombre'}</td>
                  <td>{p.marca?.trim() || '-'}</td>
                  <td>{p.categoria?.trim() || '-'}</td>
                  <td>{p.subcategoria?.trim() || '-'}</td>
                  <td>{p.cantidad}</td>
                  <td>{Number(p.precio_unitario).toFixed(2)}</td>
                  <td>{tasaIVA}%</td>        {/* 👈 movido aquí */}
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
                <>
                  <tr className="table-secondary fw-bold">
                    <td colSpan="8" className="text-end"></td>
                    <td>{totalSinIVA.toFixed(2)}</td>
                    <td>{totalConIVA.toFixed(2)}</td>
                  </tr>
                  <tr className="table-light fw-bold">
                    <td colSpan="9" className="text-end">Total Final (con envío e IVA):</td>
                    <td>{resumenFiscal.totalFinal.toFixed(2)}</td>
                  </tr>
                </>
              );
            })()}


          </tbody>
        </table>
      </div>




      {/* Resumen Fiscal */}
      <div className="card mt-4 shadow-sm border-0">
        <div className="card-header bg-light fw-semibold">
          <i className="bi bi-receipt me-2"></i>Resumen Fiscal
        </div>
        <div className="card-body p-3">
          <table className="table table-sm mb-0">
            <tbody>
              <tr><td>Base 21% (productos con iva 21%)</td><td className="text-end text-primary">${resumenFiscal.base21.toFixed(2)}</td></tr>
              <tr><td>Base 10.5% (productos con iva 10.5%)</td><td className="text-end text-info">${resumenFiscal.base105.toFixed(2)}</td></tr>
              <tr><td>Costo de envío</td><td className="text-end text-secondary">${resumenFiscal.costoEnvio.toFixed(2)}</td></tr>
              <tr><td>IVA 21% (incluye envío)</td><td className="text-end text-primary">${resumenFiscal.iva21.toFixed(2)}</td></tr>
              <tr><td>IVA 10.5%</td><td className="text-end text-info">${resumenFiscal.iva105.toFixed(2)}</td></tr>
              <tr><td>Descuentos</td><td className="text-end text-danger">${resumenFiscal.descuentosTotales.toFixed(2)}</td></tr>
              <tr className="table-light"><td><strong>Base imponible (incluye envío)</strong></td><td className="text-end"><strong>${resumenFiscal.baseImponible.toFixed(2)}</strong></td></tr>
              <tr className="table-light"><td><strong>Total Final</strong></td><td className="text-end"><strong>${resumenFiscal.totalFinal.toFixed(2)}</strong></td></tr>
            </tbody>
          </table>
        </div>
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