import React, { useState, useEffect } from 'react';

const BuscadorProductos = ({ productos, carrito, setCarrito, query, setQuery, abrirModal }) => {
  const [resultados, setResultados] = useState([]);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      setResultados([]);
      setMensaje('');
      return;
    }

    const q = query.toLowerCase();
    const encontrados = productos.filter(
      p =>
        p.nombre?.toLowerCase().includes(q) ||
        p.descripcion?.toLowerCase().includes(q) ||
        p.codigo?.toLowerCase().includes(q)
    );

    if (encontrados.length === 0) {
      setMensaje('No se encontraron productos con ese término.');
    } else {
      setMensaje('');
    }

    setResultados(encontrados);
  }, [query, productos]);

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
          placeholder="Buscar producto por nombre, descripción o código"
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

      {mensaje && <div className="text-muted mt-1">{mensaje}</div>}

      {resultados.length > 0 && (
        <ul className="list-group mt-2">
          {resultados.map(p => (
            <li
              key={p.id}
              className="list-group-item d-flex justify-content-between align-items-center"
              style={{ cursor: 'pointer' }}
              onClick={() => agregarProducto(p)}
            >
              <div>
                <strong>{p.codigo || p.nombre}</strong> · {p.descripcion}
                <div className="small text-muted">
                  US$ {p.precio?.toFixed(2)} · Stock {p.stock}
                </div>
              </div>
              <button className="btn btn-sm btn-outline-primary">Agregar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BuscadorProductos;
