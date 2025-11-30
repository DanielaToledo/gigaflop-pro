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

const KpiGridDashb = ({ kpiCot, kpiAcept, kpiRech, kpiPend, kpiVenc, ticket, kpiTasa }) => {
  return (
    <section className="kpi-grid">
      <article className="kpi-card kpi--blue">
        <div className="kpi-label">Cotizaciones</div>
        <div className="kpi-value">{kpiCot}</div>
        <div>Ticket prom.: <span>{usd(ticket)}</span></div>
      </article>

      <article className="kpi-card kpi--green">
        <div className="kpi-label">Aceptadas</div>
        <div className="kpi-value">{kpiAcept}</div>
        <div>Tasa: <span>{kpiTasa ?? "—"}%</span></div>
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

      <article className="kpi-card kpi--gray">
        <div className="kpi-label">Vencidas</div>
        <div className="kpi-value">{kpiVenc}</div>
        <div>Sin respuesta</div>
      </article>
    </section>
  );
};

export default KpiGridDashb;