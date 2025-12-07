import React from 'react'
import { FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa';
import '../CSS/home.css'; // Assuming you have a CSS file for global styles
import { NavLink } from 'react-router-dom';
import '../CSS/menu.css';




const Home = () => {

  return (
    <>
    <div className='home-container'>
    <header className="header-home">
        <h1 className="title-home">Gigaflop</h1>
        <nav className="nav">
            
          <NavLink href="#" className='login-home' to='/login'><i className="bi bi-person-circle"></i> LOGIN</NavLink>
     
        </nav>
      </header>

      <main className="main-content">
        <section className="hero">
          <h2>Soluciones en Hardware y Software para Empresas</h2>
          <p></p>
        </section>

        <section id="nosotros" className="about-section">
          <h2>Sobre Nosotros</h2>
          <p><strong>Gigaflop</strong> es una empresa especializada en la generación de cotizaciones comerciales. Gracias a la incorporación de nuestro sistema de automatización, hoy cuenta con una plataforma tecnológica avanzada que le permite gestionar sus procesos de cotización de forma más eficiente, rápida y precisa.
          <br />
          <br />
          A través de nuestro portal, los vendedores podrán acceder a herramientas claves como dashboards interactivos, gestión integral de cotizaciones, administración de clientes y visualización de productos con control de stock en tiempo real. 
          <br />
          <br />
          En Gigaflop, la tecnología no reemplaza al vendedor, <strong>lo potencia.</strong> </p>
          
        </section>
      </main>

      <footer className="footer-home" id="contacto">
        <div className="footer-content">
            <div className='footer-info'>
            <p className='contacto-home'><strong style={{color:' #4285f4'}}>Contacto:</strong> contacto@gigaflop.com.ar</p>
            <p className='contacto-home'><strong style={{color:' #4285f4'}}>Teléfono:</strong> +54 11 1234-5678</p>
            <p className='contacto-home'><strong style={{color:' #4285f4'}}>Ubicación:</strong> CABA, Argentina</p>
            </div>
            <div className="footer-socials">
                <div className="socials">
                    <a href="https://www.instagram.com/gigaflopba/" className='redes' target="_blank" rel="noreferrer">
              <FaInstagram /> Instagram
                    </a>
                <a href="https://www.facebook.com/p/Gigaflop-Tienda-100085264720623/" className='redes' target="_blank" rel="noreferrer">
              <FaFacebook /> Facebook
                </a>
                <a href="https://www.linkedin.com/in/gigaflop-ba-967b62228/" className='redes' target="_blank" rel="noreferrer">
                <FaLinkedin />LinkedIn
                </a>

            </div>
          </div>
        </div>
      </footer>
      </div>

      
    </>
  )
}

export default Home