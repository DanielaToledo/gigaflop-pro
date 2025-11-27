//Listar, buscar, editar, eliminar y ver clientes
//Desde el modulo CLIENTES.JSX
//Se listan todos los clientes
//Se puede buscar por razon social
//Se puede editar un cliente (se abre un modal con un formulario)
//Se puede eliminar un cliente (se abre un modal de confirmacion)
//Se puede ver un cliente (se abre un modal con la info completa del cliente)

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Register from '../components/Register';
import MensajeAlerta from '../components/MensajeAlerta';
import '../CSS/menu.css';
import '../CSS/clientes.css';
import ModalVistaPreviaCliente from '../components/ModalVistaPreviaCliente';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const [clienteAEditar, setClienteAEditar] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [modalVistaPreviaVisible, setModalVistaPreviaVisible] = useState(false);
  const [fechaModificacion, setFechaModificacion] = useState(null);
  const [agregandoCondicion, setAgregandoCondicion] = useState(false);


  const prepararClienteParaEditar = (cliente) => {
    const condiciones = (cliente.condiciones_comerciales || []).map((c) => ({
      ...c,
      __nuevo: false,
      confirmado: false
    }));
    return { ...cliente, condiciones_comerciales: condiciones };
  };

  const handleVistaPrevia = async (cliente) => {
    try {
      const res = await axios.get(`http://localhost:4000/api/clientes/completo/${cliente.cuit}`);
      setClienteSeleccionado(res.data);
      setModalVistaPreviaVisible(true);
    } catch (error) {
      console.error('Error al obtener datos del cliente:', error);
      setMensajeError('No se pudo cargar la vista previa del cliente');
    }
  };

  const obtenerClientes = () => {
    axios.get('http://localhost:4000/api/clientes')
      .then((res) => {
        setClientes(res.data);
        setMensajeError('');
      })
      .catch(() => {
        setClientes([]);
        setMensajeError('Error al recuperar la lista de clientes');
      });
  };

  useEffect(() => {
    obtenerClientes();
  }, []);

  useEffect(() => {
    if (busqueda.trim().length < 1) {
      obtenerClientes();
      return;
    }

    const delay = setTimeout(() => {
      axios.get(`http://localhost:4000/api/clientes/buscar/${encodeURIComponent(busqueda)}`)
        .then((res) => {
          const data = res.data;
          const lista = Array.isArray(data) ? data : [data];
          setClientes(lista);
          setMensajeError('');
        })
        .catch(() => {
          setClientes([]);
          setMensajeError('Cliente no encontrado');
        });
    }, 400);

    return () => clearTimeout(delay);
  }, [busqueda]);

  const handleEliminar = (cliente) => {
    setClienteAEliminar(cliente);
  };

  const confirmarEliminacion = async () => {
    try {
      await axios.delete(`http://localhost:4000/api/clientes/${clienteAEliminar.cuit}`);
      setClientes(clientes.filter((c) => c.cuit !== clienteAEliminar.cuit));
      setClienteAEliminar(null);
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      setMensajeError('No se pudo eliminar el cliente');
      setClienteAEliminar(null);
    }
  };

  const cancelarEliminacion = () => {
    setClienteAEliminar(null);
  };

  const handleEditar = async (cliente) => {
    try {
      const res = await axios.get(`http://localhost:4000/api/clientes/completo/${cliente.cuit}`);
      setClienteAEditar(prepararClienteParaEditar(res.data));
      setMensajeExito('');
      setMensajeError('');
      setModalVisible(true);
    } catch (error) {
      console.error('Error al obtener cliente completo:', error);
      setMensajeError('No se pudo cargar la información del cliente');
    }
  };

  useEffect(() => {
    document.body.style.overflow = modalVisible ? 'hidden' : 'auto';
  }, [modalVisible]);

  const confirmarEdicion = async (e) => {
    e.preventDefault();

    if (
      !clienteAEditar.razon_social.trim() ||
      !clienteAEditar.cuit.trim() ||
      !Array.isArray(clienteAEditar.direcciones) ||
      clienteAEditar.direcciones.length === 0
    ) {
      setMensajeError('Todos los campos son obligatorios');
      return;
    }

    try {
      // 🟦 Datos generales
      await axios.put(`http://localhost:4000/api/clientes/${clienteAEditar.cuit}`, {
        razon_social: clienteAEditar.razon_social,
        cuit: clienteAEditar.cuit,
        direccion_cliente: clienteAEditar.direccion_cliente
      });

      // 🟨 Direcciones
      await axios.put(`http://localhost:4000/api/clientes/direcciones/${clienteAEditar.cuit}`, {
        direcciones: clienteAEditar.direcciones || []
      });

      // 🟩 Contactos
      await axios.put(`http://localhost:4000/api/clientes/contactos/${clienteAEditar.cuit}`, {
        contactos: Array.isArray(clienteAEditar.contactos) ? clienteAEditar.contactos : []
      });

      // 🟧 Condiciones comerciales nuevas confirmadas
      const nuevasCondiciones = clienteAEditar.condiciones_comerciales?.filter(c => c.__nuevo && c.confirmado);

      if (nuevasCondiciones.length > 0) {
        await axios.put(`http://localhost:4000/api/clientes/condiciones/${clienteAEditar.cuit}`, {
          condiciones_comerciales: nuevasCondiciones
        });
      }

      // ✅ Actualizar lista y mostrar éxito
      obtenerClientes();
      setMensajeExito('Cliente actualizado correctamente');
      setMensajeError('');

      setClienteAEditar({
        ...clienteAEditar,
        fecha_modificacion: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error al editar cliente:', error);
      setMensajeError('Error al actualizar cliente');
      setClienteAEditar(null);
    }
  };


  return (
    <>

      <div className="encabezado-fijo">
        <Sidebar />
        <div className="background-container-menu">
          <header className="header">

            <div className="title-container">
              <h2 className="title-menu">GIGAFLOP</h2>
            </div>

            <div className='container-icon'>
              <label htmlFor="btn-menu"><i className="bi bi-person-circle custom-icon " ></i></label>
            </div>
          </header>

          <div className="option">
            <NavLink className="option-button" to="/dashboard">Dashboard</NavLink>
            <NavLink className="option-button" to="/menu">Cotizaciones</NavLink>
            <NavLink className="option-button2" to="/clientes">Clientes</NavLink>
            <NavLink className="option-button" to="/productos">Productos</NavLink>
            <NavLink className="option-button" to="/configuracion">Configuración</NavLink>
          </div>
        </div>
        {showRegisterForm && (
          <div className="register-modal-overlay" onClick={() => setShowRegisterForm(false)}>
            <div className="register-modal-content" onClick={(e) => e.stopPropagation()}>
              <Register onClose={() => setShowRegisterForm(false)} />
            </div>
          </div>
        )}


        <div className="menu-superior">
          <div className="cotizatitlecontainer">
            <h3 className="cotizatitle">Clientes</h3>
          </div>
          <div className="buscador-container">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por Razón Social..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {/*<button className="botonlimpiar" onClick={() => { setBusqueda(''); setMensajeError(''); }}>Limpiar</button>*/}
            {mensajeError && <p className="mensaje-error">{mensajeError}</p>}
          </div>
          <div className="botonescontainer">
            <button className="reporte">Reporte</button>
            <button className="nc" onClick={() => setShowRegisterForm(true)}>+ Nuevo Cliente</button>
          </div>
        </div>




        <div className="menu-matriz">
          <div className="table-responsive px-2">
            <table className="table tabla-cotizaciones align-middle">
              <thead className="table-primary">
                <tr>
                  <th>Numero de Cliente</th>
                  <th>Razón Social</th>
                  <th>CUIT</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente, index) => (
                  <tr key={index} className="fila-cotizacion">
                    <td>

                      {cliente.id}

                    </td>
                    <td><button className="btn-link" onClick={() => handleVistaPrevia(cliente)}>{cliente.razon_social}</button></td>
                    <td>{cliente.cuit}</td>
                    <td className="text-end">
                      <button className="btn-cuadro btn-descargar" title="Descargar PDF">
                        <i className="bi bi-file-earmark-arrow-down-fill"></i>
                      </button>
                      <button
                        className="btn-cuadro btn-editar"
                        title="Editar"
                        onClick={() => handleEditar(cliente)}
                      >
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


        {/* MODAL PARA EDITAR UN CLIENTE */}
        {/* MODAL PARA EDITAR UN CLIENTE */}
        {modalVisible && clienteAEditar && (
          <div className="modal-backdrop" style={{ backgroundColor: 'rgba(11, 88, 240, 0.3)' }}>
            <div className="modal-formulario" style={{
              display: 'flex',
              flexDirection: 'column',
              height: '90vh',
              width: '90%',
              maxWidth: '1000px',
              margin: '40px auto',
              backgroundColor: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 0 20px rgba(0,0,0,0.2)'
            }}>
              {/* Cabecera fija */}
              <div className="modal-header bg-primary text-white" style={{ position: 'sticky', top: 0, zIndex: 20 }}>
                <h5 className="modal-title">
                  <i className="bi bi-pencil-square me-2"></i> Editar cliente: {clienteAEditar.razon_social}
                </h5>
                <button className="btn-close" onClick={() => setModalVisible(false)}></button>
              </div>

              {/* Subcabecera fija */}
              <div style={{
                position: 'sticky',
                top: '48px',
                zIndex: 15,
                backgroundColor: '#fff',
                borderBottom: '1px solid #dee2e6',
                padding: '12px 20px'
              }}>
                {mensajeExito && (
                  <div className="alert alert-success d-flex align-items-center mb-2">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    <div>{mensajeExito}</div>
                  </div>
                )}

                <div className="card mb-0">
                  <div className="card-body py-2">
                    <p className="mb-1"><strong>CUIT:</strong> {clienteAEditar.cuit}</p>
                    <p className="mb-0">
                      <strong>Última modificación:</strong>{' '}
                      {clienteAEditar.fecha_modificacion
                        ? `${new Date(clienteAEditar.fecha_modificacion).toLocaleDateString('es-AR')} ${new Date(clienteAEditar.fecha_modificacion).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`
                        : 'Sin registro'}
                    </p>
                  </div>
                </div>

              </div>

              {/* Contenido scrollable */}
              <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                <form onSubmit={confirmarEdicion}>
                  {/* Razón social */}
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      value={clienteAEditar.razon_social}
                      onChange={(e) =>
                        setClienteAEditar({ ...clienteAEditar, razon_social: e.target.value })
                      }
                    />
                  </div>

                  {/* CUIT */}
                  <div className="mb-3">
                    <label className="form-label"><strong>CUIT</strong></label>
                    <input
                      type="text"
                      className="form-control"
                      value={clienteAEditar.cuit}
                      disabled
                    />
                  </div>




                  {/* Condiciones Comerciales para leer y agregar (solo lectura + nuevas) */}
                  {/* Condiciones Comerciales */}
                  <h6 className="mt-4"><strong>Condiciones comerciales</strong></h6>
                  {Array.isArray(clienteAEditar.condiciones_comerciales) && clienteAEditar.condiciones_comerciales.length > 0 ? (
                    clienteAEditar.condiciones_comerciales.map((cond, i) => {
                      const esNueva = cond.__nuevo;
                      const estaConfirmada = cond.confirmado;

                      return (
                        <div
                          key={i}
                          className={`card card-highlight mb-2 p-3 ${estaConfirmada ? 'border-success' : ''} ${!esNueva ? 'text-muted' : ''}`}
                        >
                          <div className="row g-2">
                            {/* Forma de pago */}
                            <div className="col-md-4">
                              <label className="form-label">Forma de pago</label>
                              <input
                                type="text"
                                className="form-control"
                                value={cond.forma_pago || ''}
                                disabled={!esNueva || estaConfirmada}
                                onChange={(e) => {
                                  const nuevas = [...clienteAEditar.condiciones_comerciales];
                                  nuevas[i].forma_pago = e.target.value;
                                  setClienteAEditar({ ...clienteAEditar, condiciones_comerciales: nuevas });
                                }}
                              />
                            </div>

                            {/* Tipo de cambio */}
                            <div className="col-md-3">
                              <label className="form-label">Tipo de cambio</label>
                              <input
                                type="text"
                                className="form-control"
                                value={cond.tipo_cambio || ''}
                                disabled={!esNueva || estaConfirmada}
                                onChange={(e) => {
                                  const nuevas = [...clienteAEditar.condiciones_comerciales];
                                  nuevas[i].tipo_cambio = e.target.value;
                                  setClienteAEditar({ ...clienteAEditar, condiciones_comerciales: nuevas });
                                }}
                              />
                            </div>

                            {/* Días de pago */}
                            <div className="col-md-2">
                              <label className="form-label">Días de pago</label>
                              <input
                                type="number"
                                className="form-control"
                                value={cond.dias_pago ?? ''}
                                disabled={!esNueva || estaConfirmada}
                                onChange={(e) => {
                                  const nuevas = [...clienteAEditar.condiciones_comerciales];
                                  nuevas[i].dias_pago = e.target.value;
                                  setClienteAEditar({ ...clienteAEditar, condiciones_comerciales: nuevas });
                                }}
                              />
                            </div>

                            {/* Mark-up */}
                            <div className="col-md-2">
                              <label className="form-label">Mark-up máximo</label>
                              <input
                                type="number"
                                className="form-control"
                                value={cond.mark_up_maximo ?? ''}
                                disabled={!esNueva || estaConfirmada}
                                onChange={(e) => {
                                  const nuevas = [...clienteAEditar.condiciones_comerciales];
                                  nuevas[i].mark_up_maximo = e.target.value;
                                  setClienteAEditar({ ...clienteAEditar, condiciones_comerciales: nuevas });
                                }}
                              />
                            </div>

                            {/* Observaciones */}
                            <div className="col-md-12">
                              <label className="form-label">Observaciones</label>
                              <input
                                type="text"
                                className="form-control"
                                value={cond.observaciones || ''}
                                disabled={!esNueva || estaConfirmada}
                                onChange={(e) => {
                                  const nuevas = [...clienteAEditar.condiciones_comerciales];
                                  nuevas[i].observaciones = e.target.value;
                                  setClienteAEditar({ ...clienteAEditar, condiciones_comerciales: nuevas });
                                }}
                              />
                            </div>
                          </div>

                          {/* Mensaje de confirmación */}
                          {esNueva && estaConfirmada && (
                            <span className="text-success small mt-2 d-block">
                              Condición agregada correctamente
                            </span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-muted">Sin condiciones comerciales registradas.</p>
                  )}

                  {/* Botón verde para confirmar condición */}
                  {clienteAEditar.condiciones_comerciales?.some(c => c.__nuevo && !c.confirmado) && (
                    <div className="d-flex align-items-center mb-2">
                      <button
                        type="button"
                        className="btn btn-outline-success btn-sm w-auto"
                        onClick={() => {
                          const nuevas = clienteAEditar.condiciones_comerciales.map((c) =>
                            c.__nuevo && !c.confirmado ? { ...c, confirmado: true } : c
                          );
                          setClienteAEditar({ ...clienteAEditar, condiciones_comerciales: nuevas });
                        }}
                      >
                        Confirmar condición
                      </button>
                    </div>
                  )}

                  {/* Botón azul para agregar nueva condición */}
                  <div className="text-start mt-1 mb-3">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => {
                        const nuevas = [
                          ...(clienteAEditar.condiciones_comerciales || []),
                          {
                            forma_pago: '',
                            tipo_cambio: '',
                            dias_pago: '',
                            mark_up_maximo: '',
                            observaciones: '',
                            __nuevo: true,
                            confirmado: false
                          }
                        ];
                        setClienteAEditar({ ...clienteAEditar, condiciones_comerciales: nuevas });
                      }}
                    >
                      Agregar condición comercial
                    </button>
                  </div>






                  {/* Direcciones */}
                  {/* Direcciones */}
                  {/* Direcciones */}
                  <h6 className="mt-4"><strong>Direcciones</strong></h6>
                  {Array.isArray(clienteAEditar.direcciones) && clienteAEditar.direcciones.length > 0 ? (
                    clienteAEditar.direcciones.map((d, i) => (
                      <div
                        key={i}
                        className={`card card-highlight mb-2 p-3 ${d.confirmado ? 'border-success' : ''}`}
                      >
                        <div className="row g-2">
                          {/* Calle */}
                          <div className="col-md-6">
                            <label className="form-label">Calle</label>
                            <input
                              type="text"
                              className="form-control"
                              value={d.calle || ''}
                              disabled={!!d.id}
                              required
                              onChange={(e) => {
                                if (!d.id) {
                                  const nuevas = [...clienteAEditar.direcciones];
                                  nuevas[i].calle = e.target.value;
                                  setClienteAEditar({ ...clienteAEditar, direcciones: nuevas });
                                }
                              }}
                            />
                          </div>

                          {/* Numeración */}
                          <div className="col-md-2">
                            <label className="form-label">Numeración</label>
                            <input
                              type="text"
                              className="form-control"
                              value={d.numeracion || ''}
                              disabled={!!d.id}
                              required
                              onChange={(e) => {
                                if (!d.id) {
                                  const nuevas = [...clienteAEditar.direcciones];
                                  nuevas[i].numeracion = e.target.value;
                                  setClienteAEditar({ ...clienteAEditar, direcciones: nuevas });
                                }
                              }}
                            />
                          </div>

                          {/* Piso */}
                          <div className="col-md-2">
                            <label className="form-label">Piso</label>
                            <input
                              type="text"
                              className="form-control"
                              value={d.piso || ''}
                              disabled={!!d.id}
                              required
                              onChange={(e) => {
                                if (!d.id) {
                                  const nuevas = [...clienteAEditar.direcciones];
                                  nuevas[i].piso = e.target.value;
                                  setClienteAEditar({ ...clienteAEditar, direcciones: nuevas });
                                }
                              }}
                            />
                          </div>

                          {/* Depto */}
                          <div className="col-md-2">
                            <label className="form-label">Depto</label>
                            <input
                              type="text"
                              className="form-control"
                              value={d.depto || ''}
                              disabled={!!d.id}
                              required
                              onChange={(e) => {
                                if (!d.id) {
                                  const nuevas = [...clienteAEditar.direcciones];
                                  nuevas[i].depto = e.target.value;
                                  setClienteAEditar({ ...clienteAEditar, direcciones: nuevas });
                                }
                              }}
                            />
                          </div>

                          {/* Locación */}
                          <div className="col-md-4">
                            <label className="form-label">Locación</label>
                            <input
                              type="text"
                              className="form-control"
                              value={d.locacion || ''}
                              disabled={!!d.id}
                              required
                              onChange={(e) => {
                                if (!d.id) {
                                  const nuevas = [...clienteAEditar.direcciones];
                                  nuevas[i].locacion = e.target.value;
                                  setClienteAEditar({ ...clienteAEditar, direcciones: nuevas });
                                }
                              }}
                            />
                          </div>

                          {/* Localidad */}
                          <div className="col-md-4">
                            <label className="form-label">Localidad</label>
                            <input
                              type="text"
                              className="form-control"
                              value={d.localidad || ''}
                              disabled={!!d.id}
                              required
                              onChange={(e) => {
                                if (!d.id) {
                                  const nuevas = [...clienteAEditar.direcciones];
                                  nuevas[i].localidad = e.target.value;
                                  setClienteAEditar({ ...clienteAEditar, direcciones: nuevas });
                                }
                              }}
                            />
                          </div>

                          {/* Provincia */}
                          <div className="col-md-4">
                            <label className="form-label">Provincia</label>
                            <input
                              type="text"
                              className="form-control"
                              value={d.provincia || ''}
                              disabled={!!d.id}
                              required
                              onChange={(e) => {
                                if (!d.id) {
                                  const nuevas = [...clienteAEditar.direcciones];
                                  nuevas[i].provincia = e.target.value;
                                  setClienteAEditar({ ...clienteAEditar, direcciones: nuevas });
                                }
                              }}
                            />
                          </div>

                          {/* Código Postal */}
                          <div className="col-md-2">
                            <label className="form-label">Código Postal</label>
                            <input
                              type="number"
                              className="form-control"
                              value={d.codigo_postal || ''}
                              disabled={!!d.id}
                              required
                              onChange={(e) => {
                                if (!d.id) {
                                  const nuevas = [...clienteAEditar.direcciones];
                                  nuevas[i].codigo_postal = e.target.value;
                                  setClienteAEditar({ ...clienteAEditar, direcciones: nuevas });
                                }
                              }}
                            />
                          </div>

                          {/* Zona de envío */}
                          <div className="col-md-4">
                            <label className="form-label">Zona de envío</label>
                            <select
                              className="form-select"
                              value={d.zona_envio || 'CABA'}
                              disabled={!!d.id}
                              required
                              onChange={(e) => {
                                if (!d.id) {
                                  const nuevas = [...clienteAEditar.direcciones];
                                  nuevas[i].zona_envio = e.target.value;
                                  setClienteAEditar({ ...clienteAEditar, direcciones: nuevas });
                                }
                              }}
                            >
                              <option value="CABA">CABA</option>
                              <option value="GBA">GBA</option>
                              <option value="INTERIOR">INTERIOR</option>
                            </select>
                          </div>
                        </div>

                        {/* Botón de ayuda visual */}
                        {!d.id && (
                          <div className="mt-2 d-flex align-items-center">
                            <button
                              type="button"
                              className="btn btn-outline-success btn-sm w-auto"
                              onClick={() => {
                                const nuevas = [...clienteAEditar.direcciones];
                                nuevas[i].confirmado = true;
                                setClienteAEditar({ ...clienteAEditar, direcciones: nuevas });
                              }}
                            >
                              Confirmar dirección
                            </button>
                            {d.confirmado && (
                              <span className="ms-2 text-success small">
                                Dirección agregada correctamente
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">Sin direcciones registradas.</p>
                  )}

                  <div className="text-start mb-3">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => {
                        const nuevas = [...(clienteAEditar.direcciones || []), {
                          calle: '',
                          numeracion: '',
                          piso: '',
                          depto: '',
                          locacion: '',
                          localidad: '',
                          provincia: '',
                          codigo_postal: '',
                          zona_envio: 'CABA',
                          confirmado: false
                        }];
                        setClienteAEditar({ ...clienteAEditar, direcciones: nuevas });
                      }}
                    >
                      + Agregar dirección
                    </button>
                  </div>


                  {/* Contactos */}
                  {Array.isArray(clienteAEditar.contactos) && clienteAEditar.contactos.length > 0 ? (
                    clienteAEditar.contactos.map((c, i) => (
                      <div key={i} className={`card mb-2 p-3 ${c.confirmado ? 'border-success' : ''}`}>
                        <div className="row g-2">
                          {/* Nombre */}
                          <div className="col-md-4">
                            <label className="form-label">Nombre</label>
                            <input
                              type="text"
                              className="form-control"
                              value={c.nombre_contacto || ''}
                              disabled={!!c.id}
                              required
                              onChange={(e) => {
                                if (!c.id) {
                                  const nuevos = [...clienteAEditar.contactos];
                                  nuevos[i].nombre_contacto = e.target.value;
                                  setClienteAEditar({ ...clienteAEditar, contactos: nuevos });
                                }
                              }}
                            />
                          </div>
                          {/* Apellido */}
                          <div className="col-md-4">
                            <label className="form-label">Apellido</label>
                            <input
                              type="text"
                              className="form-control"
                              value={c.apellido || ''}
                              disabled={!!c.id}
                              required
                              onChange={(e) => {
                                if (!c.id) {
                                  const nuevos = [...clienteAEditar.contactos];
                                  nuevos[i].apellido = e.target.value;
                                  setClienteAEditar({ ...clienteAEditar, contactos: nuevos });
                                }
                              }}
                            />
                          </div>
                          {/* Área */}
                          <div className="col-md-4">
                            <label className="form-label">Área</label>
                            <input
                              type="text"
                              className="form-control"
                              value={c.area_contacto || ''}
                              disabled={!!c.id}
                              required
                              onChange={(e) => {
                                if (!c.id) {
                                  const nuevos = [...clienteAEditar.contactos];
                                  nuevos[i].area_contacto = e.target.value;
                                  setClienteAEditar({ ...clienteAEditar, contactos: nuevos });
                                }
                              }}
                            />
                          </div>
                          {/* Teléfono */}
                          <div className="col-md-6">
                            <label className="form-label">Teléfono</label>
                            <input
                              type="text"
                              className="form-control"
                              value={c.telefono || ''}
                              disabled={!!c.id}
                              required
                              onChange={(e) => {
                                if (!c.id) {
                                  const nuevos = [...clienteAEditar.contactos];
                                  nuevos[i].telefono = e.target.value;
                                  setClienteAEditar({ ...clienteAEditar, contactos: nuevos });
                                }
                              }}
                            />
                          </div>
                          {/* Email */}
                          <div className="col-md-6">
                            <label className="form-label">Email</label>
                            <input
                              type="email"
                              className="form-control"
                              value={c.email || ''}
                              disabled={!!c.id}
                              required
                              onChange={(e) => {
                                if (!c.id) {
                                  const nuevos = [...clienteAEditar.contactos];
                                  nuevos[i].email = e.target.value;
                                  setClienteAEditar({ ...clienteAEditar, contactos: nuevos });
                                }
                              }}
                            />
                          </div>
                        </div>

                        {/* Botón de ayuda visual */}
                        {!c.id && (
                          <div className="mt-2 d-flex align-items-center">
                            <button
                              type="button"
                              className="btn btn-outline-success btn-sm w-auto"
                              onClick={() => {
                                const nuevos = [...clienteAEditar.contactos];
                                nuevos[i].confirmado = true;
                                setClienteAEditar({ ...clienteAEditar, contactos: nuevos });
                              }}
                            >
                              Confirmar contacto
                            </button>
                            {c.confirmado && (
                              <span className="ms-2 text-success small">
                                Contacto agregado correctamente
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">Sin contactos registrados.</p>
                  )}

                  <div className="text-start mb-3">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => {
                        const nuevos = [...(clienteAEditar.contactos || []), {
                          nombre_contacto: '',
                          apellido: '',
                          area_contacto: '',
                          telefono: '',
                          email: '',
                          confirmado: false
                        }];
                        setClienteAEditar({ ...clienteAEditar, contactos: nuevos });
                      }}
                    >
                      + Agregar contacto
                    </button>
                  </div>










                  {/* Footer fijo */}
                  <div
                    className="modal-footer"
                    style={{
                      position: 'sticky',
                      bottom: 0,
                      zIndex: 20,
                      backgroundColor: '#fff',
                      borderTop: '1px solid #dee2e6',
                      padding: '12px 20px',
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '10px'
                    }}
                  >
                    <button type="submit" className="btn btn-success">
                      <i className="bi bi-save me-2"></i> Guardar cambios
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setModalVisible(false)}>
                      Cancelar
                    </button>
                  </div>

                </form>
              </div>
            </div>
          </div>
        )}
        {/* MODAL VISTA PREVIA CLIENTE */}
        {modalVistaPreviaVisible && clienteSeleccionado && (
          <ModalVistaPreviaCliente
            visible={modalVistaPreviaVisible}
            onClose={() => setModalVistaPreviaVisible(false)}
            cliente={clienteSeleccionado}
            fechaModificacion={fechaModificacion} // 👉 pasamos la fecha como prop
          />
        )}
      </div>
    </>
  );









};

export default Clientes;