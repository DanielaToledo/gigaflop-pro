// ModalVistaPreviaCot.jsx
//ESTE MODAL MUESTRA LA VISTA PREVIA DE LA COTIZACIÓN
//PERMITE VER TODOS LOS DETALLES DE LA COTIZACIÓN ANTES DE DESCARGAR EL PDF O CERRAR EL MODAL
//INCLUYE DATOS DEL CLIENTE, VENDEDOR, PRODUCTOS, RESUMEN FISCAL Y OBSERVACIONES
//TAMBIÉN MUESTRA UNA ALERTA VISUAL SI LA COTIZACIÓN ESTÁ PRÓXIMA A VENCER O SI YA SE HA ENVIADO UNA ALERTA
//Cómo se calcula el Resumen Fiscal:
//1. 	Base 21% (productos):
//Es la suma de todos los productos que pagan IVA al 21%. En tu ejemplo: $86.48.
//2. 	Base 10.5% (productos):
//Es la suma de los productos que pagan IVA reducido del 10.5%. En este caso no hay, por eso es $0.00.
//3. 	Costo de envío:
//Se agrega el costo de envío de la cotización. Aquí: $10.00.
//4. 	IVA 21% (incluye envío):
//Se calcula el 21% sobre la base de productos al 21% más el envío.
//[(86.48 + 10.00) × 0.21 = 20.26]
//5. 	IVA 10.5%:
//Se calcula el 10.5% sobre la base de productos que tributan esa tasa. Como no hay, queda $0.00.
//6. 	Descuentos:
//Si hubiera descuentos aplicados, se restan aquí. En este caso: $0.00.
//7. 	Base imponible (incluye envío):
//Es la suma de las bases de productos más el envío.
//[86.48 + 0.00 + 10.00 = 96.48]
//8. 	Total Final:
//Es la base imponible + IVA 21% + IVA 10.5% – descuentos.
//[96.48 + 20.26 + 0.00 – 0.00 = 116.74]

//Primero se suman los productos y el envío (96.48).
//Después se calcula el IVA correspondiente (20.26).
//Finalmente se suman ambos y se restan descuentos, dando el Total Final: 116.74.

import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';





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

    const generarPDFInterno = () => {
        const doc = new jsPDF();

        doc.setFontSize(14);
        doc.text(`Cotización Interna: ${numero || '—'}`, 14, 20);

        doc.setFontSize(10);
        doc.text(`Estado: ${estado?.nombre || '—'}`, 14, 28);
        doc.text(`Cliente: ${clienteNombre || '—'}`, 14, 36);
        doc.text(`Vendedor: ${vendedorNombre || '—'} ${vendedorApellido || ''}`, 14, 44);
        doc.text(`Email vendedor: ${vendedorEmail || '—'}`, 14, 52);

        // Tabla de productos
        doc.autoTable({
            startY: 60,
            head: [['Producto', 'Cantidad', 'Unitario', 'Subtotal']],
            body: cotizacion.productos.map(p => [
                p.detalle,
                p.cantidad,
                `$${p.precio_unitario?.toFixed(2)}`,
                `$${p.subtotal?.toFixed(2)}`
            ]),
        });

        // Resumen fiscal
        // Resumen fiscal
        if (cotizacion.resumen_fiscal) {
            const y = doc.lastAutoTable.finalY + 10;
            doc.text('Resumen Fiscal', 14, y);
            doc.autoTable({
                startY: y + 4,
                head: [['Concepto', 'Monto']],
                body: [
                    ['Base 21% (productos con iva 21%)', `$${cotizacion.resumen_fiscal.base21.toFixed(2)}`],
                    ['Base 10.5% (productos con iva 10.5%)', `$${cotizacion.resumen_fiscal.base105.toFixed(2)}`],
                    ['Costo de envío', `$${cotizacion.resumen_fiscal.costoEnvio.toFixed(2)}`],
                    ['IVA 21% (incluye envío)', `$${cotizacion.resumen_fiscal.iva21.toFixed(2)}`],
                    ['IVA 10.5%', `$${cotizacion.resumen_fiscal.iva105.toFixed(2)}`],
                    ['Descuentos', `$${cotizacion.resumen_fiscal.descuentosTotales.toFixed(2)}`],
                    ['Base imponible (incluye envío)', `$${cotizacion.resumen_fiscal.baseImponible.toFixed(2)}`],
                    ['Total Final', `$${cotizacion.resumen_fiscal.totalFinal.toFixed(2)}`],
                ],
            });
        }
        doc.save(`cotizacion-interna-${cotizacion.numero || cotizacion.id}.pdf`);
    };







    return (
        <>
            <div className="modal-backdrop show"></div>

            <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
                    <div className="modal-content shadow rounded-3">


                        {/* Encabezado */}
                        <div className="modal-header bg-primary text-white align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <h5 className="modal-title d-flex align-items-center mb-0">
                                    <i className="bi bi-file-earmark-text me-2"></i>
                                    Cotización <strong className="ms-1">{numero || '—'}</strong>
                                </h5>
                                {estado?.nombre && (
                                    <span className="badge bg-light text-dark ms-3">{estado.nombre}</span>
                                )}
                            </div>
                            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
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
                                        <li> <i className="bi bi-check-circle me-2"></i><strong>Estado:</strong>{' '}<span className={`badge ${estadoVendedor === 'active' ? 'bg-success' : 'bg-secondary'}`}>{estadoVendedor === 'active' ? 'Activo' : 'Inactivo'}</span></li>
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
                                                {/* 👇 ancho fijo para que el texto se acomode hacia abajo */}
                                                <th style={{ width: '40%' }}>Nombre</th>
                                                <th>Cantidad</th>
                                                <th>Unitario</th>
                                                <th>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {productos.map((p, i) => (
                                                <tr key={i}>
                                                    {/* 👇 clases Bootstrap para romper texto largo */}
                                                    <td className="text-wrap text-break">{p.detalle || '—'}</td>
                                                    <td>{p.cantidad ?? '—'}</td>
                                                    <td>${p.precio_unitario?.toFixed(2) ?? '—'}</td>
                                                    <td>${p.subtotal?.toFixed(2) ?? '—'}</td>
                                                </tr>
                                            ))}
                                            {/* 👇 fila extra para subtotal */}
                                            {total !== undefined && (
                                                <tr className="table-light fw-bold">
                                                    <td colSpan="3" className="text-end">
                                                        Subtotal (sin impuestos)
                                                    </td>
                                                    <td>${Number(total).toFixed(2)}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-muted">Sin productos registrados</p>
                                )}
                                {margen !== undefined && (
                                    <p className="mt-2">
                                        <strong>Margen:</strong> {margen}%
                                    </p>
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
                                                    <td>Base 21% (productos con iva 21%)</td>
                                                    <td className="text-end text-primary">
                                                        ${cotizacion.resumen_fiscal.base21.toFixed(2)}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>Base 10.5% (productos con iva 10.5%)</td>
                                                    <td className="text-end text-info">
                                                        ${cotizacion.resumen_fiscal.base105.toFixed(2)}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>Costo de envío</td>
                                                    <td className="text-end text-secondary">
                                                        ${cotizacion.resumen_fiscal.costoEnvio.toFixed(2)}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>IVA 21% (incluye envío)</td>
                                                    <td className="text-end text-primary">
                                                        ${cotizacion.resumen_fiscal.iva21.toFixed(2)}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>IVA 10.5%</td>
                                                    <td className="text-end text-info">
                                                        ${cotizacion.resumen_fiscal.iva105.toFixed(2)}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>Descuentos</td>
                                                    <td className="text-end text-danger">
                                                        ${cotizacion.resumen_fiscal.descuentosTotales.toFixed(2)}
                                                    </td>
                                                </tr>
                                                <tr className="table-light">
                                                    <td><strong>Base imponible (incluye envío)</strong></td>
                                                    <td className="text-end">
                                                        <strong>${cotizacion.resumen_fiscal.baseImponible.toFixed(2)}</strong>
                                                    </td>
                                                </tr>
                                                <tr className="table-light">
                                                    <td><strong>Total Final</strong></td>
                                                    <td className="text-end">
                                                        <strong>${cotizacion.resumen_fiscal.totalFinal.toFixed(2)}</strong>
                                                    </td>
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
                        <div className="modal-footer bg-light d-flex justify-content-between align-items-center">
                            {/* Alerta visual a la izquierda */}
                            <div>
                                {(() => {
                                    const hoy = new Date();
                                    const vigencia = cotizacion.vigencia_hasta ? new Date(cotizacion.vigencia_hasta) : null;
                                    const diasRestantes = vigencia ? Math.ceil((vigencia - hoy) / (1000 * 60 * 60 * 24)) : null;

                                    if (cotizacion.alerta_enviada) {
                                        const diasDesdeAlerta = diasRestantes !== null ? Math.max(0, 3 - diasRestantes) : null;
                                        return (
                                            <span className="badge bg-success px-3 py-2 fs-6">
                                                <i className="bi bi-check-circle me-1"></i>
                                                Alerta enviada hace {diasDesdeAlerta} día{diasDesdeAlerta !== 1 ? 's' : ''}
                                            </span>
                                        );
                                    }

                                    if (diasRestantes !== null && diasRestantes <= 3 && diasRestantes >= 0) {
                                        return (
                                            <span className="badge bg-warning text-dark px-3 py-2 fs-6">
                                                <i className="bi bi-exclamation-triangle me-1"></i>
                                                La cotización vence en {diasRestantes} día{diasRestantes !== 1 ? 's' : ''}
                                            </span>
                                        );
                                    }

                                    return null;
                                })()}
                            </div>

                            {/* Botones a la derecha */}
                            <div className="d-flex gap-2">
                                <button className="btn btn-outline-primary" onClick={generarPDFInterno}>
                                    <i className="bi bi-file-earmark-pdf me-2"></i>Descargar PDF Interno
                                </button>
                                <button className="btn btn-outline-secondary" onClick={onClose}>
                                    <i className="bi bi-x-circle me-2"></i>Cerrar
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}