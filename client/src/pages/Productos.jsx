import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../CSS/productos.css';
import Sidebar from '../components/Sidebar';
import CardProductos from '../components/CardProductos';

const Productos = () => {
  const [products, setProducts] = useState([]);
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 12;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');


const fetchProducts = async () => {
  setLoading(true);
  setError(null);
  try {
    const baseUrl = searchTerm
      ? `https://dummyjson.com/products/search?q=${searchTerm}`
      : `https://dummyjson.com/products?limit=${limit}&skip=${skip}`;

    const res = await fetch(baseUrl);
    const data = await res.json();
    setProducts(data.products || []);
    setTotal(data.total || 0);
  } catch (err) {
    setError('Error al cargar los productos.');
    console.error('Error fetching products:', err);
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



  return (
    <>
      <Sidebar />
      <div className="encabezado-fijo">
      <div className="background-container-prod">

        <header className="headerprod">
          <div className='container-header'>
            <div className="title-container">
              <h2 className="title-menu">GIGAFLOP</h2>
            </div>
          </div>
          <div className='container-icon'>
            <label htmlFor="btn-menu"><i className="bi bi-person-circle custom-icon"></i></label>
          </div>
        </header>
        <div className='optionprod'>
          <NavLink className='option-button' to='/menu'>Cotizaciones</NavLink>
          <NavLink className='option-button' to="/clientes">Clientes</NavLink>
          <NavLink className='option-button2' to='/productos'>Productos</NavLink>
          <NavLink className='option-button' to='/configuracion'>Configuración</NavLink>
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
      setSkip(0); // reinicia paginación al buscar
      setSearchTerm(e.target.value);
    }}
  />
</div>
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
                  <CardProductos key={item.id} item={item} />
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