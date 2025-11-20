import React from 'react';

export default function EtiquetaEstado({ estado }) {
  if (!estado || typeof estado.id !== 'number') return '—';

  const clase = getClaseBootstrapPorId(estado.id);
  const nombre = normalizarNombre(estado.nombre);

  return (
    <span className={`badge ${clase}`}>
      {nombre}
    </span>
  );
}

function getClaseBootstrapPorId(id) {
  switch (id) {
    case 1: return 'border border-primary text-primary';       // borrador
    case 2: return 'border border-warning text-warning';       // pendiente
    case 3: return 'border border-success text-success';       // aceptada
    case 4: return 'border border-danger text-danger';         // rechazada
    case 5: return 'border border-secondary text-secondary';   // vencida
    default: return 'border border-secondary text-secondary';
  }
}

function normalizarNombre(nombre) {
  if (!nombre) return '—';
  switch (nombre.toLowerCase()) {
    case 'finalizada_aceptada': return 'ACEPTADA';
    case 'finalizada_rechazada': return 'RECHAZADA';
    default: return nombre.toUpperCase();
  }
}