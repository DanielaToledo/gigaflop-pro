import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';
import '../CSS/menu.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import Sidebar from '../components/Sidebar';
import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

const Menu = () => {
  const { usuario, cargando } = useUser(); // ✅ incluye cargando
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [deletedCotizacion, setDeletedCotizacion] = useState(null);
  const [undoTimer, setUndoTimer] = useState(null);

  useEffect(() => {
    if (cargando || !usuario?.id) return;

    const cargarCotizaciones = async () => {
      try {
        const res = await axios.get(`/api/cotizaciones/borrador/${usuario.id}`);
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
          estado: c.estado_nombre ?? c.estado ?? (c.id_estado ?? null),
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

  // filtrar defensivamente (proteger toLowerCase)
  const safeToLower = v => String(v ?? '').toLowerCase();

  const filteredCotizaciones = cotizaciones.filter(cotizacion =>
    safeToLower(cotizacion.numero).includes(safeToLower(searchTerm)) ||
    safeToLower(String(cotizacion.id)).includes(safeToLower(searchTerm)) ||
    safeToLower(cotizacion.vendedor).includes(safeToLower(searchTerm)) ||
    safeToLower(cotizacion.cliente).includes(safeToLower(searchTerm))
  );

  // getColor ahora es null-safe
  const getColor = (estado) => {
    const key = safeToLower(estado);
    switch (key) {
      case 'aprobada': return '#198754';
      case 'pendiente': return '#ffc107';
      case 'rechazada': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const handleDelete = (id) => {
    const cotizacionEliminada = cotizaciones.find(c => c.id === id);
    if (window.confirm("¿Seguro que desea eliminar esta cotización?")) {
      setCotizaciones(cotizaciones.filter(c => c.id !== id));
      setDeletedCotizacion(cotizacionEliminada);

      const timer = setTimeout(() => {
        setDeletedCotizacion(null);
      }, 5000);

      setUndoTimer(timer);
    }
  };

  const handleUndo = () => {
    if (deletedCotizacion) {
      setCotizaciones(prev => [...prev, deletedCotizacion]);
      setDeletedCotizacion(null);
      clearTimeout(undoTimer);
    }
  };

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
                    // fecha: aceptar que venga ISO o ya formateada; defensivamente parsear
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

                    // estado para mostrar: puede ser nombre o id; mostrar texto si hay nombre, si no mostrar id o '—'
                    const estadoDisplay = (cotizacion.estado === null || cotizacion.estado === undefined)
                      ? '—'
                      : String(cotizacion.estado);

                    return (
                      <tr key={index} className="fila-cotizacion">
                        <td>
                          <button className="btn-link" onClick={() => setModalVisible(true)}>
                            {cotizacion.numero}
                          </button>
                        </td>
                        <td>{fechaDisplay}</td>
                        <td className={
                          estadoDisplay.toLowerCase() === 'pendiente'
                            ? vencida
                              ? 'text-danger fw-bold'
                              : vencePronto
                                ? 'text-warning fw-bold'
                                : ''
                            : ''
                        }>
                          {estadoDisplay.toLowerCase() === 'pendiente' && fechaVencimiento && !isNaN(fechaVencimiento.getTime())
                            ? fechaVencimiento.toLocaleDateString('es-AR')
                            : '—'}
                        </td>
                        <td>{cotizacion.vendedor}</td>
                        <td style={{ color: getColor(estadoDisplay), fontWeight: 500 }}>
                          {estadoDisplay}
                        </td>
                        <td>{cotizacion.cliente}</td>
                        <td>{cotizacion.contacto}</td>
                        <td>${Number(cotizacion.total).toFixed(2)}</td>
                        <td className="text-end">
                          <button
                            className="btn-cuadro btn-retomar"
                            title="Retomar cotización"
                            onClick={() => {
                              localStorage.setItem('idCotizacionActual', cotizacion.id);
                              navigate('/nuevacotizacion', { state: { retomar: true } });
                            }}
                          >
                            <i className="bi bi-arrow-repeat"></i>
                          </button>

                          <button className="btn-cuadro btn-descargar" title="Descargar PDF">
                            <i className="bi bi-file-earmark-arrow-down-fill"></i>
                          </button>

                          {deletedCotizacion?.id === cotizacion.id ? (
                            <button className="btn-cuadro btn-undo" title="Deshacer" onClick={handleUndo}>
                              <i className="bi bi-arrow-counterclockwise"></i>
                            </button>
                          ) : (
                            <button className="btn-cuadro btn-eliminar" title="Eliminar" onClick={() => handleDelete(cotizacion.id)}>
                              <i className="bi bi-trash3-fill"></i>
                            </button>
                          )}
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