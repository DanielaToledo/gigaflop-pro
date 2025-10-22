
import React, { useState, useEffect } from 'react';
import axios from 'axios';
//buscador de productos por nombre, marca, categoria, etc.
const BuscadorProductos = ({ carrito, setCarrito, query, setQuery, abrirModal }) => {
  const [resultados, setResultados] = useState([]);
  const [mensaje, setMensaje] = useState('');

useEffect(() => {
  const buscar = async () => {
    if (!query.trim()) {
      setResultados([]);
      setMensaje('');
      return;
    }

    try {
      const res = await axios.get(`/api/productos/buscar/${query}`, { withCredentials: true });
      const data = res.data;

      if (data.productos.length === 0) {
        setMensaje('No se encontraron productos con ese término.');
        setResultados([]);
      } else {
        setMensaje('');
        setResultados(data.productos);
      }
    } catch (error) {
      console.error('Error al buscar productos:', error);
      setMensaje('Error al buscar productos.');
      setResultados([]);
    }
  };

  buscar();
}, [query]);

  const agregarProducto = (prod) => {
    const existe = carrito.find(p => p.id === prod.id);
    if (existe) {
      const nuevo = carrito.map(p =>
        p.id === prod.id
          ? { ...p, cantidad: Math.min(p.cantidad + 1, p.stock) }
          : p
      );
      setCarrito(nuevo);
    } else {
      setCarrito([...carrito, {
        ...prod,
        cantidad: 1,
        markup: 0,
        descuento: 0
      }]);
    }
    setQuery('');
    setResultados([]);
  };

  return (
    <div className="mb-3">
      <div className="d-flex align-items-center gap-2 mb-2">
        <input
          className="form-control"
          style={{ maxWidth: '400px' }}
          placeholder="Buscar producto por nombre, marca, categoría, etc."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-primary" onClick={abrirModal}>
          <i className="bi bi-box"></i> Productos
        </button>
        <button className="btn btn-outline-secondary" onClick={() => setQuery('')}>
          <i className="bi bi-x-circle"></i> Limpiar
        </button>
      </div>

      {resultados.length > 0 && (
    <div className="text-success small">
      Se encontraron {resultados.length} producto{resultados.length > 1 ? 's' : ''}.
    </div>
  )}


      {mensaje && <div className="text-muted mt-1">{mensaje}</div>}

      {resultados.length > 0 && (
  <ul className="list-group mt-2">
    {resultados.map(p => (
      <li
        key={p.id}
        className="list-group-item d-flex justify-content-between align-items-center"
        style={{ cursor: 'default' }} // ya no hace falta que el <li> sea clickeable
      >
        <div>
          <strong>{p.codigo || p.nombre || p.part_number}</strong> · {p.detalle}
          <div className="small text-muted">
            US$ {p.precio?.toFixed(2)} · Stock {p.stock}
          </div>
        </div>
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => agregarProducto(p)} // ✅ ahora el botón agrega el producto
        >
          Agregar
        </button>
      </li>
    ))}
  </ul>
)}



    </div>
  );
};

export default BuscadorProductos;