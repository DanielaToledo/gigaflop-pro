import React, { useState } from 'react';
import axios from 'axios';

const Register = ({ onClose }) => {
  const [razonSocial, setRazonSocial] = useState('');
  const [cuit, setCuit] = useState('');
  const [direcciones, setDirecciones] = useState([]);
  const [direccionEditando, setDireccionEditando] = useState(null);


  const [direccionActual, setDireccionActual] = useState({
    calle: '',
    numeracion: '',
    localidad: '',
    provincia: '',
    codigo_postal: ''
  }); 


  const [contactoEditando, setContactoEditando] = useState(null);
  const [contactos, setContactos] = useState([]);
  const [contactoActual, setContactoActual] = useState({
    nombre_contacto: '',
    apellido: '',
    telefono: '',
    email: ''
  });


  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleAgregarDireccion = () => {
  setDirecciones([...direcciones, direccionActual]);
  setDireccionActual({
    calle: '',
    numeracion: '',
    localidad: '',
    provincia: '',
    codigo_postal: ''
  });
};

  const handleAgregarContacto = () => {
  setContactos([...contactos, contactoActual]);
  setContactoActual({
    nombre_contacto: '',
    apellido: '',
    telefono: '',
    email: ''
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
    email: ''
  });
  setContactoEditando(null);
};



  const handleActualizarDireccion = () => {
    const nuevas = [...direcciones];
    nuevas[direccionEditando] = direccionActual;
    setDirecciones(nuevas);
    setDireccionActual({ calle: '', numero: '', localidad: '', provincia: '', cp: '' });
    setDireccionEditando(null);
  };

  const handleGuardar = async () => {
    const nuevoCliente = {
      razon_social: razonSocial,
      cuit,
      direcciones,
      contactos
    };

    try {
      console.log('Enviando cliente:', nuevoCliente); // ✅ Verifica el payload
      const response =await axios.post('http://localhost:4000/api/clientes/completo', nuevoCliente);
      setInfo('Cliente guardado correctamente');
      document.querySelector('.modal-body')?.scrollTo({ top: 0, behavior: 'smooth' });
      setError('');
      // Cierra el modal después de 2 segundos
    } catch (err) {
      console.error('Error al guardar cliente:', err.response?.data || err.message); // ✅ Verifica el error real
      setError('Error al guardar el cliente');
      setInfo('');
    }
  };



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
    email: ''
  });
  setContactos([]);
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
              <i className="bi bi-person-plus"></i> Registrar Nuevo Cliente
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
            <h5 className="mb-3"><i className="bi bi-geo-alt"></i> Direcciones</h5>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label">Calle</label>
                <input type="text" className="form-control" value={direccionActual.calle} onChange={(e) => setDireccionActual({ ...direccionActual, calle: e.target.value })} />
              </div>
              <div className="col-md-2">
                <label className="form-label">Número</label>
                <input type="text" className="form-control" value={direccionActual.numero} onChange={(e) => setDireccionActual({ ...direccionActual, numero: e.target.value })} />
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
                <input type="text" className="form-control" value={direccionActual.cp} onChange={(e) => setDireccionActual({ ...direccionActual, cp: e.target.value })} />
              </div>
              <div className="col-12">
                <button className="btn btn-outline-primary" onClick={handleAgregarDireccion}>
                  <i className="bi bi-plus-circle"></i> Agregar Dirección
                </button>
              </div>
              {direcciones.length > 0 && (
                <div className="mt-3">
                  <h6>Direcciones agregadas:</h6>
                  <ul className="list-group">
                    {direcciones.map((dir, index) => (
                      <li key={index} className="list-group-item">
                        <div className="row align-items-center">
                          <div className="col-md-9">
                            {`${dir.calle} ${dir.numero}, ${dir.localidad}, ${dir.provincia} (${dir.cp})`}
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
            <h5 className="mb-3"><i className="bi bi-person-lines-fill"></i> Contactos</h5>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  value={contactoActual.nombre}
                  onChange={(e) => setContactoActual({ ...contactoActual, nombre: e.target.value })}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Apellido</label>
                <input type="text" className="form-control" value={contactoActual.apellido} onChange={(e) => setContactoActual({ ...contactoActual, apellido: e.target.value })}
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
                          {`${c.nombre} ${c.apellido}  - ${c.telefono} - ${c.email}`}
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