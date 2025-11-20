import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Register from '../components/Register';
import MensajeAlerta from '../components/MensajeAlerta';
import '../CSS/menu.css';
import '../CSS/clientes.css';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const [clienteAEditar, setClienteAEditar] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

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

  //eliminar cliente
  const handleEliminar = (cliente) => {
    setClienteAEliminar(cliente);
  };


  // confirmar eliminacion
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

  // cancelar eliminacion
  const cancelarEliminacion = () => {
    setClienteAEliminar(null);
  };


  //editar cliente
  const handleEditar = async (cliente) => {
    try {
      const res = await axios.get(`http://localhost:4000/api/clientes/completo/${cliente.cuit}`);
      setClienteAEditar(res.data);
      setMensajeExito('');
      setMensajeError('');
      setModalVisible(true);
    } catch (error) {
      console.error('Error al obtener cliente completo:', error);
      setMensajeError('No se pudo cargar la información del cliente');
    }
  };
  useEffect(() => {
    if (modalVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [modalVisible]);


  // confirmar edicion
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
      // 🧾 Actualizar datos básicos del cliente
      await axios.put(`http://localhost:4000/api/clientes/${clienteAEditar.cuit}`, {
        razon_social: clienteAEditar.razon_social,
        cuit: clienteAEditar.cuit,
        direccion_cliente: clienteAEditar.direccion_cliente
      });

      // 📍 Actualizar direcciones del cliente
      await axios.put(`http://localhost:4000/api/clientes/direcciones/${clienteAEditar.cuit}`, {
        direcciones: clienteAEditar.direcciones || []
      });

      //Actualizar condiciones Comerciales del cliente 
      await axios.put(`http://localhost:4000/api/clientes/condiciones/${clienteAEditar.cuit}`, {
        condiciones_comerciales: clienteAEditar.condiciones_comerciales
      });


      obtenerClientes(); // refresca la lista
      setMensajeExito('✅ Cliente actualizado correctamente');
      setMensajeError('');
    } catch (error) {
      console.error('Error al editar cliente:', error);
      setMensajeError('Error al actualizar cliente');
      setClienteAEditar(null);
    }
  };

  return (
    <>
      <Sidebar />
      <div className="background-container-menu">
        <header className="header">
          <div className="container-header">
            <div className="title-container">
              <h2 className="title-menu">GIGAFLOP</h2>
            </div>
          </div>
          <div className="container-icon">
            <label htmlFor="btn-menu"><i className="bi bi-person-circle custom-icon"></i></label>
          </div>
        </header>

        <div className="option">
          <NavLink className="option-button" to="/menu">Cotizaciones</NavLink>
          <NavLink className="option-button2" to="/clientes">Clientes</NavLink>
          <NavLink className="option-button" to="/productos">Productos</NavLink>
          <NavLink className="option-button" to="/configuracion">Configuración</NavLink>
        </div>

        {showRegisterForm && (
          <div className="register-modal-overlay" onClick={() => setShowRegisterForm(false)}>
            <div className="register-modal-content" onClick={(e) => e.stopPropagation()}>
              <Register onClose={() => setShowRegisterForm(false)} />
            </div>
          </div>
        )}

        <div className="menubox">
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
                    <th>ID</th>
                    <th>Razón Social</th>
                    <th>CUIT</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente, index) => (
                    <tr key={index} className="fila-cotizacion">
                      <td>
                        <button className="btn-link" onClick={() => setModalVisible(true)}>
                          {cliente.id}
                        </button>
                      </td>
                      <td>{cliente.razon_social}</td>
                      <td>{cliente.cuit}</td>
                      <td className="text-end">
                        <button className="btn-cuadro btn-descargar" title="Descargar PDF">
                          <i className="bi bi-file-earmark-arrow-down-fill"></i>
                        </button>
                        <button className="btn-cuadro btn-editar" title="Editar" onClick={() => handleEditar(cliente)}>
                          <i className="bi bi-pencil-fill"></i>
                        </button>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>



         {/* ESTO ES EL MODAL PARA EDITAR UN CLIENTE */}
        {modalVisible && clienteAEditar && (
          <div
            className="modal-backdrop"
            style={{
              backgroundColor: 'rgba(11, 88, 240, 0.3)', // celeste translúcido
              backdropFilter: 'blur(0px)', // opcional: suaviza el fondo
            }}
          >

            <div className="modal-formulario" style={{
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '20px',
              backgroundColor: 'white',
              borderRadius: '8px',
              maxWidth: '1000px',       // ✅ más ancho
              width: '90%',             // ✅ ocupa más del viewport
              margin: '40px auto'       // ✅ centrado vertical y horizontal
            }}>
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-pencil-square me-2"></i> Editar cliente: {clienteAEditar.razon_social}
                </h5>
                <button className="btn-close" onClick={() => {
                  setModalVisible(false);
                  setMensajeExito('');
                  setMensajeError('');
                  setClienteAEditar(null);
                }} ></button>
              </div>

              <div className="modal-body">
                {mensajeExito && (
                  <div className="alert alert-success d-flex align-items-center">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    <div>{mensajeExito}</div>
                  </div>
                )}




                <div className="card mb-3">
                  <div className="card-body">
                    <p><strong>CUIT:</strong> {clienteAEditar.cuit}</p>
                    <p><strong>Estado:</strong> {clienteAEditar.activo ? 'Activo' : 'Inactivo'}</p>
                    <p><strong>Última modificación:</strong> {clienteAEditar.fecha_modificacion || 'Sin registro'}</p>
                  </div>

                </div>

                <form onSubmit={confirmarEdicion}>
                  <div className="mb-3">
                    <label className="form-label"><strong> Razón Social </strong></label>
                    <input
                      type="text"
                      className="form-control"
                      value={clienteAEditar.razon_social}
                      onChange={(e) =>
                        setClienteAEditar({ ...clienteAEditar, razon_social: e.target.value })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label"> <strong> CUIT </strong> </label>
                    <input
                      type="text"
                      className="form-control"
                      value={clienteAEditar.cuit}
                      onChange={(e) =>
                        setClienteAEditar({ ...clienteAEditar, cuit: e.target.value })
                      }
                    />
                  </div>






                  {/* EDITAR LAS Condiciones comerciales DEL CLIENTE */}
                  <h6 className="mt-4"><strong>Condiciones comerciales</strong></h6>

                  <div className="mb-3">
                    <label className="form-label"><strong>Forma de pago</strong></label>
                    {['Transferencia', 'Tarjeta de crédito', 'Cheque', 'E-cheq'].map(opcion => (
                      <div key={opcion} className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={clienteAEditar.condiciones_comerciales?.forma_pago?.includes(opcion)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setClienteAEditar(prev => ({
                              ...prev,
                              condiciones_comerciales: {
                                ...prev.condiciones_comerciales,
                                forma_pago: checked
                                  ? [...(prev.condiciones_comerciales?.forma_pago || []), opcion]
                                  : prev.condiciones_comerciales.forma_pago.filter(f => f !== opcion)
                              }
                            }));
                          }}
                        />
                        <label className="form-check-label">{opcion}</label>
                      </div>
                    ))}
                  </div>

                  <div className="mb-3">
                    <label className="form-label"><strong>Tipo de cambio</strong></label>
                    {['Billete', 'Divisa'].map(tipo => (
                      <div key={tipo} className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={clienteAEditar.condiciones_comerciales?.tipo_cambio?.includes(tipo)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setClienteAEditar(prev => ({
                              ...prev,
                              condiciones_comerciales: {
                                ...prev.condiciones_comerciales,
                                tipo_cambio: checked
                                  ? [...(prev.condiciones_comerciales?.tipo_cambio || []), tipo]
                                  : prev.condiciones_comerciales.tipo_cambio.filter(t => t !== tipo)
                              }
                            }));
                          }}
                        />
                        <label className="form-check-label">{tipo}</label>
                      </div>
                    ))}
                  </div>

                  <div className="mb-3">
                    <label className="form-label"><strong>Días de pago</strong></label>
                    {[1, 7, 15, 18, 20, 22, 25, 30, 40].map(dia => (
                      <div key={dia} className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          value={dia}
                          checked={clienteAEditar.condiciones_comerciales?.dias_pago?.includes(dia)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const valor = Number(e.target.value);
                            setClienteAEditar(prev => ({
                              ...prev,
                              condiciones_comerciales: {
                                ...prev.condiciones_comerciales,
                                dias_pago: checked
                                  ? [...(prev.condiciones_comerciales?.dias_pago || []), valor]
                                  : prev.condiciones_comerciales.dias_pago.filter(d => d !== valor)
                              }
                            }));
                          }}
                        />
                        <label className="form-check-label">Día {dia}</label>
                      </div>
                    ))}
                  </div>






                  {/* EDITAR LAS Direcciones DEL CLIENTE  */}
                  {/* Otras  Direcciones  */}

                  <h6 className="mt-4"> <strong> Direcciones </strong></h6>
                  {clienteAEditar.direcciones?.map((dir, index) => (
                    <div key={index} className="card mb-2 p-3">
                      <div className="row g-2">
                        <div className="col-md-3">
                          <label className="form-label">Calle</label>
                          <input
                            type="text"
                            className="form-control"
                            value={dir.calle}
                            onChange={(e) => {
                              const nuevas = [...clienteAEditar.direcciones];
                              nuevas[index].calle = e.target.value;
                              setClienteAEditar({ ...clienteAEditar, direcciones: nuevas });
                            }}
                          />
                        </div>



                        <div className="col-md-2">
                          <label className="form-label">Número</label>
                          <input
                            type="text"
                            className="form-control"
                            value={dir.numeracion}
                            onChange={(e) => {
                              const nuevas = [...clienteAEditar.direcciones];
                              nuevas[index].numeracion = e.target.value;
                              setClienteAEditar({ ...clienteAEditar, direcciones: nuevas });
                            }}
                          />
                        </div>

                        <div className="col-md-3">
                          <label className="form-label">Localidad</label>
                          <input
                            type="text"
                            className="form-control"
                            value={dir.localidad}
                            onChange={(e) => {
                              const nuevas = [...clienteAEditar.direcciones];
                              nuevas[index].localidad = e.target.value;
                              setClienteAEditar({ ...clienteAEditar, direcciones: nuevas });
                            }}
                          />
                        </div>

                        <div className="col-md-2">
                          <label className="form-label">Provincia</label>
                          <input
                            type="text"
                            className="form-control"
                            value={dir.provincia}
                            onChange={(e) => {
                              const nuevas = [...clienteAEditar.direcciones];
                              nuevas[index].provincia = e.target.value;
                              setClienteAEditar({ ...clienteAEditar, direcciones: nuevas });
                            }}
                          />
                        </div>

                        <div className="col-md-1">
                          <label className="form-label">CP</label>
                          <input
                            type="text"
                            className="form-control"
                            value={dir.codigo_postal}
                            onChange={(e) => {
                              const nuevas = [...clienteAEditar.direcciones];
                              nuevas[index].codigo_postal = e.target.value;
                              setClienteAEditar({ ...clienteAEditar, direcciones: nuevas });
                            }}
                          />
                        </div>

                        <div className="col-md-2">
                          <label className="form-label">Piso</label>
                          <input
                            type="text"
                            className="form-control"
                            value={dir.piso}
                            onChange={(e) => {
                              const nuevas = [...clienteAEditar.direcciones];
                              nuevas[index].piso = e.target.value;
                              setClienteAEditar({ ...clienteAEditar, direcciones: nuevas });
                            }}
                          />
                        </div>

                        <div className="col-md-2">
                          <label className="form-label">Depto</label>
                          <input
                            type="text"
                            className="form-control"
                            value={dir.depto}
                            onChange={(e) => {
                              const nuevas = [...clienteAEditar.direcciones];
                              nuevas[index].depto = e.target.value;
                              setClienteAEditar({ ...clienteAEditar, direcciones: nuevas });
                            }}
                          />
                        </div>

                        <div className="col-md-3">
                          <label className="form-label">Locación</label>
                          <input
                            type="text"
                            className="form-control"
                            value={dir.locacion}
                            onChange={(e) => {
                              const nuevas = [...clienteAEditar.direcciones];
                              nuevas[index].locacion = e.target.value;
                              setClienteAEditar({ ...clienteAEditar, direcciones: nuevas });
                            }}
                          />
                        </div>

                        <div className="col-md-2">
                          <label className="form-label">Zona envío</label>
                          <select
                            className="form-select"
                            value={dir.zona_envio}
                            onChange={(e) => {
                              const nuevas = [...clienteAEditar.direcciones];
                              nuevas[index].zona_envio = e.target.value;
                              setClienteAEditar({ ...clienteAEditar, direcciones: nuevas });
                            }}
                          >
                            <option value="">Seleccionar</option>
                            <option value="CABA">CABA</option>
                            <option value="GBA">GBA</option>
                            <option value="INTERIOR">INTERIOR</option>
                          </select>
                        </div>








 {/* BOTONES DE ELIMINAR Y AGREGAR LA DIRECCION AL EDITAR */}

                      </div>
                      <div className="text-end mt-2">
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => {
                            const nuevas = clienteAEditar.direcciones.filter((_, i) => i !== index);
                            setClienteAEditar({ ...clienteAEditar, direcciones: nuevas });
                          }}
                        >
                          Eliminar dirección
                        </button>
                      </div>
                    </div>
                  ))}

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
                          zona_envio: ''


                        }];
                        setClienteAEditar({ ...clienteAEditar, direcciones: nuevas });
                      }}
                    >
                      + Agregar dirección
                    </button>
                  </div>






                  {/* Podés agregar más campos aquí si lo necesitás */}

                  <div className="modal-footer">
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

      </div>
    </>
  );
};

export default Clientes;