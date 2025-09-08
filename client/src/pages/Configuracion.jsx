import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../CSS/configuracion.css';
import Sidebar from '../components/Sidebar';
import RegisterUser from '../components/RegisterUser';

const Configuracion = () => {

    const [searchTerm, setSearchTerm] = useState({
        id: '',
        usuario: '',
        rol: '',
        contacto: '',
        
      });

    // Estado para controlar la visibilidad del formulario de registro, falta email y estado
        const [showRegisterForm, setShowRegisterForm] = useState(false);
const usuario = [
  { id: '1001', usuario: 'Daniela Toledo', rol: 'administrador', contacto: '+5491123456789' },
  { id: '1002', usuario: 'Maite Dominguez', rol: 'vendedor', contacto: '+5491134567890' },
  { id: '1003', usuario: 'Cristian Landeira', rol: 'vendedor', contacto: '+5491145678901' },
  { id: '1004', usuario: 'Vanina Crisostomo', rol: 'gerente', contacto: '+5491156789012' },
  { id: '1005', usuario: 'Franco Desunvila', rol: 'administrador', contacto: '+5491167890123' }
];
    const filteredUsuario = usuario.filter(usuario => {
    const search = searchTerm.id.toLowerCase(); // Convertir a minúsculas para una comparación segura

    return (
        usuario.id.toLowerCase().includes(search) ||
        usuario.usuario.toLowerCase().includes(search) ||
        usuario.rol.toLowerCase().includes(search) ||
        usuario.contacto.toLowerCase().includes(search) 
        
    );
});


  return (
     <>
      <Sidebar />
            <div className="background-container-config">
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
              <div className='optionconfig'>
                <NavLink className='option-button'to='/menu'>Cotizaciones</NavLink>
                <NavLink className='option-button' to= "/clientes">Clientes</NavLink>
                <NavLink className='option-button' to= '/productos' >Productos</NavLink>
                <NavLink className='option-button2'to= '/configuracion'>Configuración</NavLink>
              </div>
            </div>

             {/* MODAL DE REGISTRO - Se renderiza condicionalmente */}
                {showRegisterForm && (
                    <div className="register-modal-overlay" onClick={() => setShowRegisterForm(false)}>
                        <div className="register-modal-content" onClick={(e) => e.stopPropagation()}>
                            {/* Pasamos la función para cerrar al componente Register */}
                            <RegisterUser onClose={() => setShowRegisterForm(false)} />
                        </div>
                    </div>
                )}
        <div className="menuboxconfig">
          <div className='menu-superior'>
            <div className='cotizatitlecontainer'>
              <h3 className='cotizatitle'>Configuración</h3>
            </div>
            <div>
            
              <button className='nc-config' onClick={() => setShowRegisterForm(true)}>+ Nuevo Usuario</button>
            </div>
          </div>

        <div className='infofc'>
            <div className='infofccontainer'>
                <div className='infoblock'>
                    <h6 className='infofctitle'>Nombre o Razon Social</h6>
                    <input className='infofcdata' type="text" placeholder="Gigaflop S.R.L."/>
                    <h6 className='infofctitle'>CUIT</h6>
                    <input className='infofcdata' type="text" placeholder="30-74802172-9"/>
                    <h6 className='infofctitle'>Situación Fiscal</h6>
                    <input className='infofcdata' type="text" placeholder="Responsable Inscripto"/>
                </div>
                <div className='infoblock'>
                    <h6 className='infofctitle'>Dirección</h6>
                    <input className='infofcdata' type="text" placeholder="Tucuman 784, CABA"/>
                    <h6 className='infofctitle'>Contacto</h6>
                    <input className='infofcdata' type="text" placeholder="+5411-4757-3878"/>
                    <h6 className='infofctitle'>Email</h6>
                    <input className='infofcdata' type="text" placeholder="administracion@giga.com.ar"/>
                </div>
                
            </div>
            
        </div>

          <div className="menu-matriz">
            
            <div className="filtros">
              <input className="buscador" placeholder="Busque por usuario registrado" value={searchTerm.id} onChange={(e) => setSearchTerm({...searchTerm, id: e.target.value})} />
              
            </div>
            <div className='matrizconfig'>
              <table className='table'>
                <thead className='table-thead'>
                  <tr className='table-tr'>
                    <th className='table-header'>ID</th>
                    <th className='table-header'>Nombre</th>
                    <th className='table-header'>Rol</th>
                    <th className='table-header'>Contacto</th>
                                 
                  </tr>
                </thead>
                <tbody className='table'>
                  {filteredUsuario.map((usuario, index) => (
                    <tr key={index} className='table-trdatos'>
                      <td className='table-datos'>{usuario.id}</td>
                      <td className='table-datos'>{usuario.usuario}</td>
                      <td className='table-datos'>{usuario.rol}</td>
                      <td className="table-datos">{usuario.contacto}</td>
                       
                      <td className='table-datostotal'>
                        <div className='crud-icons'>   
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
                
       
    </>
  )
}

export default Configuracion
