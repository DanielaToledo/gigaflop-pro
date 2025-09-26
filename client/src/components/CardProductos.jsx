import React from 'react';
import '../CSS/productos.css';

const CardProductos = ({ item, onAddToCart }) => {
  const estilosCard = {
    width: '300px',
  };

  const estilosImg = {
    height: '220px',
    objectFit: 'cover',
  };
console.log('Producto recibido:', item);
  return (
    <div className='row mb-4 justify-content-center d-flex'>
      <div className='card' style={estilosCard}>
        <img
          className="card-img"
          style={estilosImg}
          src={item.thumbnail}
          alt={item.title}
        />
       <div className="card-body">
         <h5 className="card-title text-primary">{item.detalle}</h5>
         <hr />
        <p><span className='fw-bold'>Marca: </span>{item.marca}</p>
        <p><span className='fw-bold'>Categoría: </span>{item.categoria}</p>
        <p><span className='fw-bold'>Stock disponible: </span>{item.stock}</p>
        <p>
         <span className='fw-bold'>Precio: </span>
          {Number.isFinite(Number(item.precio))
            ? `$${Number(item.precio).toFixed(2)}`
            : <span className="text-danger">No disponible</span>}
        </p>
        <button className="btn btn-primary" onClick={() => onAddToCart(item)}>
          Agregar al carrito
        </button>
      </div>
    </div>
  </div>
  );
};

export default CardProductos;
