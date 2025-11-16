// utils/helperDeFecha.js
export function aMySQLDateTime(valor) {
  if (!valor && valor !== 0) return null;
  const d = valor instanceof Date ? valor : new Date(valor);
  if (Number.isNaN(d.getTime())) return null;
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function aMySQLDate(valor) {
  if (!valor && valor !== 0) return null;
  const d = valor instanceof Date ? valor : new Date(valor);
  if (Number.isNaN(d.getTime())) return null;
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function sumarDias(fechaOValor, dias) {
  const d = fechaOValor instanceof Date ? new Date(fechaOValor) : new Date(fechaOValor ?? Date.now());
  if (Number.isNaN(d.getTime())) return null;
  const n = Number(dias) || 0;
  d.setDate(d.getDate() + n);
  return d;
}