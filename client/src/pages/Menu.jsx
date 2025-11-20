import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';
import '../CSS/menu.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import Sidebar from '../components/Sidebar';
import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import EtiquetaEstado from '../components/ui/EtiquetaEstado';



const Menu = () => {
  const { usuario, cargando } = useUser(); // ✅ incluye cargando
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [deletedCotizacion, setDeletedCotizacion] = useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState(null);
  const [alertasEnviadas, setAlertasEnviadas] = useState(new Set());

  useEffect(() => {
    if (cargando || !usuario?.id) return;

    const cargarCotizaciones = async () => {
      try {
        const res = await axios.get(`/api/cotizaciones/todas/${usuario.id}`);
        console.log('Cotizaciones recibidas:', res.data);

        // transformamos sin asumir que backend devuelve "estado" textual;
        // preferimos estado_nombre (nuevo backend) y guardamos vigencia_hasta cruda (ISO o null)
        const transformadas = (Array.isArray(res.data) ? res.data : []).map(c => ({
          id: c.id,
          numero: c.numero_cotizacion,
          fecha: c.fecha || c.created_at || c.fecha_creacion || null, // guardamos raw ISO (si existe)
          vigencia_hasta: c.vigencia_hasta ?? c.vencimiento ?? null, // posible campo nuevo
          vendedor: `${usuario.nombre} ${usuario.apellido}`,
          // preferir estado_nombre si el backend lo envía; si no, usar el texto antiguo 'estado'
          estado: {
            id: c.estado_id ?? null,
            nombre: c.estado_nombre ?? '—',
            es_final: c.estado_es_final ?? false,
            requiere_vencimiento: c.estado_requiere_vencimiento ?? false,
            color_dashboard: c.estado_color_dashboard ?? '#6c757d'
          },
          cliente: c.cliente_nombre || '—',
          contacto: c.contacto_nombre && c.contacto_apellido
            ? `${c.contacto_nombre} ${c.contacto_apellido}`
            : '—',
          total: c.total ?? 0
        }));
        setCotizaciones(transformadas);
      } catch (error) {
        console.error('Error al cargar cotizaciones:', error);
      }
    };

    cargarCotizaciones();
  }, [cargando, usuario]);



function confirmarEstado(id, nuevoEstado) {
  const texto = nuevoEstado === 'finalizada_aceptada'
    ? '¿Confirmás marcar esta cotización como ACEPTADA?'
    : nuevoEstado === 'finalizada_rechazada'
      ? '¿Confirmás marcar esta cotización como RECHAZADA?'
      : `¿Confirmás marcar como ${nuevoEstado}?`;

  const confirmar = window.confirm(texto);
  if (!confirmar) return;

  manejarCambioDeEstado(id, nuevoEstado);
}



//enviar alerta al cliente de cotizacion por vencer
async function enviarAlertaVencimiento(cotizacion) {
  try {
    await axios.post(
      `/api/cotizaciones/alerta-vencimiento/${cotizacion.id}`,
      {},
      { withCredentials: true }
    );

    setAlertasEnviadas(prev => new Set(prev).add(cotizacion.id));
    alert(`Alerta enviada al cliente: ${cotizacion.cliente}`);
  } catch (error) {
    console.error('Error al enviar alerta de vencimiento:', error);
    alert('No se pudo enviar la alerta.');
  }
}


  async function manejarCambioDeEstado(id, nuevoEstado) {
    try {
      const res = await axios.put(
        `/api/cotizaciones/estado/${id}`,
        { nuevoEstado },
        { withCredentials: true }
      );

      const estadoActualizado = res.data.estado;

      setCotizaciones(prev =>
        prev.map(c => c.id === id
          ? { ...c, estado: estadoActualizado }
          : c)
      );
    } catch (error) {
      console.error(`Error al marcar como ${nuevoEstado}:`, error);
    }
  }

  // filtrar defensivamente (proteger toLowerCase)
  const safeToLower = v => String(v ?? '').toLowerCase();
  const filteredCotizaciones = cotizaciones.filter(cotizacion => {
    const term = safeToLower(searchTerm);
    const estadoId = cotizacion.estado?.id;
    const estadoNombre = safeToLower(cotizacion.estado?.nombre ?? '');
    const vigencia = cotizacion.vigencia_hasta ? new Date(cotizacion.vigencia_hasta) : null;
    const hoy = new Date();
    const diasRestantes = vigencia ? (vigencia - hoy) / (1000 * 60 * 60 * 24) : null;

    const coincideTexto =
      safeToLower(cotizacion.numero).includes(term) ||
      safeToLower(String(cotizacion.id)).includes(term) ||
      safeToLower(cotizacion.vendedor).includes(term) ||
      safeToLower(cotizacion.cliente).includes(term);

    const coincideEstado = (() => {
      switch (term) {
        case 'borrador': return estadoId === 1;
        case 'pendiente': return estadoId === 2;
        case 'aceptada':
        case 'finalizada':
        case 'finalizada_aceptada': return estadoId === 3;
        case 'rechazada':
        case 'finalizada_rechazada': return estadoId === 4;
        case 'vencida': return estadoId === 5;
        case 'pendiente vencimiento':
        case 'pendiente por vencer':
        case 'pendiente a vencer':
        case 'pendiente venciendo':
          return estadoId === 2 && diasRestantes !== null && diasRestantes <= 3 && diasRestantes >= 0;
        default:
          return estadoNombre.includes(term);
      }
    })();

    return coincideTexto || coincideEstado;
  });




  if (cargando) return <p className="text-center mt-5">Cargando usuario...</p>; // ✅ loader

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
                      <label htmlFor="btn-menu"><i className="bi bi-person-circle custom-icon"></i></label>
                    </div>
                  </header>
                  <div className='option'>
                    <NavLink className='option-button2' to='/menu'>Cotizaciones</NavLink>
                    <NavLink className='option-button' to="/clientes">Clientes</NavLink>
                    <NavLink className='option-button' to='/productos'>Productos</NavLink>
                    <NavLink className='option-button' to='/configuracion'>Configuración</NavLink>
                  </div>
                </div>
                <div className='menu-superior-prod'>
                    <div className='cotizatitlecontainer'>
                      <h3 className='cotizatitle'>Cotizaciones</h3>
                    </div>
                    <div className="buscador-container">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar por ID, vendedor o cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}/>
                    </div>
                    <button
                      className='nc'
                      onClick={() => {
                      localStorage.removeItem('idCotizacionActual');
                      navigate('/nuevacotizacion');
                      }}>+ Nueva Cotización
                    </button>
                </div>
                
                

     {/* CODIGO ANTERIOR DEL MENU - SI FUNCIONA EL NUEVO, BORRAR ESTE BLOQUE 
      <div className="background-container-menu">
        
        <header className="header">
          <div className='container-header'>
            <div className="title-container">
              <h2 className="title-menu">GIGAFLOP</h2>
            </div>
          </div>
          <div className='container-icon'>
            <label htmlFor="btn-menu"><i className="bi bi-person-circle custom-icon"></i></label>
          </div>
        </header>

        <div className='option'>
          <NavLink className='option-button2'>Cotizaciones</NavLink>
          <NavLink className='option-button' to="/clientes">Clientes</NavLink>
          <NavLink className='option-button' to="/productos">Productos</NavLink>
          <NavLink className='option-button' to="/configuracion">Configuración</NavLink>
        </div>

        <div className="menubox">
          <div className='menu-superior'>
            <div className='cotizatitlecontainer'>
              <h3 className='cotizatitle'>Cotizaciones</h3>
            </div>
            <div className="buscador-container">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por ID, vendedor o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              className='nc'
              onClick={() => {
                localStorage.removeItem('idCotizacionActual');
                navigate('/nuevacotizacion');
              }}
            >
              + Nueva Cotización
            </button>
          </div>
*/}
          <div className="menu-matriz">
            <div className="table-responsive px-2">
              <table className="table tabla-cotizaciones align-middle">
                <thead className="table-primary">
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Fecha de vencimiento</th>
                    <th>Vendedor</th>
                    <th>Estado</th>
                    <th>Cliente</th>
                    <th>Contacto</th>
                    <th>Total</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCotizaciones.map((cotizacion, index) => {
                    const fechaIso = cotizacion.fecha ? new Date(cotizacion.fecha) : null;
                    const fechaDisplay = fechaIso && !isNaN(fechaIso.getTime())
                      ? fechaIso.toLocaleDateString('es-AR')
                      : (cotizacion.fecha ? String(cotizacion.fecha) : '—');

                    const fechaVencimiento = cotizacion.vigencia_hasta
                      ? new Date(cotizacion.vigencia_hasta)
                      : null;

                    const hoy = new Date();
                    const diferenciaDias = fechaVencimiento && !isNaN(fechaVencimiento.getTime())
                      ? Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24))
                      : null;

                    const vencida = diferenciaDias !== null && diferenciaDias < 0;
                    const vencePronto = diferenciaDias !== null && diferenciaDias >= 0 && diferenciaDias <= 3;

                    const estadoId = cotizacion.estado?.id;

                    return (
                      <tr key={index} className="fila-cotizacion">
                        <td>
                          <button className="btn-link" onClick={() => setModalVisible(true)}>
                            {cotizacion.numero}
                          </button>
                        </td>
                        <td>{fechaDisplay}</td>
                        <td className={
                          estadoId === 2
                            ? vencida
                              ? 'text-danger fw-bold'
                              : vencePronto
                                ? 'text-warning fw-bold'
                                : ''
                            : ''
                        }>
                          {cotizacion.estado?.requiere_vencimiento && fechaVencimiento && !isNaN(fechaVencimiento.getTime())
                            ? fechaVencimiento.toLocaleDateString('es-AR')
                            : '—'}
                        </td>
                        <td>{cotizacion.vendedor}</td>
                        <td><EtiquetaEstado estado={cotizacion.estado} /></td>
                        <td>{cotizacion.cliente}</td>
                        <td>{cotizacion.contacto}</td>
                        <td>${Number(cotizacion.total).toFixed(2)}</td>
<td className="text-end">
  <div className="dropdown">
    <button
      className="btn btn-sm btn-light"
      type="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
      title="Acciones"
    >
      <i className="bi bi-three-dots-vertical"></i>
    </button>

    <ul className="dropdown-menu dropdown-menu-end">
      <li>
        <button
          className="dropdown-item"
          onClick={() => {
            localStorage.setItem('idCotizacionActual', cotizacion.id);
            navigate('/nuevacotizacion', { state: { retomar: true } });
          }}
        >
          <i className="bi bi-arrow-repeat me-2 text-primary"></i> Retomar
        </button>
      </li>

{estadoId === 2 && vencePronto && (
  <li>
    {alertasEnviadas.has(cotizacion.id) ? (
      <span className="dropdown-item text-muted">
        <i className="bi bi-check2-circle me-2 text-success"></i> Alerta enviada
      </span>
    ) : (
      <button
        className="dropdown-item text-warning"
        onClick={() => enviarAlertaVencimiento(cotizacion)}
      >
        <i className="bi bi-envelope-exclamation me-2"></i> Alerta por vencimiento
      </button>
    )}
  </li>
)}

      {estadoId === 2 && (
        <>
          <li>
            <button
              className="dropdown-item text-success"
              onClick={() => confirmarEstado(cotizacion.id, 'finalizada_aceptada')}
            >
              <i className="bi bi-check-circle me-2"></i> Aceptar
            </button>
          </li>
          <li>
            <button
              className="dropdown-item text-danger"
              onClick={() => confirmarEstado(cotizacion.id, 'finalizada_rechazada')}
            >
              <i className="bi bi-x-circle me-2"></i> Rechazar
            </button>
          </li>
        </>
      )}
    </ul>
  </div>
</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {modalVisible && (
          <div className="modal-backdrop">
            <div className="modal-formulario">
              <div className="modal-header">
                <h5>Vista de Cotización</h5>
                <button className="btn-close" onClick={() => setModalVisible(false)}></button>
              </div>
              <div className="modal-body">
                <p className="text-muted">Aquí se mostrará la vista previa de la cotización seleccionada.</p>
                {/* Podés agregar más detalles o componentes aquí */}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setModalVisible(false)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      
    </>
  );
};

export default Menu;