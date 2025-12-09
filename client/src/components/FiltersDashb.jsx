import React from 'react';
import '../CSS/dashboard.css';

const FiltersDashb = ({
  estado, setEstado,
  vendedor, setVendedor,
  razon, setRazon,
  producto, setProducto,
  marca, setMarca,
  desde, setDesde,
  hasta, setHasta,
  buscar, setBuscar,
  apply, limpiar
}) => {
  return (
    <section className="filters">
      <div className="filter-row">
        <label>Estado
          <select value={estado} onChange={e => setEstado(e.target.value)}>
            <option value="">Todos</option>
            <option value="aceptada">Aceptada</option>
            <option value="pendiente">Pendiente</option>
            <option value="rechazada">Rechazada</option>
            <option value="vencida">Vencida</option>
          </select>
        </label>

        <label>Vendedor
          <input
            value={vendedor}
            onChange={e => setVendedor(e.target.value)}
            placeholder="Nombre o usuario"
          />
        </label>

        <label>Razón social
          <input
            value={razon}
            onChange={e => setRazon(e.target.value)}
            placeholder="Ej: Acme SA"
          />
        </label>

        <label>Producto
          <input
            value={producto}
            onChange={e => setProducto(e.target.value)}
            placeholder="Nombre o part number"
          />
        </label>

        <label>Marca
          <input
            value={marca}
            onChange={e => setMarca(e.target.value)}
            placeholder="HP, Lenovo, Kingston..."
          />
        </label>

        <label>Desde
          <input type="date" value={desde} onChange={e => setDesde(e.target.value)} />
        </label>

        <label>Hasta
          <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
        </label>

        <button className="btn-primary" onClick={apply}>Aplicar</button>
        <button className="btn-outline" onClick={limpiar}>Limpiar</button>
      </div>

      <div className="filter-row">
        <label className="search full mt-4">
          <input
            value={buscar}
            onChange={e => setBuscar(e.target.value)}
            placeholder="Buscar por cliente, vendedor o N°"
          />
        </label>
      </div>
    </section>
  );
};

export default FiltersDashb;