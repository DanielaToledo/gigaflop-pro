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
          <p>Transformamos cada cotización en una oportunidad de crecer con nuestros clientes</p>
        </section>

        <section id="nosotros" className="about-section">
          <h2>Sobre Nosotros</h2>
          <p><strong>Misión: </strong>
          Brindar a empresas soluciones confiables en hardware y software, con atención personalizada, cotizaciones ágiles y asesoramiento experto con disponibilidad de stock y precios competitivos.
          <br />
          <br />
          <strong>Visión:</strong> Ser el proveedor de tecnología preferido por las empresas, acompañando cada necesidad con una oferta actualizada, atención profesional y compromiso con el servicio.
          </p>
          
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