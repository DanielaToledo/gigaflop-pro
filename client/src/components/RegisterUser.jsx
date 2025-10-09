import React from 'react'
import '../CSS/register.css';
import { useState } from 'react';


const Register = ({ onClose }) => {

  return (
    <div>
        <input type="checkbox" id="btn-register-cliente" />
        <div className="container-nuevo-cliente">
        <form className='form-container'>
            
            <label className='close-register-cliente' htmlFor="btn-register-cliente" onClick={onClose} >✖️</label>
            <div>
                <h1 className='register-title'>Nuevo Usuario</h1>
            </div>
            <div className="form">
                <label className="form-label" htmlFor="username">Usuario</label>
                <input className="form-input" type="text" id="username" name="username" required />
            </div>
            <div className="form">
                <label className="form-label" htmlFor="username">Contraseña</label>
                <input className="form-input"label type="text" id="username" name="username" required />
            </div>
            <div className="form">
                <label className="form-label" htmlFor="username">E-mail:</label>
                <input className="form-input" type="text" id="username" name="username" required />
            </div>
            <div className="form">
                <label className="form-label" htmlFor="email">Rol:</label>
                <input className="form-input" type="email" id="email" name="email" required />
            </div>
            
            <button className="form-button" type="submit">Registrar Usuario</button>
        </form>
        </div>
      
    </div>
  )
}

export default Register
