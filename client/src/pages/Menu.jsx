import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../CSS/menu.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import Sidebar from '../components/Sidebar';
import { useUser } from '../context/UserContext';



const Menu = () => {
  const { usuario, cargando } = useUser();
  if (cargando) return null; // o un spinner tipo <div>Loading...</div>

  const [searchTerm, setSearchTerm] = useState({
    id: '',
    fecha: '',
    vendedor: '',
    estado: '',
    cliente: ''
  });

  const cotizaciones = [
    { id: '482193', fecha: '01/01/2023', vendedor: 'Juan Perez', estado: 'Aprobada', cliente: 'YPF', total: 'u$s1,250' },
    { id: '729384', fecha: '02/01/2023', vendedor: 'Ana Gómez', estado: 'Pendiente', cliente: 'Mercado Libre', total: 'u$s2,340' },
    { id: '193847', fecha: '03/01/2023', vendedor: 'Luis Torres', estado: 'Rechazada', cliente: 'Globant', total: 'u$s980' },
    { id: '564738', fecha: '07/01/2023', vendedor: 'Juan Perez', estado: 'Aprobada', cliente: 'YPF', total: 'u$s2,120' },
    { id: '837261', fecha: '10/01/2023', vendedor: 'María López', estado: 'Aprobada', cliente: 'Arcor', total: 'u$s3,150' },
    { id: '284756', fecha: '12/01/2023', vendedor: 'Carlos Ruiz', estado: 'Pendiente', cliente: 'Techint', total: 'u$s2,700' },
    { id: '918273', fecha: '15/01/2023', vendedor: 'Sofía Díaz', estado: 'Aprobada', cliente: 'Tenaris', total: 'u$s1,890' },
    { id: '374829', fecha: '18/01/2023', vendedor: 'Pedro Sánchez', estado: 'Rechazada', cliente: 'Telecom Argentina', total: 'u$s1,430' },
    { id: '657483', fecha: '20/01/2023', vendedor: 'Valeria Castro', estado: 'Aprobada', cliente: 'Coca-Cola', total: 'u$s2,560' },
    { id: '102938', fecha: '22/01/2023', vendedor: 'Martín Gómez', estado: 'Pendiente', cliente: 'Banco Galicia', total: 'u$s1,780' },
    { id: '564738', fecha: '25/01/2023', vendedor: 'Lucía Fernández', estado: 'Rechazada', cliente: 'Santander Río', total: 'u$s3,320' },
    { id: '837465', fecha: '28/01/2023', vendedor: 'Diego Morales', estado: 'Aprobada', cliente: 'Unilever', total: 'u$s2,050' },
    { id: '293847', fecha: '30/01/2023', vendedor: 'Isabel Torres', estado: 'Pendiente', cliente: 'Toyota', total: 'u$s1,600' },
    { id: '475869', fecha: '02/02/2023', vendedor: 'Andrés Ramírez', estado: 'Aprobada', cliente: 'PepsiCo', total: 'u$s2,900' },
    { id: '918273', fecha: '05/02/2023', vendedor: 'Claudia Herrera', estado: 'Rechazada', cliente: 'BBVA', total: 'u$s1,200' },
    { id: '384756', fecha: '08/02/2023', vendedor: 'Fernando Castro', estado: 'Aprobada', cliente: 'YPF', total: 'u$s2,400' },
    { id: '675849', fecha: '10/02/2023', vendedor: 'Gabriela López', estado: 'Pendiente', cliente: 'Mercado Libre', total: 'u$s1,950' },
    { id: '120394', fecha: '12/02/2023', vendedor: 'Emilia Rojas', estado: 'Aprobada', cliente: 'Globant', total: 'u$s2,670' },
    { id: '847362', fecha: '15/02/2023', vendedor: 'Tomás Medina', estado: 'Pendiente', cliente: 'Arcor', total: 'u$s1,540' },
    { id: '293746', fecha: '18/02/2023', vendedor: 'Julieta Paz', estado: 'Rechazada', cliente: 'Techint', total: 'u$s3,010' },
    { id: '564738', fecha: '20/02/2023', vendedor: 'Ramiro Díaz', estado: 'Aprobada', cliente: 'Tenaris', total: 'u$s2,330' }
  ];

  const filteredCotizaciones = cotizaciones.filter(cotizacion =>
    cotizacion.id.includes(searchTerm.id) &&
    cotizacion.fecha.includes(searchTerm.fecha) &&
    cotizacion.vendedor.toLowerCase().startsWith(searchTerm.vendedor.toLowerCase()) &&
    cotizacion.estado.toLowerCase().startsWith(searchTerm.estado.toLowerCase()) &&
    cotizacion.cliente.toLowerCase().startsWith(searchTerm.cliente.toLowerCase())
  );

 const getColor = (estado) => {
  switch (estado.toLowerCase()) {
    case 'aprobada':
      return '#00FF00'; // Verde fuerte
    case 'pendiente':
      return '#FFD700'; // Amarillo fuerte
    case 'rechazada':
      return '#FF0000'; // Rojo fuerte
    default:
      return 'black';
  }
};

  return (
    <>
      <Sidebar />
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
        <NavLink className='option-button2' to="/menu">Cotizaciones</NavLink>
        <NavLink className='option-button' to="/clientes">Clientes</NavLink>
        <NavLink className='option-button' to="/productos">Productos</NavLink>
        <NavLink className='option-button' to="/configuracion">Configuración</NavLink>
      </div>
        <div className="menubox">
          <div className='menu-superior'>
            <div className='cotizatitlecontainer'>
              <h3 className='cotizatitle'>Cotizaciones</h3>
            </div>
            <div>
              <button className='reporte'>Reporte</button>
              <button className='nc'>+ Nueva Cotización</button>
            </div>
          </div>
          <div className="menu-matriz">
            
            <div className="filtros">
              <input className="filtros-box" placeholder="ID" value={searchTerm.id} onChange={(e) => setSearchTerm({...searchTerm, id: e.target.value})} />
              <input className="filtros-box" placeholder="Fecha" value={searchTerm.fecha} onChange={(e) => setSearchTerm({...searchTerm, fecha: e.target.value})} />
              <input className="filtros-box" placeholder="Vendedor" value={searchTerm.vendedor} onChange={(e) => setSearchTerm({...searchTerm, vendedor: e.target.value})} />
              <input className="filtros-box" placeholder="Estado" value={searchTerm.estado} onChange={(e) => setSearchTerm({...searchTerm, estado: e.target.value})} />
              <input className="filtros-box" placeholder="Cliente" value={searchTerm.cliente} onChange={(e) => setSearchTerm({...searchTerm, cliente: e.target.value})} />
            </div>
            <div className='matriz'>
              <table className='table'>
                <thead className='table-thead'>
                  <tr className='table-tr'>
                    <th className='table-header'>ID</th>
                    <th className='table-header'>Fecha</th>
                    <th className='table-header'>Vendedor</th>
                    <th className='table-header'>Estado</th>
                    <th className='table-header'>Cliente</th>
                    <th className='table-header-total'>Total</th>
                  </tr>
                </thead>
                <tbody className='table'>
                  {filteredCotizaciones.map((cotizacion, index) => (
                    <tr key={index} className='table-trdatos'>
                      <td className='table-datos'>{cotizacion.id}</td>
                      <td className='table-datos'>{cotizacion.fecha}</td>
                      <td className='table-datos'>{cotizacion.vendedor}</td>
                      <td className="table-datos" 
                      style={{ color: getColor(cotizacion.estado),  }}>
                      {cotizacion.estado}</td>

                      <td className='table-datos'>{cotizacion.cliente}</td>
                      <td className='table-datostotal'>{cotizacion.total}
                        <div className='crud-icons'>   
                        <i className="bi bi-eye-fill"></i>  
                        <i className="bi bi-pencil-fill"></i>
                        <i className="bi bi-file-earmark-arrow-down-fill"></i>
                        <i className="bi bi-trash3-fill"></i>                  
                        </div> 
                      </td>
                      
                        
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Menu;

