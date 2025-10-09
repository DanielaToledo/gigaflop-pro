import React from 'react'

const PaginacionProductos = () => {
  return (
    <div>
        <ul className="pagination justify-content-center mt-4">
            <button className="btn btn-warning">Anterior</button>
            <button className="btn btn-primary ms-2">Siguiente</button>
        </ul>
    </div>
  )
}

export default PaginacionProductos
