import React from 'react';
import '../CSS/productos.css';

const CardProductos = ({ item }) => {
  const estilosCard = {
    width: '300px',
    
  };

  const estilosImg = {
    height: '220px',
    objectFit: 'cover',
  };

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
          <h5 className="card-title text-primary">{item.title}</h5>
          <hr />
          <p>
            <span className='fw-bold'>Marca: </span>{item.brand}
          </p>
          <p>
            <span className='fw-bold'>Categoría: </span>{item.category}
          </p>
          <p>
            <span className='fw-bold'>Precio: </span>${item.price}
          </p>
          <button className="btn btn-primary">Agregar al carrito</button>
        </div>
      </div>
    </div>
  );
};

export default CardProductos;