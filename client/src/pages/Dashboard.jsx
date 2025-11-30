import React, { useEffect, useState } from 'react';
import { useUser } from "../context/UserContext";
import { NavLink } from 'react-router-dom';
import '../CSS/productos.css';
import '../CSS/dashboard.css';
import Sidebar from '../components/Sidebar';
import axios from "axios";

// utilidades
function usd(n) {
  return typeof n === 'number'
    ? n.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      })
    : '—';
}

// datos mock
function mock() {
  const arr = [];
  const f = ['2025-10-02','2025-10-05','2025-10-08','2025-10-10','2025-10-12'];
  const e = ['Aprobada','Pendiente','Rechazada','Vencida'];
  const p = [
    {p:'Impresora Epson TM-T20III',m:'EPSON'},
    {p:'Tóner PANTUM PD-219',m:'PANTUM'},
    {p:'Procesador Intel i5-12400',m:'INTEL'},
    {p:'SSD NV3 1TB',m:'Kingston'}
  ];
  const c = ['Acme SA','DataCorp','Blue IT','SysLab','Rayo SRL'];
  for(let i=0;i<24;i++){
    const pr=p[i%p.length];
    arr.push({
      id:202500+i,
      fecha:f[i%f.length],
      cliente:c[i%c.length],
      vendedor:['mgarcia','lrodriguez','pfernandez','jlopez'][i%4],
      producto:pr.p,
      marca:pr.m,
      items:1+(i%6),
      neto:+(1500+i*17.8).toFixed(2),
      iva:(i%3===0)?10.5:21,
      estado:e[i%4]
    });
  }
  return arr;
}

const Dashboard = () => {
  const { usuario } = useUser();



  // estado global
  const [all, setAll] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 10;

  // filtros
  const [estado, setEstado] = useState('');
  const [vendedor, setVendedor] = useState('');
  const [razon, setRazon] = useState('');
  const [producto, setProducto] = useState('');
  const [marca, setMarca] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [buscar, setBuscar] = useState('');



// cargar datos
useEffect(() => {
  const token = localStorage.getItem("token");

  axios.get("/api/cotizaciones/todas", {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => {
    setAll(res.data);
    setFiltered(res.data);
  })
  .catch(err => console.error("Error al obtener cotizaciones:", err));
}, []);



  // KPIs
  const kpiCot = all.length;
  const kpiAcept = all.filter(r=>r.estado==='Aprobada').length;
  const kpiRech = all.filter(r=>r.estado==='Rechazada').length;
  const kpiPend = all.filter(r=>r.estado==='Pendiente').length;
  const ticket = (all.reduce((x,y)=>x+y.neto,0)/kpiCot)||0;

  // aplicar filtros
  const apply = () => {
    const fe = estado.toLowerCase();
    const fv = vendedor.toLowerCase();
    const fr = razon.toLowerCase();
    const fp = producto.toLowerCase();
    const fm = marca.toLowerCase();
    const fd = desde.toLowerCase();
    const fh = hasta.toLowerCase();
    const fb = buscar.toLowerCase();

    const result = all.filter(r=>{
      if(fe && r.estado.toLowerCase()!==fe) return false;
      if(fv && !r.vendedor.toLowerCase().includes(fv)) return false;
      if(fr && !r.cliente.toLowerCase().includes(fr)) return false;
      if(fp && !r.producto.toLowerCase().includes(fp)) return false;
      if(fm && !r.marca.toLowerCase().includes(fm)) return false;
      if(fd && r.fecha<fd) return false;
      if(fh && r.fecha>fh) return false;
      if(fb && !(`${r.id} ${r.cliente} ${r.vendedor}`.toLowerCase().includes(fb))) return false;
      return true;
    });
    setFiltered(result);
    setPage(1);
  };

  const limpiar = () => {
    setEstado(''); setVendedor(''); setRazon('');
    setProducto(''); setMarca(''); setDesde(''); setHasta('');
    setBuscar('');
    setFiltered(all);
    setPage(1);
  };

  // paginación
  const pages = Math.max(1, Math.ceil(filtered.length/perPage));
  const slice = filtered.slice((page-1)*perPage, page*perPage);

  return (
    <>
      <div className="encabezado-fijo">
        <Sidebar />
        <div className="background-container-prod">
          <header className="header">
            <div className="title-container">
              <h2 className="title-menu">GIGAFLOP</h2>
            </div>
            <div className='container-icon'>
              <label htmlFor="btn-menu"><i className="bi bi-person-circle custom-icon"></i></label>
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
            <h3 className='cotizatitle'>Dashboard</h3>
          </div>
        </div>
      </div>

   

      <main className="wrap" style={{marginTop: '15%'}}>
        {/* KPIs */}
        <section className="kpi-grid">
          <article className="kpi-card kpi--blue">
            <div className="kpi-label">Cotizaciones</div>
            <div className="kpi-value">{kpiCot}</div>
            <div>Ticket prom.: <span>{usd(ticket)}</span></div>
          </article>
          <article className="kpi-card kpi--green">
            <div className="kpi-label">Aceptadas</div>
            <div className="kpi-value">{kpiAcept}</div>
            <div>Tasa: <span id="kpiTasa">—</span></div>
          </article>
          <article className="kpi-card kpi--red">
            <div className="kpi-label">Rechazadas</div>
            <div className="kpi-value">{kpiRech}</div>
            <div>Últimos 30 días</div>
          </article>
        <article className="kpi-card kpi--yellow">
            <div className="kpi-label">Pendientes</div>
            <div className="kpi-value">{kpiPend}</div>
            <div>Vencen pronto: <span>5</span></div>
          </article>
        </section>

        {/* filtros */}
        <section className="filters">
          <div className="filter-row">
            <label>Estado
              <select value={estado} onChange={e=>setEstado(e.target.value)}>
                <option value="">Todos</option>
                <option>Aprobada</option>
                <option>Pendiente</option>
                <option>Rechazada</option>
                <option>Vencida</option>
              </select>
            </label>
            <label>Vendedor <input value={vendedor} onChange={e=>setVendedor(e.target.value)} placeholder="Nombre o usuario" /></label>
            <label>Razón social <input value={razon} onChange={e=>setRazon(e.target.value)} placeholder="Ej: Acme SA" /></label>
            <label>Producto <input value={producto} onChange={e=>setProducto(e.target.value)} placeholder="Nombre o part number" /></label>
            <label>Marca <input value={marca} onChange={e=>setMarca(e.target.value)} placeholder="HP, Lenovo, Kingston..." /></label>
            <label>Desde <input type="date" value={desde} onChange={e=>setDesde(e.target.value)} /></label>
            <label>Hasta <input type="date" value={hasta} onChange={e=>setHasta(e.target.value)} /></label>
            <button className="btn-primary" onClick={apply}>Aplicar</button>
            <button className="btn-outline" onClick={limpiar}>Limpiar</button>
          </div>
          <div className="filter-row">
            <label className="search full">
              <input value={buscar} onChange={e=>setBuscar(e.target.value)} placeholder="Buscar por cliente, vendedor o N°" />
            </label>
          </div>
        </section>

        {/* tabla y paginación */}
        <section className="table-wrap">
          <div className="table-head">
            <h2>Resultados</h2>
            <div className="right"><span id="totalLabel">Total: {filtered.length}</span></div>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Vendedor</th>
                  <th>Items</th>
                  <th>Neto (USD)</th>
                  <th>IVA</th>
                  <th>Total (USD)</th>
                  <th>Estado</th>
                  <th>Producto / Marca</th>
                </tr>
              </thead>
              <tbody>
                {slice.map((r) => {
                  const tot = +(r.neto * (1 + r.iva/100)).toFixed(2);
                  const badge =
                    r.estado === 'Aprobada' ? 'badge ok' :
                    r.estado === 'Pendiente' ? 'badge warn' : 'badge danger';
                  return (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{r.fecha}</td>
                      <td>{r.cliente}</td>
                      <td>{r.vendedor}</td>
                      <td>{r.items}</td>
                      <td>{usd(r.neto)}</td>
                      <td>{r.iva}%</td>
                      <td>{usd(tot)}</td>
                      <td><span className={badge}>{r.estado}</span></td>
                      <td>{r.producto} / {r.marca}</td>
                    </tr>
                  );
                })}
                {slice.length === 0 && (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', opacity: 0.7 }}>
                      No hay resultados con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              className="btn-outline"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              « Anterior
            </button>
            <span id="pageInfo">{page} / {pages}</span>
            <button
              className="btn-outline"
              disabled={page >= pages}
              onClick={() => setPage(p => Math.min(pages, p + 1))}
            >
              Siguiente »
            </button>
          </div>
        </section>
      </main>
    </>
  );
};

export default Dashboard;
