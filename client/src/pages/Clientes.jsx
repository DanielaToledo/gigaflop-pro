import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Register from '../components/Register';
import MensajeAlerta from '../components/MensajeAlerta';
import '../CSS/menu.css';

const Clientes = () => {
  const [clientes, setClientes] = useState([]); //almacena la lista de clientes obtenida del servidor.
  const [busqueda, setBusqueda] = useState(''); //maneja el término de búsqueda introducido por el usuario.
  const [mensajeError, setMensajeError] = useState(''); //guarda mensajes de error en caso de fallas en las solicitudes.
  const [showRegisterForm, setShowRegisterForm] = useState(false); //controla la visibilidad del formulario de registro.
  const [clienteAEliminar, setClienteAEliminar] = useState(null); //almacena el cliente que el usuario seleccionó para eliminar.
  const [clienteAEditar, setClienteAEditar] = useState(null); //almacena el cliente que el usuario seleccionó para editar.

  const obtenerClientes = () => { //recupera la lista de clientes desde el servidor.
    axios.get('http://localhost:4000/api/clientes')
      .then((res) => {
        setClientes(res.data); // actualiza el estado con la lista de clientes obtenida.
        setMensajeError('');
      })
      .catch(() => {
        setClientes([]); // limpia la lista de clientes en caso de error.
        setMensajeError('Error al recuperar la lista de clientes');
      });
  };

  useEffect(() => { //uando el componente se monta por primera vez, se llama a la función obtenerClientes para cargar la lista de clientes.
    obtenerClientes();
  }, []);

  // Restauramos la búsqueda con debounce
  useEffect(() => { // cada vez que el usuario escribe en el campo de búsqueda, se ejecuta este efecto.
    if (busqueda.trim().length < 1) { 
      obtenerClientes();
      return;
    }

    const delay = setTimeout(() => { // implementamos un retraso para evitar solicitudes excesivas al servidor.
      axios.get('http://localhost:4000/api/clientes/buscar', { params: { razon_social: busqueda } })
        .then((res) => {
          setClientes(Array.isArray(res.data) ? res.data : []);
          setMensajeError('');
        })
        .catch(() => {
          setClientes([]);
          setMensajeError('Cliente no encontrado');
        });
    }, 400);

    return () => clearTimeout(delay);
  }, [busqueda]);

  const handleEliminar = (cliente) => { //recibe un cliente y establece el estado clienteAEliminar con el cliente seleccionado.
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

  const handleEditar = (cliente) => {
    setClienteAEditar(cliente);
  };

  const confirmarEdicion = async (e, nuevaRazonSocial, nuevoCuit) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:4000/api/clientes/${clienteAEditar.cuit}`, {// esta haciendo una solicitud PUT al servidor para actualizar el cliente.
        razon_social: nuevaRazonSocial,
        cuit: nuevoCuit,
      });
      obtenerClientes();
      setClienteAEditar(null);
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
            <label htmlFor="btn-menu">
              <i className="bi bi-person-circle custom-icon"></i>
            </label>
          </div>
        </header>

        <div className="option">
          <NavLink className="option-button" to="/menu">Cotizaciones</NavLink>
          <NavLink className="option-button2">Clientes</NavLink>
          <NavLink className="option-button">Catálogo</NavLink>
          <NavLink className="option-button">Configuración</NavLink>
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
            <div>
              <button className="reporte">Reporte</button>
              <button className="nc" onClick={() => setShowRegisterForm(true)}>+ Nuevo Cliente</button>
            </div>
          </div>

          <div className="menu-matriz">
            {/* Buscador restaurado */}
            <div className="filtros">
              <input
                className="buscador"
                placeholder="Buscar por Razón Social"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <button className='botonlimpiar' onClick={() => { setBusqueda(''); setMensajeError(''); }}>Limpiar</button>
              {mensajeError && <p className="mensaje-error">{mensajeError}</p>}
            </div>

            <div className="matriz">
              <table className="table">
                <thead className="table-thead">
                  <tr className="table-tr">
                    <th className="table-header">ID</th>
                    <th className="table-header">Razón Social</th>
                    <th className="table-header">CUIT</th>
                    <th className="table-header">Acciones</th>
                  </tr>
                </thead>
                <tbody className="table">
                  {clientes.map((cliente, index) => (
                    <tr key={index} className="table-trdatos">
                      <td className="table-datos">{cliente.id}</td>
                      <td className="table-datos">{cliente.razon_social}</td>
                      <td className="table-datos">{cliente.cuit}</td>
                      <td className="table-datostotal">
                        <div className="crud-icons">
                          <i className="bi bi-pencil-fill" onClick={() => handleEditar(cliente)}></i>
                          <i className="bi bi-trash3-fill" onClick={() => handleEliminar(cliente)}></i>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {clienteAEliminar && (
          <MensajeAlerta
            tipo="eliminar"
            mensaje={`¿Seguro que querés eliminar a ${clienteAEliminar.razon_social}?`}
            onConfirmar={confirmarEliminacion}
            onCancelar={cancelarEliminacion}
          />
        )}

        {clienteAEditar && (
          <MensajeAlerta
            tipo="editar"
            mensaje={`Editando cliente: ${clienteAEditar.razon_social}`}
            cliente={clienteAEditar}
            onConfirmar={confirmarEdicion}
            onCancelar={() => setClienteAEditar(null)}
          />
        )}
      </div>
    </>
  );
};

export default Clientes;