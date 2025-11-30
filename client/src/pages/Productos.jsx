// ...importaciones
import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';
import '../CSS/productos.css';
import Sidebar from '../components/Sidebar';
import CardProductos from '../components/CardProductos';


const Productos = () => {
  const { usuario } = useUser();
  const [products, setProducts] = useState([]);
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 12;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]); // Estado para el carrito que guarda los productos seleccionados
  const [showCart, setShowCart] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {  // Cargar el carrito desde localStorage al montar el componente
    try {
      const storedCart = localStorage.getItem('gigaflop_cart');
      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch (error) {
      console.error('Error al cargar el carrito desde localStorage:', error);
      localStorage.removeItem('gigaflop_cart');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gigaflop_cart', JSON.stringify(cart));
  }, [cart]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      let res;

      if (searchTerm.trim()) {
        console.log('🔍 Buscando productos con término:', searchTerm);
        res = await axios.get(`/api/productos/buscar/${searchTerm}`, { withCredentials: true });
      } else {
        console.log('📦 Cargando todos los productos');
        res = await axios.get('/api/productos', { withCredentials: true });
      }

      const data = res.data;

      console.log('📥 Respuesta del backend:', data);

      const productosNormalizados = (data.productos || []).map(p => ({
        ...p,
        imagen_url: p.image || p.imagen_url || 'default.jpg',
        _id: p._id || p.id // para asegurar clave única
      }));

      console.log('✅ Productos normalizados:', productosNormalizados);

      setProducts(productosNormalizados);
      setTotal(data.total || productosNormalizados.length);
    } catch (err) {
      setError('Error al cargar los productos.');
      console.error('❌ Error al obtener productos:', err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProducts();
  }, [skip, searchTerm]);

  const onSiguiente = () => {
    if (skip + limit < total) {
      setSkip(prev => prev + limit);
    }
  };

  const onAnterior = () => {
    setSkip(prev => Math.max(prev - limit, 0));
  };

  //metodo para agregar productos al carrito se ejecuta al hacer click en el boton agregar al carrito
  const handleAddToCart = (product) => {
    setCart(prevCart => {
      const exists = prevCart.find(item => item.id === product.id);
      if (exists) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const handleIncrement = (id) => {
    setCart(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecrement = (id) => {
    setCart(prev =>
      prev
        .map(item =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const handleFinalizarCotizacion = () => {
    navigate('/nuevacotizacion');
  };
  const handleRemove = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const [ocultarCart, setOcultarCart] = useState(false);
  const cerrarCartConTransicion = () => {
    setOcultarCart(true);
    setTimeout(() => {
      setShowCart(false);
      setOcultarCart(false);
    }, 300); // duración de la transición
  };

  return (
    <>
      <div className="encabezado-fijo">
        <Sidebar />

        <div className="background-container-prod">
          <header className="header">
            <div className='container-header'>
              <div className="title-container">
                <h2 className="title-menu">GIGAFLOP</h2>
              </div>
            </div>
            <div className='container-icon'>
              <div
                className="cotizacion-icon-container"
                title="Tu cotización"
                onClick={() => setShowCart(!showCart)}
              >
                <span className="cotizacion-icon">C</span>
                {cart.length > 0 && (
                  <span className="cart-badge">
                    {cart.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                )}
              </div>
            </div>
          </header>
      <div className="option">
  {/* Dashboard: admin y gerente */}
  {(usuario?.rol === "administrador" || usuario?.rol === "gerente") && (
    <NavLink className="option-button" to="/dashboard">Dashboard</NavLink>
  )}

  {/* Cotizaciones: todos */}
  <NavLink className="option-button" to="/menu">Cotizaciones</NavLink>

  {/* Clientes y Productos: solo vendedor y admin */}
  {(usuario?.rol === "administrador" || usuario?.rol === "vendedor") && (
    <>
      <NavLink className="option-button" to="/clientes">Clientes</NavLink>
      <NavLink className="option-button" to="/productos">Productos</NavLink>
    </>
  )}

  {/* Configuración: solo admin */}
  {usuario?.rol === "administrador" && (
    <NavLink className="option-button" to="/configuracion">Configuración</NavLink>
  )}
</div>
        </div>





        <div className='menu-superior-prod'>
          <div className='cotizatitlecontainer'>
            <h3 className='cotizatitle'>Productos</h3>
          </div>
          <div className="buscador-container">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar productos por nombre..."
              value={searchTerm}
              onChange={(e) => {
                setSkip(0);
                setSearchTerm(e.target.value);
              }}
            />
          </div>
          <div className='botonescontainer'>

            <button className='nc' style={{ background: 'white', border: 'white', boxShadow: 'none' }} >+ Nuevo Cliente</button>
          </div>
        </div>
      </div>



      <div
        className={`cart-modal-wrapper ${showCart ? 'fade-in' : ocultarCart ? 'fade-out' : 'd-none'
          }`}
      >
        <div className="cart-modal">
          <button className="btn-close float-end" onClick={cerrarCartConTransicion}></button>
          <h5 className="cart-title">🧾 Tu Cotización</h5>

          {cart.length === 0 ? (
            <p className="text-muted">No hay productos seleccionados.</p>
          ) : (
            <>
              <ul className="cart-list">
                {cart.map(item => (
                  <li key={item.id} className="cart-item">
                    <span className="fw-bold">{item.detalle}</span>
                    <div className="quantity-controls">
                      <button onClick={() => handleDecrement(item.id)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleIncrement(item.id)}>+</button>
                      <button className="remove-btn" onClick={() => handleRemove(item.id)}>✕</button>
                    </div>
                  </li>
                ))}
              </ul>

              <button
                className="btn btn-success finalizar-btn"
                onClick={() => navigate('/nuevacotizacion', { state: { carrito: cart } })}
                disabled={cart.length === 0}
              >
                <i className="bi bi-file-earmark-plus me-2"></i> Generar cotización
              </button>

              <button
                className="btn btn-outline-danger finalizar-btn mt-2"
                onClick={() => setCart([])}
              >
                <i className="bi bi-trash me-2"></i> Cancelar carrito
              </button>
            </>
          )}
        </div>
      </div>

      <div className="menuboxprod">
        <div className="productos-container">
          {loading ? (
            <p className="text-center">Cargando productos...</p>
          ) : error ? (
            <p className="text-center text-danger">{error}</p>
          ) : (
            <>
              <div className='productos-box'>
                {products.map((item) => (
                  <CardProductos key={item.id} item={item} onAddToCart={handleAddToCart} />
                ))}
              </div>

              <div>
                <ul className="pagination justify-content-center mt-4">
                  <button
                    className="btn btn-danger"
                    onClick={onAnterior}
                    disabled={skip === 0}
                  >
                    Anterior
                  </button>
                  <button
                    className="btn btn-success ms-2"
                    onClick={onSiguiente}
                    disabled={skip + limit >= total}
                  >
                    Siguiente
                  </button>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Productos;
