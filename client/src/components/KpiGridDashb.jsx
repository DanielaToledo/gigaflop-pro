//este componente muestra un grid con los KPIs del dashboard
//recibe los KPIs como props desde el componente padre Dashboard.jsx
//y los muestra en tarjetas con tasas y valores formateados en USD.
//Resultado
//Card azul (Cotizaciones): muestra el total y el ticket promedio general en USD.
//Card verde (Aceptadas): muestra el total y la tasa de aceptación %.
//Card roja (Rechazadas): muestra el total y la tasa de rechazo %.
//Card amarilla (Pendientes): muestra el total y la tasa de pendientes %.
//Card gris (Vencidas): muestra el total y la tasa de vencidas %.
//Así todas tus cards quedan consistentes: cantidad + tasa %, y la azul además con el ticket promedio.
//todas se calculan a partir de los datos obtenidos en Dashboard.jsx es decir suma de todas las cotizaciones y se divide por el total segun su estado.


import React from 'react';
import '../CSS/dashboard.css';

function usd(n) {
  return typeof n === 'number'
    ? n.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2

      })
    : '—';
}

const KpiGridDashb = ({
  kpiCot,
  kpiAcept,
  kpiRech,
  kpiPend,
  kpiVenc,
  ticket,
  tasaAcept,
  tasaRech,
  tasaPend,
  tasaVenc
}) => {
  return (


    <section className="kpi-grid">
      {/* Cotizaciones */}

      <article className="kpi-card kpi--blue">
        <div className="kpi-label">Cotizaciones</div>
        <div className="kpi-value">{kpiCot}</div>
        <div>Ticket prom.: <span>{usd(ticket)}</span></div>
      </article>

      {/* Aceptadas */}
      <article className="kpi-card kpi--green">
        <div className="kpi-label">Aceptadas</div>
        <div className="kpi-value">{kpiAcept}</div>
        <div>Tasa: <span>{tasaAcept ?? "—"}%</span></div>
      </article>

      {/* Rechazadas */}
      <article className="kpi-card kpi--red">
        <div className="kpi-label">Rechazadas</div>
        <div className="kpi-value">{kpiRech}</div>
        <div>Tasa: <span>{tasaRech ?? "—"}%</span></div>
      </article>

      {/* Pendientes */}
      <article className="kpi-card kpi--yellow">
        <div className="kpi-label">Pendientes</div>
        <div className="kpi-value">{kpiPend}</div>
        <div>Tasa: <span>{tasaPend ?? "—"}%</span></div>
      </article>

      {/* Vencidas */}
      <article className="kpi-card kpi--gray">
        <div className="kpi-label">Vencidas</div>
        <div className="kpi-value">{kpiVenc}</div>
        <div>Tasa: <span>{tasaVenc ?? "—"}%</span></div>
      </article>
    </section>
  );
};

export default KpiGridDashb;