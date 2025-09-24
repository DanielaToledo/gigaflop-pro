import React, { useEffect, useState } from 'react';
import BuscadorProductos from '../components/BuscadorProductos';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../CSS/nuevaCotizacion.css';

const NuevaCotizacion = () => {
  const [vigencia, setVigencia] = useState('');
  const [cliente, setCliente] = useState('');
  const [contacto, setContacto] = useState('');
  const [modalidadEntrega, setModalidadEntrega] = useState('Envío');
  const [direccion, setDireccion] = useState('');
  const [costoEnvio, setCostoEnvio] = useState('');
  const [formaPago, setFormaPago] = useState('');
  const [tipoCambio, setTipoCambio] = useState('');
  const [diasPago, setDiasPago] = useState('');
  const [diasPagoExtra, setDiasPagoExtra] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [errorGlobal, setErrorGlobal] = useState('');
  const [infoGlobal, setInfoGlobal] = useState('');
  const [fechaHoy, setFechaHoy] = useState('');
  const [yearActual, setYearActual] = useState(new Date().getFullYear());
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [seleccionModal, setSeleccionModal] = useState({});
  const [query, setQuery] = useState('');

  useEffect(() => {
    setFechaHoy(new Date().toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    const guardados = localStorage.getItem('productosParaCotizar');
    if (guardados) {
      try {
        const productos = JSON.parse(guardados);
        const formateados = productos.map(p => ({
          ...p,
          cantidad: 1,
          markup: 0,
          descuento: 0
        }));
        setCarrito(formateados);
        localStorage.removeItem('productosParaCotizar');
      } catch (err) {
        console.error('Error al leer productos para cotizar', err);
      }
    }
  }, []);

  useEffect(() => {
    fetch('/api/productos')
      .then(res => res.json())
      .then(data => setProductosDisponibles(data))
      .catch(err => console.error('Error al cargar productos', err));
  }, []);

  const num = (v) => (isNaN(parseFloat(v)) ? 0 : parseFloat(v));
  const showGlobalError = (msg) => setErrorGlobal(msg);
  const showGlobalInfo = (msg) => setInfoGlobal(msg);

  return (
    <div className="bg-light d-flex flex-column min-vh-100">
     

      <main className="flex-grow-1">
        <div className="container my-4">
          <h1 className="mb-3"><i className="bi bi-receipt text-primary"></i> Nueva cotización</h1>
          <div className="mb-3">
  <button
    className="btn btn-outline-secondary d-inline-flex align-items-center"
    onClick={() => window.location.href = '/gigaflop-pp3-app-react/menu'}
  >
    <i className="bi bi-arrow-left me-2"></i> Volver a mis cotizaciones
  </button>
</div>

          {/* Cliente */}
          <div className="card card-soft mb-3">
            <div className="card-body">
              <h5 className="section-title"><i className="bi bi-person-badge"></i> Cliente</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Cliente / CUIT</label>
                  <input
                    className="form-control"
                    placeholder="Razón Social o CUIT (11 dígitos)"
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Contacto</label>
                  <select
                    className="form-select"
                    value={contacto}
                    onChange={(e) => setContacto(e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="1">Juan Pérez - Compras</option>
                    <option value="2">María Gómez - IT</option>
                  </select>
                </div>
              </div>

              <div className="row g-3 mt-1">
                <div className="col-md-3">
                  <label className="form-label">Modalidad</label>
                  <select
                    className="form-select"
                    value={modalidadEntrega}
                    onChange={(e) => {
                      const value = e.target.value;
                      setModalidadEntrega(value);
                      if (value === 'Retiro') {
                        setDireccion('');
                        setCostoEnvio('0');
                      }
                    }}
                  >
                    <option>Envío</option>
                    <option>Retiro</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Dirección</label>
                  <select
                    className="form-select"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    disabled={modalidadEntrega === 'Retiro'}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="1">Sucursal Centro</option>
                    <option value="2">Depósito</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Costo de envío</label>
                  <select
                    className="form-select"
                    value={costoEnvio}
                    onChange={(e) => setCostoEnvio(e.target.value)}
                    disabled={modalidadEntrega === 'Retiro'}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="20">CABA - US$ 20</option>
                    <option value="35">GBA - US$ 35</option>
                    <option value="50">Interior - US$ 50</option>
                    <option value="0">Bonificado</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Condiciones Comerciales */}
          <div className="card card-soft mb-3">
            <div className="card-body">
              <h5 className="section-title"><i className="bi bi-credit-card-2-front"></i> Condiciones Comerciales</h5>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Forma de pago</label>
                  <select
                    className="form-select"
                    value={formaPago}
                    onChange={(e) => setFormaPago(e.target.value)}
                  >
                    <option value="">Seleccioná...</option>
                    <option>Transferencia</option>
                    <option>Cheque</option>
                    <option>Tarjeta de crédito</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Tipo de cambio</label>
                  <select
                    className="form-select"
                    value={tipoCambio}
                    onChange={(e) => setTipoCambio(e.target.value)}
                  >
                    <option value="">Seleccioná...</option>
                    <option>Divisa</option>
                    <option>Billete</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Plazo de pago</label>
                  <div className="input-group">
                    <select
                      className="form-select"
                      value={diasPago}
                      onChange={(e) => setDiasPago(e.target.value)}
                    >
                      <option value="">Seleccioná...</option>
                      <option>0/30/60</option>
                      <option>0</option>
                      <option>15</option>
                      <option>20</option>
                      <option>30</option>
                      <option>60</option>
                    </select>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Otro valor"
                      value={diasPagoExtra}
                      onChange={(e) => setDiasPagoExtra(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="card card-soft">
            <div className="card-body">
              <h5 className="section-title"><i className="bi bi-box-seam"></i> Productos</h5>

              <BuscadorProductos
                productos={productosDisponibles}
                carrito={carrito}
                setCarrito={setCarrito}
                query={query}
                setQuery={setQuery}
                abrirModal={() => setMostrarModal(true)}
              />
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Part #</th>
                      <th>Detalle</th>
                      <th>Cant.</th>
                      <th>Precio</th>
                      <th>Mark-up %</th>
                      <th>Precio+MU</th>
                      <th>Desc. $</th>
                      <th>Base</th>
                      <th>IVA</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {carrito.map((p, i) => {
                      const precioFinal = p.precio * (1 + num(p.markup) / 100);
                      const baseLinea = Math.max(0, (num(p.cantidad) || 1) * precioFinal - num(p.descuento));
                      return (
                        <tr key={p.id}>
                          <td>{p.codigo || p.nombre}</td>
                          <td>{p.descripcion}</td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              max={p.stock}
                              value={p.cantidad}
                              className="form-control form-control-sm"
                              onChange={(e) => {
                                const v = Math.min(Math.max(1, num(e.target.value)), p.stock);
                                const nuevo = [...carrito];
                                nuevo[i].cantidad = v;
                                setCarrito(nuevo);
                              }}
                            />
                          </td>
                          <td>{p.precio.toFixed(2)}</td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              value={p.markup}
                              className="form-control form-control-sm"
                              onChange={(e) => {
                                const nuevo = [...carrito];
                                nuevo[i].markup = Math.max(0, num(e.target.value));
                                setCarrito(nuevo);
                              }}
                            />
                          </td>
                          <td>{precioFinal.toFixed(2)}</td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              value={p.descuento}
                              className="form-control form-control-sm"
                              onChange={(e) => {
                                const nuevo = [...carrito];
                                nuevo[i].descuento = Math.max(0, num(e.target.value));
                                setCarrito(nuevo);
                              }}
                            />
                          </td>
                          <td>{baseLinea.toFixed(2)}</td>
                          <td>{p.iva}%</td>
                          <td className="text-center">
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                if (window.confirm('¿Eliminar este ítem del carrito?')) {
                                  const nuevo = [...carrito];
                                  nuevo.splice(i, 1);
                                  setCarrito(nuevo);
                                }
                              }}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div className="card card-soft mt-3">
            <div className="card-body">
              <h5 className="section-title">Resumen</h5>
              <div className="totales-table">
                {(() => {
                  let base21 = 0, base105 = 0;
                  carrito.forEach(p => {
                    const pf = p.precio * (1 + num(p.markup) / 100);
                    const base = Math.max(0, (num(p.cantidad) || 1) * pf - num(p.descuento));
                    if (num(p.iva) === 21) base21 += base;
                    else if (num(p.iva) === 10.5) base105 += base;
                  });
                  const envio = num(costoEnvio || 0);
                  const iva21 = (base21 + envio) * 0.21;
                  const iva105 = base105 * 0.105;
                  const baseProd = base21 + base105;
                  const baseImp = baseProd + envio;
                  const total = baseImp + iva21 + iva105;

                  return (
                    <>
                      <div className="row"><div className="col-7">Subtotal productos</div><div className="col-5 text-end"><strong>US$ {baseProd.toFixed(2)}</strong></div></div>
                      <div className="row"><div className="col-7">Costo de envío</div><div className="col-5 text-end"><strong>US$ {envio.toFixed(2)}</strong></div></div>
                      <div className="row"><div className="col-7">Base imponible</div><div className="col-5 text-end"><strong>US$ {baseImp.toFixed(2)}</strong></div></div>
                      <div className="row"><div className="col-7">IVA 21% (incluye envío)</div><div className="col-5 text-end"><strong>US$ {iva21.toFixed(2)}</strong></div></div>
                      <div className="row"><div className="col-7">IVA 10.5%</div><div className="col-5 text-end"><strong>US$ {iva105.toFixed(2)}</strong></div></div>
                      <div className="row"><div className="col-7">Total</div><div className="col-5 text-end"><strong>US$ {total.toFixed(2)}</strong></div></div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="d-flex justify-content-center gap-2 my-3">
            <button className="btn btn-outline-secondary" onClick={() => showGlobalInfo('Borrador guardado (mock).')}>
              Guardar borrador
            </button>
            <button className="btn btn-success" onClick={() => showGlobalInfo('Enviada (mock).')}>
              Enviar por correo
            </button>
          </div>

          
        </div>

      </main>
      {mostrarModal && (
  <div className="modal-backdrop-custom">
    <div className="modal-dialog-custom">
      <div className="modal-box">
        <div className="modal-header">
          <h5 className="modal-title"><i className="bi bi-box"></i> Selección de productos</h5>
          <button className="btn-close" onClick={() => setMostrarModal(false)}></button>
        </div>
        <div className="modal-body">
          <p className="text-muted">Acá van los productos más adelante...</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setMostrarModal(false)}>Cerrar</button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default NuevaCotizacion;
