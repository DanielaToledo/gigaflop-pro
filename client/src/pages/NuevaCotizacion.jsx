import React, { useEffect, useState } from 'react';
import { useMemo } from 'react';
import axios from 'axios';
import BuscadorProductos from '../components/BuscadorProductos';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../CSS/nuevaCotizacion.css';
import { useLocation } from 'react-router-dom';


const NuevaCotizacion = () => {
  const location = useLocation();

  const [vigencia, setVigencia] = useState('');
  const [cliente, setCliente] = useState('');
  const [contacto, setContacto] = useState('');
  const [clientesDisponibles, setClientesDisponibles] = useState([]);
  const [contactosCliente, setContactosCliente] = useState([]);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);


  const [modalidadEntrega, setModalidadEntrega] = useState('Envío');
  const [direccion, setDireccion] = useState('');
  const [costoEnvio, setCostoEnvio] = useState('');
  const [formaPago, setFormaPago] = useState('');
  const [tipoCambio, setTipoCambio] = useState('');
  const [diasPago, setDiasPago] = useState('');
  const [diasPagoExtra, setDiasPagoExtra] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [carritoInicializado, setCarritoInicializado] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState('');
  const [infoGlobal, setInfoGlobal] = useState('');
  const [fechaHoy, setFechaHoy] = useState('');
  const [yearActual, setYearActual] = useState(new Date().getFullYear());
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [seleccionModal, setSeleccionModal] = useState({});
  const [query, setQuery] = useState('');
  const [condicionesComerciales, setCondicionesComerciales] = useState([]);
  const [opcionesDiasPago, setOpcionesDiasPago] = useState([]);





  //fecha de hoy para usar en la cotizacion
  useEffect(() => {
    setFechaHoy(new Date().toISOString().slice(0, 10));
  }, []);

  //el carrito se abre con los productos enviados desde la pagina de productos o los que estan en localStorage
  useEffect(() => {
    if (location.state?.carrito) {
      const productos = location.state.carrito;
      const formateados = productos.map(p => ({
        ...p,
        cantidad: p.quantity || 1,
        markup: p.markup ?? 0,
        descuento: p.descuento ?? 0,
        precio: num(p.precio) || 0,
        tasa_iva: num(p.tasa_iva) || 21
      }));
      setCarrito(formateados);
    } else {
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
    }
  }, [location.state]);


  // Cargar productos disponibles para el buscador (mock)
  useEffect(() => {
    axios.get('/api/productos')
      .then(({ data }) => setProductosDisponibles(data))
      .catch(err => console.error('Error al cargar productos', err));
  }, []);


  // Contacto seleccionado
  const contactoSeleccionado = contactosCliente.find(c => c.id === parseInt(contacto));
  const num = (v) => (isNaN(parseFloat(v)) ? 0 : parseFloat(v));
  const showGlobalError = (msg) => setErrorGlobal(msg);
  const showGlobalInfo = (msg) => setInfoGlobal(msg);

  const [ocultarModal, setOcultarModal] = useState(false);
  const cerrarModalConTransicion = () => {
    setOcultarModal(true);
    setTimeout(() => {
      setMostrarModal(false);
      setOcultarModal(false);
    }, 300); // duración de la transición
  };

  // Cargar clientes disponibles (mock)
  useEffect(() => {
    axios.get('/api/clientes')
      .then(({ data }) => setClientesDisponibles(data))
      .catch(err => console.error('Error al cargar clientes', err));
  }, []);

  // Cargar contactos del cliente seleccionado
  const handleSeleccionCliente = async (id) => {
    setCliente(id);
    try {
      const { data } = await axios.get(`/api/clientes/${id}/contactos`);
      setContactosCliente(data);
      setContacto('');
      setClienteSeleccionado(id); // 🔥 Esto es lo que faltaba
    } catch (err) {
      console.error('Error al cargar contactos del cliente', err);
    }
  };

  // Buscar clientes a medida que se escribe
  useEffect(() => {

    console.log('Buscando cliente:', busquedaCliente); // ✅
    const buscarClientes = async () => {
      if (busquedaCliente.trim().length < 2) {
        setSugerencias([]);
        return;
      }

      try {
        const res = await axios.get(`/api/clientes/buscar/${busquedaCliente}`, {
          withCredentials: true,
        });
        console.log('Respuesta de clientes:', res.data); // ✅
        setSugerencias(res.data || []);
      } catch (err) {
        console.error('Error al buscar clientes:', err);
        setSugerencias([]);
      }
    };

    const delay = setTimeout(buscarClientes, 300); // debounce
    return () => clearTimeout(delay);
  }, [busquedaCliente]);


  // Cargar opciones de plazos de pago
  useEffect(() => {
    if (clienteSeleccionado) {
      axios.get(`/api/clientes/${clienteSeleccionado}/dias-pago`)
        .then(({ data }) => {
          const opciones = data.map(String);
          setOpcionesDiasPago(opciones);
        })
        .catch(err => console.error('Error al cargar días de pago del cliente', err));
    }
  }, [clienteSeleccionado]);


  // Cargar condiciones comerciales al seleccionar cliente
 const cargarCondiciones = async (idCliente) => {
  try {
    const { data } = await axios.get(`/api/clientes/${idCliente}/condiciones`, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    const forma = (data.forma_pago || '').trim();
    const cambio = (data.tipo_cambio || '').trim();
    const dias = String(data.dias_pago || '').trim();

    setFormaPago(forma);

    setTipoCambio(''); // limpia primero
    setTimeout(() => {
      setTipoCambio(cambio); // actualiza después
    }, 0);

    if (opcionesDiasPago.includes(dias)) {
      setDiasPago(dias);
      setDiasPagoExtra('');
    } else {
      setDiasPago('');
      setDiasPagoExtra(dias);
    }

    console.log('Tipo de cambio recibido:', cambio);
    console.log('Forma de pago:', forma);
    console.log('Días de pago:', dias);
  } catch (err) {
    console.error('Error al cargar condiciones comerciales:', err);
  }
};
  useEffect(() => {
    if (clienteSeleccionado) {
      cargarCondiciones(clienteSeleccionado);
    }
  }, [clienteSeleccionado]);






  const resumen = useMemo(() => {
    let base21 = 0, base105 = 0;
    let totalDescuentos = 0;

    carrito.forEach(p => {
      const precio = isNaN(parseFloat(p.precio)) ? 0 : parseFloat(p.precio);
      const cantidad = isNaN(parseFloat(p.cantidad)) ? 1 : parseFloat(p.cantidad);
      const markup = isNaN(parseFloat(p.markup)) ? 0 : parseFloat(p.markup);
      const descuento = isNaN(parseFloat(p.descuento)) ? 0 : parseFloat(p.descuento);
      const iva = isNaN(parseFloat(p.tasa_iva)) ? 21 : parseFloat(p.tasa_iva);
      totalDescuentos += descuento;
      const pf = precio * (1 + markup / 100);
      const base = Math.max(0, cantidad * pf - descuento);

      if (iva === 21) base21 += base;
      else if (iva === 10.5) base105 += base;
      else base21 += base;
    });

    const envio = isNaN(parseFloat(costoEnvio)) ? 0 : parseFloat(costoEnvio);
    const iva21 = (base21 + envio) * 0.21;
    const iva105 = base105 * 0.105;
    const baseProd = base21 + base105;
    const baseImp = baseProd + envio;
    const total = baseImp + iva21 + iva105;

    return { baseProd, envio, baseImp, iva21, iva105, total, totalDescuentos };
  }, [carrito, costoEnvio]);


  console.log('Carrito actualizado:', carrito);



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
                {/* Input de búsqueda */}
                <div className="col-md-6 buscador-cliente-container">
                  <label className="form-label">Cliente / CUIT</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar cliente por nombre o CUIT"
                    value={busquedaCliente}
                    onChange={(e) => setBusquedaCliente(e.target.value)}
                  />




                  {sugerencias.length > 0 && (
                    <ul className="sugerencias-lista">
                      {sugerencias.map((c) => (
                        <li
                          key={c.id}
                          className="sugerencia-item"
                          onClick={() => {
                            setClienteSeleccionado(c);
                            setCliente(c.id); // para backend
                            handleSeleccionCliente(c.id); // ✅ carga contactos
                            setBusquedaCliente(c.razon_social); // mostrar en input
                            setSugerencias([]);
                          }}
                        >
                          {c.razon_social} – CUIT: {c.cuit}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Contacto */}
                <div className="col-md-6">
                  <label className="form-label">Contacto</label>
                  <select
                    className="form-select"
                    value={contacto}
                    onChange={(e) => setContacto(e.target.value)}
                    disabled={contactosCliente.length === 0}
                  >
                    <option value="">Seleccionar contacto...</option>
                    {contactosCliente.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nombre_contacto} {c.apellido}
                      </option>
                    ))}
                  </select>
                </div>
              </div>


              {/* modalidad de emtrega */}
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
  <input
    type="text"
    className="form-control"
    value={tipoCambio}
    readOnly
    tabIndex={-1} // opcional: evita que el usuario lo enfoque con Tab
  />
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
                      {opcionesDiasPago.map((opcion, idx) => (
                        <option key={idx} value={opcion}>{opcion}</option>
                      ))}
                    </select>

                    {/* Mostrar campo extra solo si el valor actual no está en el select */}
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
                      const precioFinal = num(p.precio) * (1 + num(p.markup) / 100);
                      const baseLinea = Math.max(0, (num(p.cantidad) || 1) * precioFinal - num(p.descuento));

                      return (
                        <tr key={p.id}>
                          <td>{p.part_number}</td>
                          <td>{p.detalle}</td>


                          {/* Cantidad editable */}
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
                                nuevo[i] = { ...nuevo[i], cantidad: v };
                                setCarrito(nuevo);
                              }}
                            />
                          </td>

                          {/* Precio NO editable */}
                          <td>{num(p.precio).toFixed(2)}</td>

                          {/* Margen editable */}
                          <td>
                            <input
                              type="number"
                              min="0"
                              value={p.markup}
                              className="form-control form-control-sm"
                              onChange={(e) => {
                                const nuevo = [...carrito];
                                nuevo[i] = { ...nuevo[i], markup: Math.max(0, num(e.target.value)) };
                                setCarrito(nuevo);
                              }}
                            />
                          </td>

                          {/* Precio final */}
                          <td>{precioFinal.toFixed(2)}</td>

                          {/* Descuento editable */}
                          <td>
                            <input
                              type="number"
                              min="0"
                              value={p.descuento}
                              className="form-control form-control-sm"
                              onChange={(e) => {
                                const nuevo = [...carrito];
                                nuevo[i] = { ...nuevo[i], descuento: Math.max(0, num(e.target.value)) };
                                setCarrito(nuevo);
                              }}
                            />
                          </td>

                          {/* Base */}
                          <td>{baseLinea.toFixed(2)}</td>

                          {/* IVA NO editable */}
                          <td>{p.iva}%</td>

                          {/* Eliminar */}
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


          {/* Resumen  calcula los totales y muestra */}
          <div className="card card-soft mt-3">
            <div className="card-body">
              <h5 className="section-title">Resumen</h5>
              <div className="totales-table">
                <div className="row"><div className="col-7">Subtotal productos</div><div className="col-5 text-end"><strong>US$ {resumen.baseProd.toFixed(2)}</strong></div></div>
                <div className="row"><div className="col-7">Costo de envío</div><div className="col-5 text-end"><strong>US$ {resumen.envio.toFixed(2)}</strong></div></div>
                <div className="row"><div className="col-7">Base imponible</div><div className="col-5 text-end"><strong>US$ {resumen.baseImp.toFixed(2)}</strong></div></div>
                <div className="row"><div className="col-7">IVA 21% (incluye envío)</div><div className="col-5 text-end"><strong>US$ {resumen.iva21.toFixed(2)}</strong></div></div>
                <div className="row"><div className="col-7">IVA 10.5%</div><div className="col-5 text-end"><strong>US$ {resumen.iva105.toFixed(2)}</strong></div></div>
                <div className="row"><div className="col-7">Descuento total aplicado</div><div className="col-5 text-end"><strong>US$ {resumen.totalDescuentos.toFixed(2)}</strong></div>
                  <div className="row"><div className="col-7">Total</div><div className="col-5 text-end"><strong>US$ {resumen.total.toFixed(2)}</strong></div>
                  </div>
                </div>
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
        <div
          className={`modal-backdrop-custom ${mostrarModal ? 'fade-in' : ocultarModal ? 'fade-out' : 'd-none'}`}
        >
          <div className="modal-dialog-custom">
            <div className="modal-box">
              <div className="modal-header">
                <h5 className="modal-title"><i className="bi bi-box"></i> Selección de productos</h5>
                <button className="btn-close" onClick={cerrarModalConTransicion}></button>
              </div>
              <div className="modal-body">
                <p className="text-muted">Acá van los productos más adelante...</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={cerrarModalConTransicion}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default NuevaCotizacion;
