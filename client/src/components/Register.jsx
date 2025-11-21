//REGISTRAR UN CLINETE EN EL MODULO CLIENTE


import React, { useState } from 'react';
import axios from 'axios';

// Componente para registrar un nuevo cliente
const Register = ({ onClose }) => {
  const [razonSocial, setRazonSocial] = useState('');
  const [cuit, setCuit] = useState('');
  const [direcciones, setDirecciones] = useState([]);
  const [direccionEditando, setDireccionEditando] = useState(null);
const [condicionEditando, setCondicionEditando] = useState(null);


//condicion comercial 
const [condicionActual, setCondicionActual] = useState({
  forma_pago: '',
  tipo_cambio: '',
  dias_pago: '',
  mark_up_maximo: ''
});

const [condicionesComerciales, setCondicionesComerciales] = useState([]);

//direccion
  const [direccionActual, setDireccionActual] = useState({
    calle: '',
    numeracion: '',
    piso: '',
    depto: '',
    locacion: '',
    localidad: '',
    provincia: '',
    codigo_postal: '',
    zona_envio: ''
  });

  const [contactoEditando, setContactoEditando] = useState(null);
  const [contactos, setContactos] = useState([]);
  const [contactoActual, setContactoActual] = useState({
    nombre_contacto: '',
    apellido: '',
    telefono: '',
    email: '',
    area_contacto: ''
  });

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // Direcciones
  const handleAgregarDireccion = () => {
    setDirecciones([...direcciones, direccionActual]);
    setDireccionActual({
      calle: '',
      numeracion: '',
      piso: '',
      depto: '',
      locacion: '',
      localidad: '',
      provincia: '',
      codigo_postal: '',
      zona_envio: ''
    });
  };

  const handleActualizarDireccion = () => {
    const nuevas = [...direcciones];
    nuevas[direccionEditando] = direccionActual;
    setDirecciones(nuevas);
    setDireccionActual({
      calle: '',
      numeracion: '',
      piso: '',
      depto: '',
      locacion: '',
      localidad: '',
      provincia: '',
      codigo_postal: '',
      zona_envio: ''
    });
    setDireccionEditando(null);
  };

  // Contactos
  const handleAgregarContacto = () => {
    setContactos([...contactos, contactoActual]);
    setContactoActual({
      nombre_contacto: '',
      apellido: '',
      telefono: '',
      email: '',
      area_contacto: ''
    });
  };

  const handleActualizarContacto = () => {
    const nuevos = [...contactos];
    nuevos[contactoEditando] = contactoActual;
    setContactos(nuevos);
    setContactoActual({
      nombre_contacto: '',
      apellido: '',
      telefono: '',
      email: '',
      area_contacto: ''
    });
    setContactoEditando(null);
  };

  // Condiciones comerciales
 const handleAgregarCondicionComercial = () => {
  setCondicionesComerciales(prev => [...prev, condicionActual]);
  setCondicionActual({
    forma_pago: '',
    tipo_cambio: '',
    dias_pago: '',
    mark_up_maximo: ''
  });
}; 


const handleActualizarCondicionComercial = (index, campo, valor) => {
  const nuevas = [...condicionesComerciales];
  nuevas[index][campo] = valor;
  setCondicionesComerciales(nuevas);
};

const handleEliminarCondicionComercial = (index) => {
  const nuevas = condicionesComerciales.filter((_, i) => i !== index);
  setCondicionesComerciales(nuevas);
};

  // Guardar cliente
  const handleGuardar = async () => {
    const nuevoCliente = {
      razon_social: razonSocial,
      cuit,
      direcciones,
      contactos,
      condiciones_comerciales: condicionesComerciales
    };

    try {
      console.log('Enviando cliente:', nuevoCliente);
      await axios.post('http://localhost:4000/api/clientes/completo', nuevoCliente);
      setInfo('Cliente guardado correctamente');
      document.querySelector('.modal-body')?.scrollTo({ top: 0, behavior: 'smooth' });
      setError('');
    } catch (err) {
      console.error('Error al guardar cliente:', err.response?.data || err.message);
      setError('Error al guardar el cliente');
      setInfo('');
    }
  };

  // Cancelar
  const handleCancelar = () => {
    setRazonSocial('');
    setCuit('');
    setDireccionActual({
      calle: '',
      numeracion: '',
      localidad: '',
      provincia: '',
      codigo_postal: ''
    });
    setDirecciones([]);
    setContactoActual({
      nombre_contacto: '',
      apellido: '',
      telefono: '',
      email: '',
      area_contacto: ''
    });
    setContactos([]);
    setCondicionesComerciales([]);
    setError('');
    setInfo('');
    if (typeof onClose === 'function') {
      onClose();
    }
  };




  return (

    <div className="modal show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-xl" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-person-plus"></i> <stronge>Registrar Nuevo Cliente</stronge>
            </h5>
            <button type="button" className="btn-close" onClick={handleCancelar}></button>
          </div>

          {/* mensaje de exito */}
          <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
            {info && (
              <div className="alert alert-success alert-dismissible fade show" role="alert">
                <i className="bi bi-check-circle-fill me-2"></i>
                {info}
                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
              </div>
            )}

            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
              </div>
            )}

            {/* Datos generales */}
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label">Razón Social</label>
                <input type="text" className="form-control" value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">CUIT</label>
                <input type="text" className="form-control" value={cuit} onChange={(e) => setCuit(e.target.value)} />
              </div>


            </div>

            {/* Direcciones */}
            <h5 className="mb-3"><i className="bi bi-geo-alt"></i> <strong>Direcciones</strong>

            </h5>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label">Calle</label>
                <input type="text" className="form-control" value={direccionActual.calle} onChange={(e) => setDireccionActual({ ...direccionActual, calle: e.target.value })} />
              </div>

              <div className="col-md-2">
                <label className="form-label">Número</label>
                <input type="text" className="form-control" value={direccionActual.numeracion} onChange={(e) => setDireccionActual({ ...direccionActual, numeracion: e.target.value })} />
              </div>

              <div className="col-md-3">
                <label className="form-label">Localidad</label>
                <input type="text" className="form-control" value={direccionActual.localidad} onChange={(e) => setDireccionActual({ ...direccionActual, localidad: e.target.value })} />
              </div>

              <div className="col-md-2">
                <label className="form-label">Provincia</label>
                <input type="text" className="form-control" value={direccionActual.provincia} onChange={(e) => setDireccionActual({ ...direccionActual, provincia: e.target.value })} />
              </div>

              <div className="col-md-1">
                <label className="form-label">CP</label>
                <input type="text" className="form-control" value={direccionActual.codigo_postal} onChange={(e) => setDireccionActual({ ...direccionActual, codigo_postal: e.target.value })} />
              </div>

              <div className="col-md-3">
                <label className="form-label">Piso</label>
                <input
                  type="text"
                  className="form-control"
                  value={direccionActual.piso}
                  onChange={(e) => setDireccionActual({ ...direccionActual, piso: e.target.value })}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Depto</label>
                <input
                  type="text"
                  className="form-control"
                  value={direccionActual.depto}
                  onChange={(e) => setDireccionActual({ ...direccionActual, depto: e.target.value })}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Locación</label>
                <input
                  type="text"
                  className="form-control"
                  value={direccionActual.locacion}
                  onChange={(e) => setDireccionActual({ ...direccionActual, locacion: e.target.value })}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Zona de envío</label>
                <select
                  className="form-select"
                  value={direccionActual.zona_envio}
                  onChange={(e) => setDireccionActual({ ...direccionActual, zona_envio: e.target.value })}
                >
                  <option value="">Seleccionar zona</option>
                  <option value="CABA">CABA</option>
                  <option value="GBA">GBA</option>
                  <option value="INTERIOR">INTERIOR</option>
                </select>
              </div>







              <div className="col-12">
                {direccionEditando !== null ? (
                  <button className="btn btn-success" onClick={handleActualizarDireccion}>
                    <i className="bi bi-check-circle"></i> Actualizar Dirección
                  </button>
                ) : (
                  <button className="btn btn-outline-primary" onClick={handleAgregarDireccion}>
                    <i className="bi bi-plus-circle"></i> Agregar Dirección
                  </button>
                )}
              </div>



              {direcciones.length > 0 && (
                <div className="mt-3">
                  <h6>Direcciones agregadas:</h6>
                  <ul className="list-group">
                    {direcciones.map((dir, index) => (
                      <li key={index} className="list-group-item">
                        <div className="row align-items-center">
                          <div className="col-md-9">
                            {`${dir.calle} ${dir.numeracion}, ${dir.localidad}, ${dir.provincia} (${dir.codigo_postal})`}
                          </div>
                          <div className="col-md-3 text-end">
                            <button
                              className="btn btn-sm btn-outline-warning me-2"
                              onClick={() => {
                                setDireccionActual(dir);
                                setDireccionEditando(index);
                              }}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                const nuevas = [...direcciones];
                                nuevas.splice(index, 1);
                                setDirecciones(nuevas);
                              }}
                            >

                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Contactos */}
            {/* Contactos */}
            <h5 className="mb-3"><i className="bi bi-person-lines-fill"></i> <strong> Contactos</strong> </h5>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label"> Nombre </label>
                <input
                  type="text"
                  className="form-control"
                  value={contactoActual.nombre_contacto}
                  onChange={(e) => setContactoActual({ ...contactoActual, nombre_contacto: e.target.value })}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Apellido </label>
                <input type="text" className="form-control" value={contactoActual.apellido} onChange={(e) => setContactoActual({ ...contactoActual, apellido: e.target.value })}
                />
              </div>

              <div className="row">
                <div className="col-md-4">
                  <label className="form-label">Área de contacto</label>
                  <input
                    type="text"
                    className="form-control"
                    value={contactoActual.area_contacto}
                    onChange={(e) => setContactoActual({ ...contactoActual, area_contacto: e.target.value })}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="text"
                    className="form-control"
                    value={contactoActual.telefono}
                    onChange={(e) => setContactoActual({ ...contactoActual, telefono: e.target.value })}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={contactoActual.email}
                    onChange={(e) => setContactoActual({ ...contactoActual, email: e.target.value })}
                  />
                </div>
              </div>






              <div className="col-12">
                {contactoEditando === null ? (
                  <button className="btn btn-outline-primary" onClick={handleAgregarContacto}>
                    <i className="bi bi-plus-circle"></i> Agregar Contacto
                  </button>
                ) : (
                  <button className="btn btn-outline-success" onClick={handleActualizarContacto}>
                    <i className="bi bi-check-circle"></i> Actualizar Contacto
                  </button>
                )}
              </div>

            </div>


            {/* Lista de contactos agregados */}
            {contactos.length > 0 && (
              <div className="mt-3">
                <h6>Contactos agregados:</h6>
                <ul className="list-group">
                  {contactos.map((c, index) => (
                    <li key={index} className="list-group-item">
                      <div className="row align-items-center">
                        <div className="col-md-9">
                          {`${c.nombre_contacto} ${c.apellido}  - ${c.telefono} - ${c.email}`}
                        </div>
                        <div className="col-md-3 text-end">
                          <button
                            className="btn btn-sm btn-outline-warning me-2"
                            onClick={() => {
                              setContactoActual(c);
                              setContactoEditando(index);
                            }}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => {
                              const nuevos = [...contactos];
                              nuevos.splice(index, 1);
                              setContactos(nuevos);
                            }}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}


<h5 className="mb-3"><i className="bi bi-cash-coin"></i> <strong>Condiciones comerciales</strong></h5>

<div className="row g-3 mb-3">
  <div className="col-md-3">
    <label className="form-label">Forma de pago</label>
    <select
      className="form-select"
      value={condicionActual.forma_pago}
      onChange={(e) => setCondicionActual({ ...condicionActual, forma_pago: e.target.value })}
    >
      <option value="">Seleccionar</option>
      <option value="Transferencia">Transferencia</option>
      <option value="Tarjeta de crédito">Tarjeta de crédito</option>
      <option value="Cheque">Cheque</option>
      <option value="E-cheq">E-cheq</option>
    </select>
  </div>

  <div className="col-md-3">
    <label className="form-label">Tipo de cambio</label>
    <select
      className="form-select"
      value={condicionActual.tipo_cambio}
      onChange={(e) => setCondicionActual({ ...condicionActual, tipo_cambio: e.target.value })}
    >
      <option value="">Seleccionar</option>
      <option value="Billete">Billete</option>
      <option value="Divisa">Divisa</option>
    </select>
  </div>

  <div className="col-md-3">
    <label className="form-label">Día de pago</label>
    <select
      className="form-select"
      value={condicionActual.dias_pago}
      onChange={(e) => setCondicionActual({ ...condicionActual, dias_pago: e.target.value })}
    >
      <option value="">Seleccionar</option>
      {[1, 7, 15, 18, 20, 22, 25, 30, 40].map(dia => (
        <option key={dia} value={dia}>Día {dia}</option>
      ))}
    </select>
  </div>

  <div className="col-md-3">
    <label className="form-label">Mark-up máximo (%)</label>
    <input
      type="number"
      className="form-control"
      value={condicionActual.mark_up_maximo}
      onChange={(e) => setCondicionActual({ ...condicionActual, mark_up_maximo: e.target.value })}
      min="0"
      step="0.01"
      placeholder="Ej: 25.00"
    />
  </div>

  <div className="col-12">
    {condicionEditando === null ? (
      <button
        className="btn btn-outline-primary"
        onClick={handleAgregarCondicionComercial}
      >
        <i className="bi bi-plus-circle"></i> Agregar condición comercial
      </button>
    ) : (
      <button
        className="btn btn-outline-success"
        onClick={handleActualizarCondicionComercial}
      >
        <i className="bi bi-check-circle"></i> Actualizar condición comercial
      </button>
    )}
  </div>
</div>

{/* Lista de condiciones comerciales agregadas */}
{condicionesComerciales.length > 0 && (
  <div className="mt-3">
    <h6>Condiciones comerciales agregadas:</h6>
    <ul className="list-group">
      {condicionesComerciales.map((c, index) => (
        <li
          key={index}
          className={`list-group-item ${condicionEditando === index ? 'border-success bg-light' : ''}`}
        >
          <div className="row align-items-center">
            <div className="col-md-9">
              {`Forma de pago: ${c.forma_pago} - Tipo de cambio: ${c.tipo_cambio} - Día ${c.dias_pago} - Mark-up: ${c.mark_up_maximo}%`}
            </div>
            <div className="col-md-3 text-end">
              {condicionEditando !== index && (
                <button
                  className="btn btn-sm btn-outline-warning me-2"
                  onClick={() => {
                    setCondicionActual(c);
                    setCondicionEditando(index);
                  }}
                >
                  <i className="bi bi-pencil"></i>
                </button>
              )}
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => {
                  const nuevas = [...condicionesComerciales];
                  nuevas.splice(index, 1);
                  setCondicionesComerciales(nuevas);
                  if (condicionEditando === index) {
                    setCondicionEditando(null);
                    setCondicionActual({
                      forma_pago: '',
                      tipo_cambio: '',
                      dias_pago: '',
                      mark_up_maximo: ''
                    });
                  }
                }}
              >
                <i className="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  </div>
)}

          </div>



        
          {/* Footer */}
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={handleCancelar}>Cancelar</button>
            <button className="btn btn-success" onClick={handleGuardar}>Guardar Cliente</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;