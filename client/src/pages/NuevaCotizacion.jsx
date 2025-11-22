import React, { useState, useEffect, useRef } from 'react';
import { useMemo } from 'react';
import axios from 'axios';
import BuscadorProductos from '../components/BuscadorProductos';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../CSS/nuevaCotizacion.css';
import { useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';



// Página para crear una nueva cotización
const NuevaCotizacion = () => {
  const location = useLocation();
  const carritoInicial = location.state?.carrito || [];
  const { id } = useParams();


  // Estados para la cotización seleccionar cliente y contacto

  const navigate = useNavigate(); // Hook para navegación

  const [vigencia, setVigencia] = useState('');
  const [cliente, setCliente] = useState('');
  const [contacto, setContacto] = useState('');
  const [clientesDisponibles, setClientesDisponibles] = useState([]);
  const [contactosCliente, setContactosCliente] = useState([]);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // Estados para la cotización: id, número, estado, mensajes
  const [mensajeError, setMensajeError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [numeroCotizacion, setNumeroCotizacion] = useState('');
  const [estadoCotizacion, setEstadoCotizacion] = useState('');
  const [idCotizacionActual, setIdCotizacionActual] = useState(null);
  const [retomando, setRetomando] = useState(false);

  // Estados para la entrega metododo de envio y direccion
  const [modalidadEntrega, setModalidadEntrega] = useState('Envío');
  const [direccionesCliente, setDireccionesCliente] = useState([]);
  const [direccion, setDireccion] = useState('');
  const [direcciones, setDirecciones] = useState([]);
  const [locacionSeleccionada, setLocacionSeleccionada] = useState('');
  const [zonaEnvio, setZonaEnvio] = useState('');
  const [bonificable, setBonificable] = useState(false);
  const [direccionIdSeleccionada, setDireccionIdSeleccionada] = useState('');
  const [clienteObjeto, setClienteObjeto] = useState(null); // nuevo: objeto completo
  const [zonasEnvio, setZonasEnvio] = useState([]);
  const [costoEnvio, setCostoEnvio] = useState(null);
  const { idCotizacion } = useParams(); // Obtener idCotizacion de la URL para retomar
  const [direccionSeleccionada, setDireccionSeleccionada] = useState('');

  // Estados para condiciones comerciales

  const [tipoCambio, setTipoCambio] = useState('');
  const [diasPago, setDiasPago] = useState('');
  const [diasPagoExtra, setDiasPagoExtra] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [carritoInicializado, setCarritoInicializado] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState('');
  const [infoGlobal, setInfoGlobal] = useState('');
  const [fechaHoy, setFechaHoy] = useState('');
  const [formaPago, setFormaPago] = useState('');
  const [vigenciaHasta, setVigenciaHasta] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [plazoEntrega, setPlazoEntrega] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [condicionSeleccionada, setCondicionSeleccionada] = useState('');
  const [condiciones, setCondiciones] = useState([]);
  const [opcionesDiasPago, setOpcionesDiasPago] = useState([]);       // select
  const [markUpMaximoServer, setMarkUpMaximoServer] = useState(null);

  const [diasPendiente, setDiasPendiente] = useState(null); // nuevo: valor que queremos resolver al retomar
  const diasResueltoRef = useRef(false);      // evita sobrescrituras una vez resuelto
  const condicionesCargadasRef = useRef(false);   // marca que cargarCondiciones ya terminó
  const userInteractedRef = useRef(false);

  //Estados para los estados de las cotizaciones
  const [estados, setEstados] = useState([]);






  // Otros estados como mpstrar modal, año, productos, etc.
  const [yearActual, setYearActual] = useState(new Date().getFullYear());
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [seleccionModal, setSeleccionModal] = useState({});
  const [condicionesComerciales, setCondicionesComerciales] = useState([]);


  // Estados para el buscador de productos(modal)
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [productosPorPagina] = useState(10);

  //estados para el buscador de productos pero fuera del modal
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [query, setQuery] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);

  const [formulario, setFormulario] = useState({ cabecera: {}, productos: [] });
  const [erroresProductos, setErroresProductos] = useState({}); // { <id|index>: "mensaje" }

  // Determina si estamos en modo edición (retomar cotización existente)
  const modoEdicion = Boolean(idCotizacionActual);

  // Obtener el usuario actual desde el contexto
  const { usuario: usuarioActual } = useUser();

  // Normalizadores

  //Helper para resolver id_estado por nombre o devolver valor numérico si ya viene id 
  const resolveEstadoId = (v) => {
    if (v === null || v === undefined || v === '') return null;
    // ya es número
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    // string numérico
    if (typeof v === 'string' && /^\d+$/.test(v.trim())) return Number(v.trim());
    // buscar por nombre en estados cargados (case-insensitive, trim)
    const name = (v && typeof v === 'object') ? (v.nombre ?? v.estado ?? '') : String(v);
    const found = estados.find(e => (e.nombre ?? '').toString().trim().toLowerCase() === name.toString().trim().toLowerCase());
    return found ? Number(found.id) : null;
  };


  //normalizar fecha 
  const toYYYYMMDD = (dateOrIso) => {
    if (!dateOrIso) return null;
    const d = (typeof dateOrIso === 'string') ? new Date(dateOrIso) : dateOrIso;
    if (!d || isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
  };
  const normalizarNumero = v => (v === null || v === undefined || v === '' ? null : Number(v));

  const normalizeMarkup = v => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const normalizarProducto = p => {
    const precioUnit = Number(p.precio_unitario ?? p.precio ?? 0) || 0;
    const descuentoNum = Number(p.descuento ?? 0) || 0;
    const cantidadNum = normalizarNumero(p.cantidad) || 1;

    return {
      id_producto: normalizarNumero(p.id_producto ?? p.id),
      cantidad: cantidadNum,
      precio_unitario: precioUnit,
      descuento: descuentoNum,
      markup_ingresado: normalizeMarkup(p.markup_ingresado),
      tasa_iva: Number(p.tasa_iva ?? 21) || 21,
      part_number: p.part_number ?? p.partNumber ?? null,
      detalle: p.detalle ?? p.nombre ?? null,
      subtotal: Number(p.subtotal ?? ((precioUnit - descuentoNum) * cantidadNum)) || 0
    };
  };

  // Devuelve id de condición como Number o null si no hay id
  const getCondicionId = (cond) => {
    if (cond === null || cond === undefined || cond === '') return null;

    // Si ya es número finito (number)
    if (typeof cond === 'number' && Number.isFinite(cond)) return Number(cond);

    // Si es string, puede ser "123" o "Contado"
    if (typeof cond === 'string') {
      const trimmed = cond.trim();
      if (trimmed === '') return null;
      if (/^\d+$/.test(trimmed)) return Number(trimmed); // "123" -> 123
      // si no es numérica, buscar por nombre en condiciones
      const byName = condiciones.find(c => (c.nombre ?? c.forma_pago ?? '').toString().trim() === trimmed);
      return byName ? byName.id : null;
    }

    // Si es objeto, intentar extraer id directamente o buscar por nombre
    if (typeof cond === 'object') {
      const possibleId = cond.id ?? cond.id_condicion ?? cond.value ?? cond.key;
      if (possibleId !== undefined && possibleId !== null && possibleId !== '') {
        if (typeof possibleId === 'number' && Number.isFinite(possibleId)) return Number(possibleId);
        if (typeof possibleId === 'string' && /^\d+$/.test(possibleId.trim())) return Number(possibleId.trim());
      }
      const possibleName = cond.nombre ?? cond.forma_pago ?? cond.label ?? cond.name;
      if (possibleName) {
        const trimmed = possibleName.toString().trim();
        const byName = condiciones.find(c => (c.nombre ?? c.forma_pago ?? '').toString().trim() === trimmed);
        return byName ? byName.id : null;
      }
    }

    return null;
  };



  // Derivar markUpMaximo de forma segura usando getCondicionId
  const markUpMaximo = useMemo(() => {
    const idCond = getCondicionId(condicionSeleccionada);
    if (!idCond || !Array.isArray(condiciones)) return null;

    const found = condiciones.find(c =>
      Number(c.id) === Number(idCond) || String(c.id) === String(idCond)
    );
    if (!found) return null;

    const raw = found.mark_up_maximo ?? found.markup ?? found.markUpMaximo ?? found.markup_maximo;
    return normalizarNumero(raw);
  }, [condicionSeleccionada, condiciones]);


  // Lista normalizada de productos del carrito
  const productosNormalizados = useMemo(
    () => (Array.isArray(carrito) ? carrito.map(normalizarProducto) : []),
    [carrito]
  );

  // Productos que exceden el máximo (null-safe)
  const productosExcedenMarkup = useMemo(() => {
    if (markUpMaximo === null) return [];
    return productosNormalizados.filter(p => {
      const markup = Number(p.markup_ingresado);
      return Number.isFinite(markup) && markup > markUpMaximo;
    });
  }, [productosNormalizados, markUpMaximo]);

  // Validación antes de enviar (devuelve boolean)
  const validarAntesDeEnviar = () => {
    const maxServer = Number(markUpMaximoServer ?? 0);

    const productosExceden = (Array.isArray(carrito) ? carrito : [])
      .map((p, i) => {
        const key = getProductKey(p, i);
        const ingreso = Number(p.markup_ingresado);
        return { p, key, ingreso, excede: maxServer && !Number.isNaN(ingreso) && ingreso > maxServer };
      })
      .filter(x => x.excede);

    // construir errores por línea
    const errores = {};
    productosExceden.forEach(x => {
      const p = x.p;
      errores[x.key] = `El markup del producto ${p.part_number ?? `id ${p.id_producto ?? p.id}`} (${x.ingreso}%) supera el máximo permitido (${maxServer}%)`;
    });
    setErroresProductos(errores);

    if (productosExceden.length > 0) {
      // mensaje global breve y no la lista completa
      setMensajeError(`Hay ${productosExceden.length} producto(s) con markup superior al máximo ${maxServer}%`);
      return false;
    }

    // limpiar y continuar
    setMensajeError('');
    setErroresProductos({});
    return true;
  };

  // Construir payload para enviar al servidor
  const buildPayload = (estadoNombreOrId = 'borrador', extra = {}) => {
    const productos = (Array.isArray(carrito) ? carrito : [])
      .map(normalizarProducto)
      .filter(p => Number.isFinite(p.id_producto));

    const resolvedIdCond = normalizarNumero(getCondicionId(condicionSeleccionada)) || null;

    // resolver id_estado: aceptar que caller pase nombre o id
    const resolvedEstadoId = resolveEstadoId(estadoNombreOrId);

    return {
      id_cliente: normalizarNumero(clienteSeleccionado ?? clienteObjeto?.id ?? cliente) ?? null,
      id_contacto: contacto ? normalizarNumero(typeof contacto === 'object' ? contacto.id : contacto) : null,
      id_usuario: normalizarNumero(usuarioActual?.id) ?? null,
      id_direccion_cliente: normalizarNumero(direccionIdSeleccionada) ?? null,
      id_condicion: resolvedIdCond || null,
      vigencia_hasta: toYYYYMMDD(vigenciaHasta) || null,
      observaciones: observaciones || '',
      plazo_entrega: plazoEntrega || '',
      costo_envio: normalizarNumero(costoEnvio) || 0,
      // reemplazo clave: enviamos id_estado en lugar de 'estado' textual
      ...(resolvedEstadoId ? { id_estado: resolvedEstadoId } : {}),
      productos,
      ...extra
    };
  };

  // cargar estados (una sola vez)
  useEffect(() => {
    axios.get('/api/estados', { headers: { 'Cache-Control': 'no-cache' } })
      .then(({ data }) => {
        // asumimos que devuelve array [{ id, nombre, ... }]
        setEstados(Array.isArray(data) ? data : (data?.estados || []));
      })
      .catch(err => {
        console.error('Error al cargar estados:', err);
        setEstados([]);
      });
  }, []);



  useEffect(() => {
    const id = localStorage.getItem('idCotizacionActual');
    const retomar = location.state?.retomar;

    console.log('🧪 Retomar:', retomar, 'ID:', id);
    if (retomar && id) {
      setRetomando(true); // ✅ activa el mensaje
      cargarCotizacionExistente(id);
    } else {
      localStorage.removeItem('idCotizacionActual');
      setRetomando(false);
    }

  }, []);


  //fecha de hoy para usar en la cotizacion
  useEffect(() => {
    setFechaHoy(new Date().toISOString().slice(0, 10));
  }, []);

  //el carrito se abre con los productos enviados desde la pagina de productos o los que estan en localStorage
  useEffect(() => {
    if (location.state?.carrito) {
      const productos = location.state.carrito;
      const formateados = productos.map(p => ({
        ...p,
        cantidad: p.quantity || 1,
        markup_ingresado: p.markup_ingresado ?? p.markup ?? null,
        descuento: p.descuento ?? 0,
        precio: num(p.precio) || 0,
        tasa_iva: num(p.tasa_iva) || 21
      }));
      setCarrito(formateados);
      setProductosSeleccionados(formateados);
      // validar cada producto para precargar errores inline
      formateados.forEach((p, idx) => validateMarkupForProduct(getProductKey(p, idx), p.markup_ingresado));


    } else {
      const guardados = localStorage.getItem('productosParaCotizar');
      if (guardados) {
        try {
          const productos = JSON.parse(guardados);
          const formateados = productos.map(p => ({
            ...p,
            cantidad: 1,
            markup_ingresado: null,
            descuento: 0
          }));
          setCarrito(formateados);
          localStorage.removeItem('productosParaCotizar');
        } catch (err) {
          console.error('Error al leer productos para cotizar', err);
        }
      }
    }
  }, [location.state]);


  // Cargar productos disponibles para el buscador (modal)
  useEffect(() => {
    axios.get('/api/productos')
      .then(({ data }) => {
        console.log('Respuesta completa:', data);
        if (Array.isArray(data.productos)) {
          setProductosDisponibles(data.productos);
        } else {
          console.error('La respuesta no contiene un array de productos:', data);
          setProductosDisponibles([]);
        }
      })
      .catch(err => {
        console.error('Error al cargar productos', err);
        setProductosDisponibles([]);
      });


  }, []);


  // Filtrar productos según búsqueda para el modal
  useEffect(() => {
    const texto = busqueda.toLowerCase();
    const filtrados = productosDisponibles.filter(p =>
      p.detalle?.toLowerCase().includes(texto) ||
      p.part_number?.toLowerCase().includes(texto) ||
      p.marca?.toLowerCase().includes(texto) ||
      p.categoria?.toLowerCase().includes(texto)
    );
    console.log('Filtrados:', filtrados);

    setProductosFiltrados(filtrados);
    setPaginaActual(1); // reiniciar paginación al buscar
  }, [busqueda, productosDisponibles]);

  // Dentro del componente, después de los useState y useEffect para filtrar productos y manejar la paginación
  const indexInicio = (paginaActual - 1) * productosPorPagina;
  const indexFin = indexInicio + productosPorPagina;
  const productosPagina = productosFiltrados.slice(indexInicio, indexFin);

  const agregarAlCarritoDesdeModal = (producto) => {
    const nuevo = {
      ...producto,
      cantidad: 1,
      markup_ingresado: null,
      descuento: 0,
      precio: num(producto.precio) || 0,
      tasa_iva: num(producto.tasa_iva) || 21
    };

    setCarrito(prev => { // Evita duplicados
      const yaExiste = prev.some(p => p.part_number === nuevo.part_number);
      return yaExiste ? prev : [...prev, nuevo];
    }); console.log('🧪 Intentando agregar al carrito:', nuevo);
  };

  // Agregar productos seleccionados al carrito desde el modal
  const agregarProductosAlCarrito = () => { // Agrega los productos seleccionados al carrito
    const nuevos = productosSeleccionados.map(p => ({
      ...p,
      cantidad: 1,
      markup_ingresado: null,
      descuento: 0,
      precio: num(p.precio) || 0,
      tasa_iva: num(p.tasa_iva) || 21
    }));

    setCarrito(prev => [...prev, ...nuevos]);
    cerrarModalConTransicion();
    setBusquedaProducto('');
  };

  // Manejo de apertura/cierre del modal con transición
  const [ocultarModal, setOcultarModal] = useState(false);
  const cerrarModalConTransicion = () => {
    setOcultarModal(true);
    setTimeout(() => {
      setMostrarModal(false);
      setOcultarModal(false);
    }, 300); // duración de la transición
  };



  // Contacto seleccionado
  const contactoSeleccionado = contactosCliente.find(c => c.id === parseInt(contacto));
  const num = (v) => (isNaN(parseFloat(v)) ? 0 : parseFloat(v));
  const showGlobalError = (msg) => setErrorGlobal(msg);
  const showGlobalInfo = (msg) => setInfoGlobal(msg);


  // Cargar clientes disponibles (mock)
  useEffect(() => {
    const buscarProductos = async () => {
      try {
        const res = await axios.get(`/api/productos/buscar-flex?query=${busqueda}`, {
          headers: { 'Cache-Control': 'no-cache' }
        });
        setProductosFiltrados(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Error al cargar productos:', err);
      }
    };

    if (busqueda.trim().length > 1) {
      buscarProductos();
    }
  }, [busqueda]);







  // Obtener idCotizacion de los parámetros de la URL
  useEffect(() => {
    if (idCotizacion) {
      cargarCotizacionExistente(idCotizacion);
    }
  }, [idCotizacion]);


  const getProductKey = (p, i) => String(p.id_producto ?? p.id ?? p.part_number ?? `idx_${i}`);

  const validateMarkupForProduct = (productKey, valorMarkup) => {
    const maxServer = Number(markUpMaximoServer ?? 0);
    const ingreso = Number(valorMarkup);

    setErroresProductos(prev => {
      const nuevo = { ...(prev || {}) };

      if (!maxServer || valorMarkup === null || valorMarkup === undefined || Number.isNaN(ingreso)) {
        delete nuevo[String(productKey)];
        return nuevo;
      }

      if (ingreso > maxServer) {
        nuevo[String(productKey)] = `El markup del producto ${productKey} (${ingreso}%) supera el máximo permitido (${maxServer}%)`;
      } else {
        delete nuevo[String(productKey)];
      }

      return nuevo;
    });
  };




  //ESTA FUNCION CARGA LA COTIZACION EXISTENTE PARA RETOMARLA:
  // Flujo:
  // 1. Obtener cotización
  // 2. Reconstruir cliente
  // 3. Enriquecer productos
  // 4. Cargar condiciones
  // 5. Cargar contactos/direcciones/días
  // 6. Aplicar selección automática

  const cargarCotizacionExistente = async (id) => {
    const normalizarNumero = v => (v === null || v === undefined || v === '' ? null : Number(v));
    const norm = s => String(s ?? '').trim().toLowerCase();

    try {
      const res = await axios.get(`/api/cotizaciones/borrador/retomar/${id}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      console.log('Respuesta completa de cotización:', res.data);
      const { cabecera, productos } = res.data;

      console.log('🧪 productos retomados:', productos);
      console.log('📦 cabecera completa desde backend:', cabecera);

      if (!cabecera?.id_cliente) {
        console.error('❌ cabecera.id_cliente está vacío o undefined');
        return;
      }

      // 1) Setear cliente seleccionado (id) temprano
      setClienteSeleccionado(cabecera.id_cliente);

      // Reconstruir clienteObjeto para mostrar en UI
      let clienteEncontrado = Array.isArray(clientesDisponibles)
        ? clientesDisponibles.find(c => Number(c.id) === Number(cabecera.id_cliente))
        : undefined;

      if (!clienteEncontrado && cabecera?.cliente_nombre && cabecera?.cuit) {

        // reconstruimos el cliente desde cabecera.idcliente y lo agregamos al estado clientesDisponibles
        clienteEncontrado = {
          id: cabecera.id_cliente,
          razon_social: String(cabecera.cliente_nombre).trim(),
          cuit: String(cabecera.cuit).trim(),
          contactos: cabecera.contactos ?? [],
          direcciones: cabecera.direcciones ?? [],
          email: cabecera.email ?? '',
          contacto_nombre: cabecera.contacto_nombre ?? '',
          contacto_apellido: cabecera.contacto_apellido ?? ''
        };

        setClientesDisponibles(prev => {
          const prevArr = Array.isArray(prev) ? prev : [];
          const yaExiste = prevArr.some(x => Number(x.id) === Number(clienteEncontrado.id));
          return yaExiste ? prevArr : [...prevArr, clienteEncontrado];
        });
      }

      setClienteObjeto(clienteEncontrado || null);
      setBusquedaCliente(
        clienteEncontrado
          ? `${clienteEncontrado.razon_social} – CUIT: ${clienteEncontrado.cuit}`
          : ''
      );
      console.log('📦 productosDisponibles al enriquecer:', productosDisponibles);


      // ✅ Enriquecer productos con decorativos desde catálogo
      const productosEnriquecidos = (Array.isArray(productos) ? productos : []).map(p => {
        const decorado = productosDisponibles?.find(prod =>
          prod.id === p.id_producto || prod.id === p.id
        ) ?? {};

        const cantidad = Number(p.cantidad ?? 1);
        const descuento = Number(p.descuento ?? 0);
        const precioUnitario = Number(p.precio_unitario ?? p.precio ?? 0);
        const subtotal = Number(p.subtotal ?? ((precioUnitario - descuento) * cantidad));

        return {
          id: p.id_producto ?? p.id,
          id_producto: p.id_producto ?? p.id,
          cantidad,
          markup_ingresado: p.markup_ingresado !== undefined && p.markup_ingresado !== null
            ? Number(p.markup_ingresado)
            : null,
          descuento,
          precio: Number(p.precio) || 0,
          precio_unitario: precioUnitario,
          tasa_iva: Number(p.tasa_iva ?? 21),
          part_number: p.part_number ?? p.partNumber ?? null,
          subtotal,
          detalle: p.detalle ?? decorado.nombre ?? '',
          marca: decorado.marca ?? p.marca ?? '',
          categoria: decorado.categoria ?? p.categoria ?? '',
          subcategoria: decorado.subcategoria ?? p.subcategoria ?? ''
        };
      });

      setCarrito(productosEnriquecidos);
      setProductosSeleccionados(productosEnriquecidos);




      // ------------------------------------------------------------
      // CARGAR Y NORMALIZAR CONDICIONES (fuente de verdad local)
      // ------------------------------------------------------------
      const condicionesLoaded = await cargarCondiciones(cabecera.id_cliente);

      // Normalizar posibles formatos de retorno
      let condicionesFuente = [];
      if (Array.isArray(condicionesLoaded)) {
        condicionesFuente = condicionesLoaded;
      } else if (condicionesLoaded && typeof condicionesLoaded === 'object') {
        if (Array.isArray(condicionesLoaded.lista)) condicionesFuente = condicionesLoaded.lista;
        else if (Array.isArray(condicionesLoaded.listaCondiciones)) condicionesFuente = condicionesLoaded.listaCondiciones;
        else if (Array.isArray(condicionesLoaded.lista_condiciones)) condicionesFuente = condicionesLoaded.lista_condiciones;
        else if (Array.isArray(condicionesLoaded.condiciones)) condicionesFuente = condicionesLoaded.condiciones;
        else {
          const maybe = condicionesLoaded;
          if (maybe && (maybe.id || maybe.forma_pago)) condicionesFuente = [maybe];
        }
      }

      // fallback: usar estado si no vino nada
      if (!Array.isArray(condicionesFuente) || condicionesFuente.length === 0) {
        condicionesFuente = Array.isArray(condiciones) && condiciones.length > 0 ? condiciones : [];
      }

      // dedupe defensivo por id (prioriza entradas con dias_pago no vacíos y prioriza la última)
      const dedupeCondiciones = (arr = []) => {
        const map = new Map();
        for (let i = arr.length - 1; i >= 0; i--) {
          const c = arr[i] ?? {};
          const id = String(c?.id ?? c?.id_condicion ?? '');
          if (!id) continue;
          if (!map.has(id)) map.set(id, c);
          else {
            const existing = map.get(id);
            const existingDias = String(existing?.dias_pago ?? existing?.dias ?? '').trim();
            const currentDias = String(c?.dias_pago ?? c?.dias ?? '').trim();
            if ((!existingDias || existingDias === '') && currentDias) map.set(id, c);
          }
        }
        return Array.from(map.values()).reverse();
      };

      condicionesFuente = dedupeCondiciones(condicionesFuente);

      // Guardar en estado y marcar como cargadas
      if (typeof setCondiciones === 'function') setCondiciones(condicionesFuente);
      if (typeof condicionesCargadasRef !== 'undefined' && condicionesCargadasRef && 'current' in condicionesCargadasRef) {
        condicionesCargadasRef.current = true;
      }

      console.log('AFTER cargarCondiciones -> condicionesFuente (post-dedupe):', condicionesFuente);


      // ------------------------------------------------------------
      // Decidir si usar el valor de la cabecera como diasPendiente
      // (ahora basado en condicionesFuente, no en condiciones estado obsoleto)
      // ------------------------------------------------------------
      let _diasPendienteLocal = null;
      const diasCabecera = cabecera.dias_pago ?? cabecera.vencimiento ?? null;

      if (diasCabecera !== null && diasCabecera !== undefined && String(diasCabecera).trim() !== '') {
        const valCab = String(diasCabecera).trim();

        const idCondOrigenTemp = cabecera.id_condicion ?? null;
        const condicionDesdeCabeceraTemp = (Array.isArray(condicionesFuente) && idCondOrigenTemp)
          ? condicionesFuente.find(c => Number(c.id) === Number(idCondOrigenTemp)) || null
          : null;

        const diasDesdeCondicionTemp = condicionDesdeCabeceraTemp ? String(condicionDesdeCabeceraTemp.dias_pago ?? condicionDesdeCabeceraTemp.dias ?? '').trim() : '';

        if (!diasDesdeCondicionTemp) {
          // La condición no trae días -> usamos cabecera como pendiente
          _diasPendienteLocal = valCab;
          if (typeof setDiasPendiente === 'function') setDiasPendiente(_diasPendienteLocal);
        } else {
          // La condición ya tiene días -> preferimos esa fuente
          _diasPendienteLocal = null;
          if (typeof setDiasPendiente === 'function') setDiasPendiente(null);
        }
      } else {
        if (typeof setDiasPendiente === 'function') setDiasPendiente(null);
      }

      // ------------------------------------------------------------
      // helper: aplicar dias y tipo de cambio desde una condición concreta (usa opciones actuales si existen)
      // ------------------------------------------------------------
      const aplicarDiasDesdeCondicion = (cond) => {
        if (!cond) return false;
        const diasCondRaw = cond.dias_pago ?? cond.dias ?? '';
        const diasCond = String(diasCondRaw ?? '').trim();
        const tipoCambioCond = cond.tipo_cambio ?? cond.tipoCambio ?? '';
        if (tipoCambioCond !== '') setTipoCambio(String(tipoCambioCond));

        if (!diasCond) return false;

        const opcionesEstado = Array.isArray(opcionesDiasPago) ? opcionesDiasPago.map(String).map(s => s.trim()) : [];
        if (opcionesEstado.length > 0 && opcionesEstado.includes(diasCond)) {
          setDiasPago(diasCond);
          setDiasPagoExtra('');
        } else {
          setDiasPago('');
          setDiasPagoExtra(diasCond);
        }

        if (typeof diasResueltoRef !== 'undefined' && diasResueltoRef && 'current' in diasResueltoRef) diasResueltoRef.current = true;
        return true;
      };





      // ------------------------------------------------------------
      // Aplicar condición preferente desde condicionesFuente (sin depender del state)
      // ------------------------------------------------------------
      const idCondOrigen = normalizarNumero(cabecera.id_condicion);
      const formaOrigen = (cabecera.forma_pago ?? '').toString().trim();

      const idSelActual = (condicionSeleccionada && typeof condicionSeleccionada === 'object' && condicionSeleccionada.id) ? Number(condicionSeleccionada.id) : null;
      const tieneSeleccionUsuario = !!idSelActual || (formaPago && String(formaPago).trim() !== '');

      // Solo aplicar automáticamente si el usuario NO interactuó y no existe selección previa
      if (!tieneSeleccionUsuario && !userInteractedRef?.current) {
        if (idCondOrigen) {
          const found = condicionesFuente.find(c => Number(c.id) === Number(idCondOrigen));
          if (found) {
            // aplicar desde la variable local 'found' para evitar leer state que React todavía no actualizó
            const forma = (found.forma_pago ?? found.nombre ?? '').toString().trim();
            setCondicionSeleccionada({ id: found.id, forma_pago: forma });
            setFormaPago(forma);

            const tipoCambioFromCond = found.tipo_cambio ?? found.tipoCambio ?? '';
            if (tipoCambioFromCond !== '') setTipoCambio(String(tipoCambioFromCond));

            aplicarDiasDesdeCondicion(found);
          } else {
            // no vino la condición en la lista: guardamos id y forma del header para payload
            setCondicionSeleccionada({ id: idCondOrigen, forma_pago: formaOrigen || '' });
            setFormaPago(formaOrigen || '');
          }
        } else if (formaOrigen) {
          const byName = condicionesFuente.find(c => norm(c.forma_pago ?? c.nombre) === norm(formaOrigen));
          if (byName) {
            const forma = (byName.forma_pago ?? '').toString().trim();
            setCondicionSeleccionada({ id: byName.id, forma_pago: forma });
            setFormaPago(forma);

            const tipoCambioFromCond = byName.tipo_cambio ?? byName.tipoCambio ?? '';
            if (tipoCambioFromCond !== '') setTipoCambio(String(tipoCambioFromCond));
            aplicarDiasDesdeCondicion(byName);
          } else {
            setCondicionSeleccionada({ id: null, forma_pago: formaOrigen });
            setFormaPago(formaOrigen);
          }
        } else {
          setCondicionSeleccionada('');
          setFormaPago('');
        }
      } else {
        // Si el usuario ya tenía selección, sincronizamos formaPago con la selección actual (si es posible)
        if (idSelActual) {
          const matched = condicionesFuente.find(c => Number(c.id) === Number(idSelActual));
          if (matched) {
            setCondicionSeleccionada({ id: matched.id, forma_pago: (matched.forma_pago ?? '').toString().trim() });
            setFormaPago((matched.forma_pago ?? '').toString().trim());

            const tipoCambioFromCond = matched.tipo_cambio ?? matched.tipoCambio ?? '';
            if (tipoCambioFromCond !== '') setTipoCambio(String(tipoCambioFromCond));
            aplicarDiasDesdeCondicion(matched);
          }
        }
      }

      // ------------------------------------------------------------
      // Cargar contactos (esperar y manejar fallo sin sobreescribir todo)
      // ------------------------------------------------------------
      try {
        const contactosRes = await axios.get(`/api/clientes/${cabecera.id_cliente}/contactos`);
        const listaContactos = Array.isArray(contactosRes.data) ? contactosRes.data : [];
        setContactosCliente(listaContactos);

        const contactoEncontrado = listaContactos.find(c => Number(c.id) === Number(cabecera.id_contacto));
        setContacto(contactoEncontrado?.id || '');
      } catch (err) {
        console.error('Error al cargar contactos del cliente', err);
        setContactosCliente(prev => prev || []);
        setContacto('');
      }

      // ------------------------------------------------------------
      // Cargar direcciones y días de pago
      // ------------------------------------------------------------
      try {
        const direccionesRes = await axios.get(`/api/clientes/${cabecera.id_cliente}/direcciones`);
        setDireccionesCliente(Array.isArray(direccionesRes.data) ? direccionesRes.data : []);
        setDireccionIdSeleccionada(cabecera.id_direccion_cliente || '');
        console.log('🧪 Dirección retomada:', cabecera.id_direccion_cliente);
      } catch (err) {
        console.error('Error al cargar direcciones del cliente', err);
        setDireccionesCliente(prev => prev || []);
        setDireccionIdSeleccionada('');
      }

      try {
        const diasRes = await axios.get(`/api/clientes/${cabecera.id_cliente}/dias-pago`);

        // Normalizar opciones como strings trimmed, únicos y sin vacíos
        const opcionesRaw = Array.isArray(diasRes.data) ? diasRes.data : [];
        const opciones = Array.from(new Set(opcionesRaw.map(x => String(x ?? '').trim()))).filter(x => x !== '');
        setOpcionesDiasPago(opciones);

        // reset flag local (si existe el ref)
        if (typeof diasResueltoRef !== 'undefined' && diasResueltoRef && 'current' in diasResueltoRef) {
          diasResueltoRef.current = false;
        }

        console.log('opciones normalizadas:', opciones);
        console.log('condicionSeleccionada raw:', condicionSeleccionada);
        console.log('pendiente local:', typeof _diasPendienteLocal !== 'undefined' ? _diasPendienteLocal : null);

        // helper local para aplicar valor en select o en extra (mutuamente excluyentes)
        const aplicarValorDiasLocal = (valor) => {
          const v = String(valor ?? '').trim();
          if (!v) return false;
          if (opciones.includes(v)) {
            setDiasPago(v);
            setDiasPagoExtra('');
          } else {
            setDiasPago('');
            setDiasPagoExtra(v);
          }
          if (typeof diasResueltoRef !== 'undefined' && diasResueltoRef && 'current' in diasResueltoRef) diasResueltoRef.current = true;
          return true;
        };

        // Determinar prioridad de origen de dias (variables locales)
        let aplicado = false;

        // 1) intentar desde condicionSeleccionada (si es objeto con id)
        const csLocal = condicionSeleccionada && typeof condicionSeleccionada === 'object' ? condicionSeleccionada : null;
        if (csLocal && csLocal.id) {
          const matchedLocal = condicionesFuente.find(c => Number(c.id) === Number(csLocal.id)) || null;
          const diasCond = matchedLocal ? (matchedLocal.dias_pago ?? matchedLocal.dias ?? null) : null;
          console.log('matchedLocal.dias_pago (si matched):', matchedLocal ? (matchedLocal.dias_pago ?? matchedLocal.dias) : null);
          if (diasCond !== null && diasCond !== undefined && String(diasCond).trim() !== '') {
            aplicado = aplicarValorDiasLocal(diasCond);

            // si no estaba en opciones y querés que el select lo muestre, añadilo y reaplicá
            if (!aplicado) {
              const v = String(diasCond).trim();
              if (v) {
                const merged = Array.from(new Set([...(opciones || []), v]));
                setOpcionesDiasPago(merged);
                // aplicar con la nueva lista (actualizar estado ya disparará render; aquí aplicamos de todas formas)
                aplicarValorDiasLocal(v);
                aplicado = true;
              }
            }
          }
        }

        // 2) fallback: usar diasPendiente (estado) si existe
        if (!aplicado && diasPendiente) {
          const val = String(diasPendiente).trim();
          if (val) {
            if (!opciones.includes(val)) {
              setOpcionesDiasPago(prev => Array.from(new Set([...(prev || []), val])));
            }
            aplicarValorDiasLocal(val);
          }
        }

        console.log('despues aplicar -> diasPago:', diasPago, 'diasPagoExtra:', diasPagoExtra);
      } catch (err) {
        console.error('Error al cargar días de pago del cliente', err);
        setOpcionesDiasPago([]);
      }

      // ------------------------------------------------------------
      // Mapear y normalizar productos devueltos por la API y setear el carrito
      // ------------------------------------------------------------
      const formateados = (Array.isArray(productos) ? productos : []).map(p => ({
        id: p.id_producto ?? p.id,
        id_producto: p.id_producto ?? p.id,
        cantidad: Number(p.cantidad ?? 1),
        markup_ingresado: p.markup_ingresado !== undefined && p.markup_ingresado !== null
          ? Number(p.markup_ingresado)
          : null,
        descuento: Number(p.descuento ?? 0),
        precio: Number(p.precio) || 0,
        precio_unitario: Number(p.precio_unitario ?? p.precio ?? 0),
        tasa_iva: Number(p.tasa_iva ?? 21),
        part_number: p.part_number ?? p.partNumber ?? null,
        detalle: p.detalle ?? p.nombre ?? null,
        subtotal: Number(p.subtotal ?? ((Number(p.precio_unitario ?? p.precio ?? 0) - Number(p.descuento ?? 0)) * (p.cantidad || 1)))
      }));

      setProductosSeleccionados(formateados);
      setCarrito(formateados);
      // validar cada producto para precargar errores inline
      formateados.forEach((p, idx) => validateMarkupForProduct(getProductKey(p, idx), p.markup_ingresado));



      // Limpiar errores por producto
      setErroresProductos({});

      // Otros datos de cabecera
      setVigenciaHasta(cabecera.vigencia_hasta || '');
      setObservaciones(cabecera.observaciones || '');
      setPlazoEntrega(cabecera.plazo_entrega || '');
      setCostoEnvio(cabecera.costo_envio ?? '');

      setEstadoCotizacion(cabecera.estado);
      setNumeroCotizacion(cabecera.numero_cotizacion);
      setIdCotizacionActual(cabecera.id ?? cabecera.id_cotizacion ?? null);
      localStorage.setItem('idCotizacionActual', (cabecera.id ?? cabecera.id_cotizacion ?? '') + '');

      if (cabecera.mark_up_maximo !== undefined) {
        setMarkUpMaximoServer?.(Number(cabecera.mark_up_maximo));
      }

      // Logs para verificación
      console.log('cabecera (retomada):', cabecera);
      console.log('clienteEncontrado (reconstruido):', clienteEncontrado);
      console.log('condiciones (post cargarCondiciones - local):', condicionesFuente);
      console.log('condicionSeleccionada (final):', condicionSeleccionada, '-> getCondicionId:', getCondicionId(condicionSeleccionada));
      console.log('diasPago (final):', diasPago, 'diasPagoExtra (final):', diasPagoExtra);
      console.log('tipoCambio (final):', tipoCambio);
      console.log('carrito reconstruido:', formateados);
    } catch (error) {
      console.error('Error al cargar cotización existente:', error);
    }
  };


  useEffect(() => {
    if (!clienteSeleccionado) return;
    if (userInteractedRef?.current) return;
    if (diasResueltoRef?.current) return;

    let mounted = true;

    (async () => {
      try {
        // esperar hasta que condiciones hayan sido cargadas (timeout 1s)
        const esperaCondiciones = () => new Promise(resolve => {
          const start = Date.now();
          const tick = () => {
            if (condicionesCargadasRef.current) return resolve(true);
            if (Date.now() - start > 1000) return resolve(false);
            setTimeout(tick, 50);
          };
          tick();
        });
        await esperaCondiciones();

        const { data } = await axios.get(`/api/clientes/${clienteSeleccionado}/dias-pago`);
        if (!mounted) return;

        // normalizar y guardar opciones
        const opciones = Array.isArray(data)
          ? Array.from(new Set(data.map(x => String(x ?? '').trim()))).filter(x => x !== '')
          : [];
        setOpcionesDiasPago(opciones);

        // helper para aplicar valor según las opciones recién obtenidas
        const aplicarValor = (valor) => {
          const v = String(valor ?? '').trim();
          if (!v) return false;
          if (opciones.includes(v)) {
            setDiasPago(v);
            setDiasPagoExtra('');
          } else {
            setDiasPago('');
            setDiasPagoExtra(v);
          }
          if (typeof diasResueltoRef !== 'undefined' && diasResueltoRef && 'current' in diasResueltoRef) diasResueltoRef.current = true;
          return true;
        };

        // prioridad: usar diasPendiente (estado) si existe
        const pendiente = (typeof diasPendiente !== 'undefined' && diasPendiente) ? String(diasPendiente).trim() : null;

        if (pendiente) {
          // leemos los valores actuales del estado para no sobrescribir la selección del usuario
          const usuarioTieneSeleccion = (diasPago && String(diasPago).trim() !== '') || (diasPagoExtra && String(diasPagoExtra).trim() !== '');
          if (!usuarioTieneSeleccion) {
            const aplicado = aplicarValor(pendiente);
            if (aplicado && typeof setDiasPendiente === 'function') setDiasPendiente(null);
          }
        }
      } catch (err) {
        console.error('Error al cargar días de pago del cliente', err);
        setOpcionesDiasPago([]);
      }
    })();

    return () => { mounted = false; };
    // agrego diasPago/diasPagoExtra para asegurar que el efecto vea la selección más reciente
  }, [clienteSeleccionado, diasPendiente, diasPago, diasPagoExtra]);




  // Buscar clientes a medida que se escribe
  useEffect(() => {
    console.log('Buscando cliente:', busquedaCliente); // ✅
    const buscarClientes = async () => {
      if (busquedaCliente.trim().length < 2) {
        setSugerencias([]);
        return;
      }

      try {
        const res = await axios.get(`/api/clientes/buscar/${busquedaCliente}`, {
          withCredentials: true,
        });
        console.log('Respuesta de clientes:', res.data); // ✅
        setSugerencias(res.data || []);
      } catch (err) {
        console.error('Error al buscar clientes:', err);
        setSugerencias([]);
      }
    };

    const delay = setTimeout(buscarClientes, 300); // debounce
    return () => clearTimeout(delay);
  }, [busquedaCliente]);





  // Cargar direcciones del cliente seleccionado
  useEffect(() => {
    if (!cliente) return;

    axios.get(`/api/clientes/${cliente}/direcciones`)


      .then(({ data }) => {
        console.log('Direcciones recibidas:', data);

        setDireccionesCliente(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Error al cargar direcciones del cliente', err);
        setDireccionesCliente([]);
      });
  }, [cliente]);


  // Actualizar costo de envío al cambiar dirección o modalidad
  useEffect(() => {
    if (!direccionIdSeleccionada || modalidadEntrega !== 'Envío') return;

    axios.get(`/api/clientes/envios/costo?id_direccion=${direccionIdSeleccionada}`)
      .then(({ data }) => {
        setCostoEnvio(data.costo);
        setZonaEnvio(data.zona_envio);
      })
      .catch(err => {
        console.error('Error al obtener costo de envío:', err);
        setCostoEnvio(null);
        setZonaEnvio('');
      });
  }, [direccionIdSeleccionada, modalidadEntrega]);




  // Cargar todas las zonas de envío con su costo al montar el componente
  useEffect(() => {
    fetch('http://localhost:4000/api/clientes/envios/zonas')
      .then((res) => res.json())
      .then((data) => {
        console.log('Zonas recibidas:', data);
        setZonasEnvio(data);
      })
      .catch((err) => console.error('Error al cargar zonas de envío:', err));
  }, []);



  // Cargar condiciones comerciales al cambiar cliente
  useEffect(() => {
    if (!clienteSeleccionado) {
      condicionesCargadasRef.current = false;
      return;
    }

    let mounted = true;
    condicionesCargadasRef.current = false;

    (async () => {
      try {
        const loaded = await cargarCondiciones(clienteSeleccionado);
        if (!mounted) return;
        // marcar que la llamada terminó (aunque venga vacía)
        condicionesCargadasRef.current = true;
        // setCondiciones debería hacerse dentro de cargarCondiciones; si no, hacelo aquí:
        if (Array.isArray(loaded) && typeof setCondiciones === 'function') setCondiciones(loaded);
      } catch (err) {
        console.error('Error en cargarCondiciones useEffect', err);
        condicionesCargadasRef.current = true;
      }
    })();

    return () => { mounted = false; };
  }, [clienteSeleccionado]);


  // Cargar condiciones comerciales al seleccionar cliente
  const cargarCondiciones = async (idCliente) => {
    try {
      const { data } = await axios.get(`/api/clientes/${idCliente}/condiciones`, {
        headers: { 'Cache-Control': 'no-cache' }
      });

      // Normalizar la respuesta a un array de condiciones
      let listaCondiciones = [];
      if (Array.isArray(data)) {
        listaCondiciones = data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.lista)) {
          listaCondiciones = data.lista;
        } else {
          listaCondiciones = [data];
        }
      } else {
        listaCondiciones = [];
      }

      // Garantizar keys y normalizar formato
      listaCondiciones = listaCondiciones.map(r => ({
        id: r.id ?? r.id_condicion ?? null,
        forma_pago: (r.forma_pago ?? r.nombre ?? '').toString().trim(),
        tipo_cambio: r.tipo_cambio ?? '',
        dias_pago: r.dias_pago ?? r.dias ?? '',
        mark_up_maximo: r.mark_up_maximo ?? r.markup_maximo ?? null,
        ...r
      }));

      // dedupe: prioriza la entrada que tenga dias_pago no vacío; en empate prioriza la última
      const dedupeCondiciones = (arr = []) => {
        const map = new Map();
        for (let i = arr.length - 1; i >= 0; i--) {
          const c = arr[i];
          const id = String(c?.id ?? '');
          if (!map.has(id)) {
            map.set(id, c);
          } else {
            const existing = map.get(id);
            const existingDias = String(existing?.dias_pago ?? existing?.dias ?? '').trim();
            const currentDias = String(c?.dias_pago ?? c?.dias ?? '').trim();
            if ((!existingDias || existingDias === '') && currentDias) {
              map.set(id, c);
            }
          }
        }
        return Array.from(map.values()).reverse();
      };

      const listaDedup = dedupeCondiciones(listaCondiciones);

      // Guardar lista dedupeada en el estado (fuente de verdad)
      if (typeof setCondiciones === 'function') setCondiciones(listaDedup);
      // indicar que condiciones fueron cargadas (si usás el ref)
      if (typeof condicionesCargadasRef !== 'undefined' && condicionesCargadasRef && 'current' in condicionesCargadasRef) {
        condicionesCargadasRef.current = true;
      }

      // Helper local para obtener id válido desde condicionSeleccionada
      const getIdSeleccion = (cs) => {
        if (!cs) return null;
        if (typeof cs === 'object' && (cs.id !== undefined && cs.id !== null)) return Number(cs.id);
        if (!isNaN(Number(cs))) return Number(cs);
        return null;
      };

      // Determinar condicion a aplicar: si cabecera ya tiene id_condicion debe priorizarse
      // Nota: este método sólo calcula defaults; quien llamó a cargarCondiciones puede usar el retorno para aplicar más lógica.
      const condicionDefault = listaDedup[0] ?? null;
      const defaultForma = (condicionDefault?.forma_pago ?? '').toString().trim();
      const defaultCambio = condicionDefault?.tipo_cambio ?? '';
      const defaultDias = (condicionDefault?.dias_pago ?? '').toString().trim();

      // Si ya hay una selección válida, respetarla; si no, setear default usando listaDedup (no el estado)
      const idSelActual = getIdSeleccion(condicionSeleccionada);
      if (idSelActual) {
        const matched = listaDedup.find(c => Number(c.id) === Number(idSelActual));
        if (matched) {
          setCondicionSeleccionada({ id: matched.id, forma_pago: (matched.forma_pago ?? '').toString().trim() });
          setFormaPago((matched.forma_pago ?? '').toString().trim());
        } else {
          setCondicionSeleccionada(prev => (typeof prev === 'object' ? prev : { id: prev, forma_pago: String(prev ?? '') }));
          setFormaPago(prev => (prev ? String(prev) : ''));
        }
      } else {
        // aplicar default desde listaDedup
        if (condicionDefault && condicionDefault.id !== null) {
          setCondicionSeleccionada({ id: condicionDefault.id, forma_pago: defaultForma });
          setFormaPago(defaultForma);
        } else if (defaultForma) {
          setCondicionSeleccionada(defaultForma);
          setFormaPago(defaultForma);
        } else {
          setCondicionSeleccionada('');
          setFormaPago('');
        }
      }

      // Tipo de cambio y días de pago (mantener consistencia)
      setTipoCambio(defaultCambio);

      if (defaultDias) {
        const opciones = Array.isArray(opcionesDiasPago) ? opcionesDiasPago.map(String) : [];
        if (opciones.includes(String(defaultDias))) {
          setDiasPago(String(defaultDias));
          setDiasPagoExtra('');
        } else {
          setDiasPago('');
          setDiasPagoExtra(defaultDias);
        }
        // marca resuelto sólo si aplicaste algo
        if (typeof diasResueltoRef !== 'undefined' && diasResueltoRef && 'current' in diasResueltoRef) diasResueltoRef.current = true;
      } else {
        setDiasPago('');
        setDiasPagoExtra('');
      }

      console.log('Tipo de cambio recibido:', defaultCambio);
      console.log('Forma de pago (seleccionada o default):', condicionSeleccionada ?? defaultForma);
      console.log('Días de pago (aplicados o default):', defaultDias);
      // devolver por si el caller quiere usar los datos inmediatamente
      return { condicionDefault, listaCondiciones: listaDedup };
    } catch (err) {
      console.error('Error al cargar condiciones comerciales:', err);
      if (typeof setCondiciones === 'function') setCondiciones(prev => Array.isArray(prev) ? prev : []);
      setFormaPago('');
      setCondicionSeleccionada('');
      setTipoCambio('');
      setDiasPago('');
      setDiasPagoExtra('');
      if (typeof condicionesCargadasRef !== 'undefined' && condicionesCargadasRef && 'current' in condicionesCargadasRef) {
        condicionesCargadasRef.current = true;
      }
      return { condicionDefault: null, listaCondiciones: [] };
    }
  };



  // Resumen de la cotización: totales, IVA, descuentos, etc.
  const resumen = useMemo(() => {
    let base21 = 0, base105 = 0;
    let totalDescuentos = 0;

    const safeNum = v => {
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : 0;
    };

    (Array.isArray(carrito) ? carrito : []).forEach(p => {
      const precio = safeNum(p.precio);
      const cantidad = safeNum(p.cantidad) || 1;
      const markup = safeNum(p.markup);
      const descuento = safeNum(p.descuento);
      const iva = safeNum(p.tasa_iva) || 21;

      totalDescuentos += descuento;
      const pf = precio * (1 + markup / 100);
      const base = Math.max(0, cantidad * pf - descuento);

      if (iva === 21) base21 += base;
      else if (iva === 10.5) base105 += base;
      else base21 += base;
    });

    const baseProd = base21 + base105;

    // Costo de envío original
    const envio = safeNum(costoEnvio);

    // Bonificación si el total supera 1500
    const envioBonificado = baseProd >= 1500;
    const envioFinal = envioBonificado ? 0 : envio;

    const iva21 = (base21 + envioFinal) * 0.21;
    const iva105 = base105 * 0.105;
    const baseImp = baseProd + envioFinal;
    const total = baseImp + iva21 + iva105;

    return {
      baseProd,
      envio: envioFinal,
      envioBonificado,
      baseImp,
      iva21,
      iva105,
      total,
      totalDescuentos
    };
  }, [carrito, costoEnvio]);
  console.log('Carrito actualizado:', carrito);

  const formatearProductosParaGuardar = (productos) => {
    return (productos || []).map(p => ({
      id_producto: p.id_producto || p.id,
      cantidad: Number(p.cantidad) || 1,
      precio_unitario: Number(p.precio_unitario ?? p.precio) || 0,
      descuento: Number(p.descuento) || 0,
      markup_ingresado: p.markup_ingresado !== undefined && p.markup_ingresado !== null
        ? Number(p.markup_ingresado)
        : null,
      tasa_iva: Number(p.tasa_iva) || 21
    }));
  };








  //ESTA FUNCION PARA COMPARTIR ❌
  const enviarCotizacionAlCliente = async (payloadEnviar, idCotizacion, token) => {
    try {
      const sendResp = await axios.put(`/api/cotizaciones/finalizar/${idCotizacion}`, payloadEnviar, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      });

      return { ok: true, data: sendResp.data };
    } catch (error) {
      console.error('Error al enviar la cotización:', error.response?.data || error.message || error);
      return {
        ok: false,
        error: error.response?.data?.error || error.response?.data?.message || 'No se pudo enviar la cotización'
      };
    }
  };










  //aca empiezan los handlers que se usan en los botones
  //son funciones que manejan eventos específicos en la interfaz de usuario.

  // Función para manejar la búsqueda de productos fuera del modal
  const handleBuscar = async () => {
    try {
      const res = await axios.get(`/api/productos/buscar-flex?query=${query}`);
      const productos = Array.isArray(res.data) ? res.data : res.data.productos || [];

      setProductosFiltrados(productos);
      setPaginaActual(1); // reinicia paginación
      setMostrarModal(true);
    } catch (err) {
      console.error('❌ Error al buscar productos:', err.message);
      setProductosFiltrados([]);
      setMostrarModal(true);
    }
  };


  const handleActualizarCotizacion = async () => {
    if (!idCotizacionActual) {
      setMensajeError('No hay cotización activa para actualizar');
      setMensajeExito('');
      return;
    }

    try {
      // resolver id_estado 'borrador' localmente si está disponible
      const idEstadoBorradorLocal = (typeof resolveEstadoId === 'function') ? resolveEstadoId('borrador') : null;

      // helpers locales
      const normalizarNumero = v => (v === null || v === undefined || v === '' ? null : Number(v));
      const normalizeMarkup = v => {
        if (v === null || v === undefined || v === '') return null;
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
      };

      // Construir payload (preferir buildPayload si existe)
      const payload = (typeof buildPayload === 'function')
        ? buildPayload(idEstadoBorradorLocal ?? 'borrador')
        : (() => {
          const productos = (Array.isArray(carrito) ? carrito : []).map(p => ({
            id_producto: normalizarNumero(p.id_producto ?? p.id ?? null),
            cantidad: normalizarNumero(p.cantidad) || 1,
            precio_unitario: Number(p.precio_unitario ?? p.precio) || 0,
            descuento: Number(p.descuento ?? 0) || 0,
            // PRIORIDAD: markup_ingresado (input) > markup (modelo) > null
            markup_ingresado: normalizeMarkup(p.markup_ingresado),
            tasa_iva: Number(p.tasa_iva ?? 21) || 21,
            part_number: p.part_number ?? p.partNumber ?? null,
            detalle: p.detalle ?? p.nombre ?? null,
            subtotal: Number(p.subtotal ?? ((Number(p.precio_unitario ?? p.precio ?? 0) - Number(p.descuento ?? 0)) * (p.cantidad || 1))) || 0,
            // si existe id_detalle local (temporal o real), mandarlo para ayudar al backend a casar
            id_detalle: p.id_detalle ?? null
          })).filter(x => Number.isFinite(x.id_producto));

          return {
            id_cliente: normalizarNumero(clienteSeleccionado ?? clienteObjeto?.id ?? cliente),
            id_contacto: contacto ? normalizarNumero(typeof contacto === 'object' ? contacto.id : contacto) : null,
            id_usuario: Number(usuarioActual?.id) || null,
            id_direccion_cliente: normalizarNumero(direccionIdSeleccionada),
            id_condicion: null,
            forma_pago: '',
            vigencia_hasta: (typeof toYYYYMMDD === 'function') ? toYYYYMMDD(vigenciaHasta) : (vigenciaHasta || null),
            observaciones: observaciones || '',
            plazo_entrega: plazoEntrega || '',
            costo_envio: normalizarNumero(costoEnvio) || 0,
            ...(idEstadoBorradorLocal ? { id_estado: idEstadoBorradorLocal } : {}),
            productos
          };
        })();

      // Prioridad diasPago select > diasPagoExtra input
      const diasUi = typeof diasPago === 'string' ? diasPago.trim() : (diasPago != null ? String(diasPago).trim() : '');
      const diasExtraUi = typeof diasPagoExtra === 'string' ? diasPagoExtra.trim() : (diasPagoExtra != null ? String(diasPagoExtra).trim() : '');
      const diasRaw = diasUi !== '' ? diasUi : (diasExtraUi !== '' ? diasExtraUi : null);
      const diasNum = diasRaw !== null ? Number(diasRaw) : null;
      payload.dias_pago = Number.isFinite(diasNum) ? diasNum : null;

      // Incluir id_condicion / forma_pago cuando corresponda
      if (condicionSeleccionada && typeof condicionSeleccionada === 'object' && (condicionSeleccionada.id || condicionSeleccionada.id === 0)) {
        payload.id_condicion = condicionSeleccionada.id;
        payload.forma_pago = condicionSeleccionada.forma_pago ?? '';
      } else if (condicionSeleccionada && typeof condicionSeleccionada === 'string') {
        payload.forma_pago = condicionSeleccionada;
      } else if (condicionSeleccionada && condicionSeleccionada.forma_pago) {
        payload.forma_pago = condicionSeleccionada.forma_pago;
      }

      // Logs de verificación antes de enviar
      console.log('➡️ payload actualizar (pre-check):', {
        idCotizacionActual,
        diasUi,
        diasExtraUi,
        diasPayload: payload.dias_pago,
        condicionSeleccionada,
        productosCount: Array.isArray(payload.productos) ? payload.productos.length : 0,
        payloadSample: (Array.isArray(payload.productos) && payload.productos.length) ? payload.productos.slice(0, 5) : []
      });

      // Validaciones mínimas
      if (!payload.id_cliente) {
        setMensajeError('Seleccioná un cliente válido antes de actualizar');
        setMensajeExito('');
        return;
      }
      if (!Array.isArray(payload.productos) || payload.productos.length === 0) {
        setMensajeError('El carrito está vacío');
        setMensajeExito('');
        return;
      }

      // Validación de markups por línea antes de enviar
      if (typeof validarAntesDeEnviar === 'function') {
        const ok = validarAntesDeEnviar();
        if (!ok) {
          console.log('⛔ Actualizar cancelado: validación previa falló');
          return;
        }
      }

      // Enviar actualización
      const res = await axios.put(
        `/api/cotizaciones/${idCotizacionActual}/actualizar`,
        payload,
        { withCredentials: true }
      );

      // Mensaje y estado
      setMensajeExito('Cotización actualizada correctamente');
      setMensajeError('');
      setEstadoCotizacion(res.data?.estado_nombre ?? res.data?.estado ?? (payload.id_estado ? String(payload.id_estado) : ''));

      setClienteObjeto(prev => ({
        ...prev,
        email: res.data?.cliente?.email ?? prev?.email ?? '',
        contacto_nombre: res.data?.cliente?.contacto_nombre ?? prev?.contacto_nombre ?? '',
        contacto_apellido: res.data?.cliente?.contacto_apellido ?? prev?.contacto_apellido ?? '',
        razon_social: res.data?.cliente?.razon_social ?? prev?.razon_social ?? '',
        cuit: res.data?.cliente?.cuit ?? prev?.cuit ?? ''
      }));


      console.log('✅ Actualizada:', idCotizacionActual, 'response:', res?.data);
      console.log('🧪 Backend cotizacion.productos:', res.data?.cotizacion?.productos ?? res.data?.productos ?? []);

      // Sincronizar carrito local con lo que devuelve el backend; si backend no devuelve productos, usar lo enviado
      const returnedCot = res.data?.cotizacion ?? res.data;

      const productosResp = (returnedCot?.productos || []).map(p => ({
        id_detalle: p.id_detalle ?? p.id_detalle ?? null,
        id_producto: p.id_producto ?? p.id,
        cantidad: p.cantidad ?? 1,
        precio_unitario: p.precio_unitario ?? p.precio ?? 0,
        descuento: p.descuento ?? 0,
        subtotal: p.subtotal ?? ((p.precio_unitario ?? p.precio ?? 0) - (p.descuento ?? 0)) * (p.cantidad ?? 1),
        markup_ingresado: p.markup_ingresado !== undefined && p.markup_ingresado !== null
          ? Number(p.markup_ingresado)
          : null,
        tasa_iva: p.tasa_iva ?? 21,
        part_number: p.part_number ?? p.partNumber ?? null,
        detalle: p.detalle ?? null,
        // decorativos (pueden venir vacíos del backend)
        marca: p.marca ?? '',
        categoria: p.categoria ?? '',
        subcategoria: p.subcategoria ?? ''
      }));

      // ✅ Enriquecer decorativos desde catálogo si faltan
      const productosRespEnriquecidos = productosResp.map(p => {
        const decorado = productosDisponibles?.find(prod =>
          Number(prod.id) === Number(p.id_producto)
        ) ?? {};

        return {
          ...p,
          marca: p.marca?.trim() || decorado.marca?.trim() || '',
          categoria: p.categoria?.trim() || decorado.categoria?.trim() || '',
          subcategoria: p.subcategoria?.trim() || decorado.subcategoria?.trim() || ''
        };
      });

      if (productosRespEnriquecidos.length) {
        // merge por id_detalle manteniendo campos locales no enviados (ej. inputs, flags)
        setCarrito(prev => {
          const prevArr = Array.isArray(prev) ? prev : [];
          const byDetalle = Object.fromEntries(productosRespEnriquecidos.filter(x => x.id_detalle).map(x => [String(x.id_detalle), x]));
          const byProdFirst = Object.fromEntries(productosRespEnriquecidos.map(x => [String(x.id_producto), x]));

          const merged = prevArr.map(old => {
            const oldDetalle = old.id_detalle ? String(old.id_detalle) : null;
            if (oldDetalle && byDetalle[oldDetalle]) {
              return { ...old, ...byDetalle[oldDetalle] };
            }
            const byProd = byProdFirst[String(old.id_producto)];
            if (byProd) return { ...old, ...byProd };
            return old;
          });

          const existingDetalleKeys = new Set(merged.map(m => String(m.id_detalle ?? '')));
          for (const p of productosRespEnriquecidos) {
            const key = String(p.id_detalle ?? '');
            if (key && !existingDetalleKeys.has(key)) {
              merged.push(p);
              existingDetalleKeys.add(key);
            }
          }

          return merged;
        });
      } else {
        // fallback: actualizar solo campos relevantes en prev sin reescribir todo
        setCarrito(prev => {
          const prevArr = Array.isArray(prev) ? prev : [];
          const bySent = Object.fromEntries((payload.productos || []).map(p => [String(p.id_producto), p]));
          return prevArr.map(old => {
            const sent = bySent[String(old.id_producto)];
            if (!sent) return old;
            return {
              ...old,
              cantidad: sent.cantidad ?? old.cantidad,
              precio_unitario: sent.precio_unitario ?? old.precio_unitario,
              descuento: sent.descuento ?? old.descuento,
              markup_ingresado: sent.markup_ingresado ?? old.markup_ingresado ?? null,
              subtotal: sent.subtotal ?? old.subtotal
            };
          });
        });
      }

      // limpiar errores de producto si existían
      setErroresProductos({});
      setMensajeError('');
    } catch (error) {
      console.error('Error al actualizar cotización:', error.response?.status, error.response?.data || error.message || error);

      const backendMsg = error.response?.data?.error || error.response?.data?.message || error.message || '';

      // Regex para detectar errores por producto
      const perProductRegex = /El markup del producto\s+([^\s)]+).*supera el máximo permitido/i;

      if (perProductRegex.test(backendMsg)) {
        const match = backendMsg.match(/El markup del producto\s+([^\s)]+)/i);
        const keyRaw = match ? match[1] : null;
        const key = keyRaw ? String(keyRaw) : null;

        setErroresProductos(prev => ({ ...(prev || {}), ...(key ? { [key]: backendMsg } : {}) }));

        setMensajeError(prev => {
          const prevCount = Object.keys((prev && typeof prev === 'object') ? prev : {}).length;
          const total = prevCount + (key ? 1 : 0);
          return `Hay ${total} producto(s) con valores fuera de rango`;
        });

        setMensajeExito('');
      } else {
        setMensajeError(backendMsg || 'No se pudo actualizar la cotización');
        setMensajeExito('');
      }
    } finally {
      // Log final para confirmar lo que se envió (intento seguro de reconstrucción)
      try {
        const payloadFinal = (typeof buildPayload === 'function') ? buildPayload('borrador') : null;
        console.log('🧪 Enviando productos formateados y dias (final check):', {
          productos: payloadFinal?.productos ?? (Array.isArray(carrito) ? carrito.slice(0, 5) : []),
          dias_pago: payloadFinal?.dias_pago ?? null,
          condicionSeleccionada
        });
      } catch (e) {
        console.log('🧪 Enviando productos formateados (no se pudo reconstruir payload final):', e);
      }
    }
  };

  // Cancelar creación o edición de cotización
  const handleCancelarCreacion = () => {
    // Acción sugerida: navegar al menú principal o limpiar el formulario
    navigate('/menu'); // o la ruta que corresponda
  };

  const handleCancelarEdicion = () => {
    // Acción sugerida: volver al listado de cotizaciones
    navigate('/menu'); // o la ruta que corresponda
  };



  // Finalizar cotización (botón Finalizar)
  // Finalizar cotización (botón Finalizar)
  // Guardar/Finalizar cotización. Param enviar = true => además la enviamos (cambia a pendiente)
  const handleFinalizarCotizacion = async () => {
    console.log({
      clienteSeleccionado,
      id_usuario: usuarioActual?.id,
      id_direccion_cliente: direccionIdSeleccionada,
      contacto,
      condicionSeleccionada,
      vencimiento,
      carritoLength: Array.isArray(carrito) ? carrito.length : 0
    });

    if (
      !clienteSeleccionado ||
      !usuarioActual?.id ||
      !direccionIdSeleccionada ||
      !contacto ||
      !condicionSeleccionada ||
      !vencimiento ||
      !carrito?.length
    ) {
      setMensajeError('Faltan datos obligatorios para finalizar la cotización');
      setMensajeExito('');
      return;
    }

    const hoy = new Date();
    hoy.setDate(hoy.getDate() + Number(vencimiento));
    const fechaVencimientoRaw = hoy.toISOString().slice(0, 10);
    const fechaVencimiento = (typeof toYYYYMMDD === 'function') ? toYYYYMMDD(fechaVencimientoRaw) : fechaVencimientoRaw;
    setVigenciaHasta(fechaVencimiento);

    const idEstadoBorradorLocal = (typeof resolveEstadoId === 'function') ? resolveEstadoId('borrador') : null;

    const payloadBorrador = (typeof buildPayload === 'function')
      ? buildPayload(idEstadoBorradorLocal ?? 'borrador', { vigencia_hasta: fechaVencimiento, vencimiento })
      : (() => {
        const normalizarNumero = v => (v === null || v === undefined || v === '' ? null : Number(v));

        const productos = (Array.isArray(carrito) ? carrito : []).map(p => ({
          id_producto: normalizarNumero(p.id_producto ?? p.id ?? null),
          cantidad: normalizarNumero(p.cantidad) || 1,
          precio_unitario: Number(p.precio_unitario ?? p.precio) || 0,
          descuento: Number(p.descuento ?? 0) || 0,
          markup_ingresado: (p.markup_ingresado !== null && p.markup_ingresado !== undefined)
            ? Number(p.markup_ingresado)
            : null,
          tasa_iva: Number(p.tasa_iva ?? 21) || 21,
          // ✅ decorativos
          detalle: p.detalle ?? p.nombre ?? '',
          marca: p.marca ?? '',
          categoria: p.categoria ?? '',
          subcategoria: p.subcategoria ?? ''
        })).filter(x => Number.isFinite(x.id_producto));

        const resolvedIdCond = normalizarNumero(getCondicionId(condicionSeleccionada)) || null;

        const basePayload = {
          id_cliente: normalizarNumero(clienteSeleccionado ?? clienteObjeto?.id ?? cliente),
          id_contacto: contacto ? normalizarNumero(typeof contacto === 'object' ? contacto.id : contacto) : null,
          id_usuario: Number(usuarioActual?.id) || null,
          id_direccion_cliente: normalizarNumero(direccionIdSeleccionada),
          id_condicion: resolvedIdCond,
          forma_pago: (condicionSeleccionada && typeof condicionSeleccionada === 'object')
            ? (condicionSeleccionada.forma_pago ?? '')
            : (String(condicionSeleccionada || '') || ''),
          vigencia_hasta: fechaVencimiento,
          observaciones: observaciones || '',
          plazo_entrega: plazoEntrega || '',
          costo_envio: Number(costoEnvio) || 0,
          productos
        };

        if (idEstadoBorradorLocal) basePayload.id_estado = idEstadoBorradorLocal;
        basePayload.vencimiento = Number.isFinite(Number(vencimiento)) ? Number(vencimiento) : null;
        return basePayload;
      })();

    console.log('📤 Payload borrador (pre-send):', payloadBorrador);

    if (typeof validarAntesDeEnviar === 'function') {
      const ok = validarAntesDeEnviar();
      if (!ok) {
        console.log('⛔ Finalizar cancelado: productos con markup fuera de rango');
        return;
      }
    }
    try {
      let respSave;


      if (idCotizacionActual) {
        respSave = await axios.put(`/api/cotizaciones/finalizar/${idCotizacionActual}`, payloadBorrador, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${usuarioActual?.token}` }
        });
        setIdCotizacionActual(idCotizacionActual);
      } else {
        respSave = await axios.post('/api/cotizaciones/iniciar', payloadBorrador, { withCredentials: true });
        const newId = respSave.data?.id_cotizacion ?? respSave.data?.id ?? null;
        setIdCotizacionActual(newId);
        if (newId) localStorage.setItem('idCotizacionActual', newId);
        setNumeroCotizacion(respSave.data?.numero_cotizacion ?? '');
      }

      setMensajeExito('Cotización guardada como borrador');
      setMensajeError('');
      setEstadoCotizacion(respSave?.data?.estado_nombre ?? respSave?.data?.estado ?? 'borrador');

      try {
        window.dispatchEvent(new CustomEvent('cotizacionActualizada', {
          detail: { id: idCotizacionActual ?? respSave?.data?.id_cotizacion ?? respSave?.data?.id }
        }));
      } catch (e) { /* noop */ }

      // ✅ Cabecera defensiva
      const cabecera = respSave?.data?.cabecera ?? {};

      // ✅ ID de dirección defensivo
      const direccionIdFinal = direccionIdSeleccionada
        ?? payloadBorrador.id_direccion_cliente
        ?? cabecera?.id_direccion_cliente
        ?? null;

      // ✅ Contacto y dirección desde clienteObjeto si están disponibles
      const contactoDesdeCliente = clienteObjeto?.contactos?.find(c => c.id === Number(contacto));
      const direccionDesdeCliente = clienteObjeto?.direcciones?.find(d => d.id === Number(direccionIdFinal));

      // ✅ Contacto desde contactosCliente como fallback
      const contactoSeleccionadoFinal = typeof contacto === 'object'
        ? contacto
        : contactosCliente?.find(c => c.id === Number(contacto));

      // ✅ Dirección desde direcciones como fallback
      const direccionSeleccionadaObj = direcciones?.find(d => d.id === Number(direccionIdFinal));

      // ✅ Carga defensiva de direccionesCliente si está vacío
      let direccionesClienteFinal = direccionesCliente;
      if ((!direccionesClienteFinal || !direccionesClienteFinal.length) && clienteObjeto?.id) {
        try {
          const { data } = await axios.get(`/api/clientes/${clienteObjeto.id}/direcciones`);
          if (Array.isArray(data)) {
            direccionesClienteFinal = data;
          }
        } catch (err) {
          console.error('Error al cargar direcciones del cliente:', err);
        }
      }

      // ✅ Dirección desde direccionesCliente como último recurso
      const direccionDesdeClienteObjeto = direccionesClienteFinal?.find(
        d => (d.id ?? d.id_direccion) === Number(direccionIdFinal)
      );

      // ✅ Resolución decorativa final (blindada)
      const contactoNombreFinal =
        typeof cabecera?.nombre_contacto === 'string' && cabecera.nombre_contacto.trim() !== ''
          ? cabecera.nombre_contacto
          : contactoDesdeCliente?.nombre_contacto
          ?? contactoSeleccionadoFinal?.nombre_contacto
          ?? (typeof contacto === 'string' ? contacto : '')
          ?? 'Sin contacto';

      const direccionTexto =
        typeof cabecera?.direccion_cliente === 'string' && cabecera.direccion_cliente.trim() !== ''
          ? cabecera.direccion_cliente
          : direccionDesdeCliente?.texto
          ?? direccionSeleccionadaObj?.texto
          ?? (direccionDesdeClienteObjeto
            ? `${direccionDesdeClienteObjeto.calle} ${direccionDesdeClienteObjeto.numeracion}${direccionDesdeClienteObjeto.piso ? ' piso ' + direccionDesdeClienteObjeto.piso : ''}${direccionDesdeClienteObjeto.depto ? ' depto ' + direccionDesdeClienteObjeto.depto : ''} – ${direccionDesdeClienteObjeto.localidad}, ${direccionDesdeClienteObjeto.provincia}`
            : 'Sin dirección');

      // ✅ Otros datos decorativos
      const fechaHoy = new Date().toISOString().slice(0, 10);
      const vendedor = `${usuarioActual?.nombre ?? ''} ${usuarioActual?.apellido ?? ''}`.trim() || 'Sin vendedor';
      const numeroCotizacionFinal =
        respSave?.data?.numero_cotizacion ?? cabecera?.numero_cotizacion ?? '';

      // ✅ Cliente para resumen
      const clienteResumen = {
        nombre: cabecera?.cliente_nombre ?? clienteObjeto?.razon_social ?? 'Sin nombre',
        contacto: contactoNombreFinal,
       contacto_apellido:
  respSave?.data?.cliente?.contacto_apellido ??
  cabecera?.contacto_apellido ??
  contactoDesdeCliente?.contacto_apellido ??
  contactoSeleccionadoFinal?.contacto_apellido ??
  (typeof contacto === 'object' ? contacto.contacto_apellido : '') ??
  '', 
        cuit: respSave?.data?.cliente?.cuit ?? clienteObjeto?.cuit ?? '',
        direccion: direccionTexto,
        fecha_emision: fechaHoy,
        vendedor,
        email: respSave?.data?.cliente?.email ?? clienteObjeto?.email ?? ''


      };

      // ✅ Productos enriquecidos
      const productosEnriquecidos = carrito.map(p => ({
        ...p,
        id_producto: p.id_producto ?? p.id,
        cantidad: p.cantidad,
        precio_unitario: p.precio_unitario ?? p.precio,
        descuento: p.descuento ?? 0,
        markup_ingresado: p.markup_ingresado ?? null,
        tasa_iva: p.tasa_iva ?? 21,
        detalle: p.detalle ?? p.nombre ?? '',
        marca: p.marca || '',
        categoria: p.categoria || '',
        subcategoria: p.subcategoria || ''
      }));

      console.log('🧪 direccionIdFinal:', direccionIdFinal);
      console.log('🧪 direccionDesdeClienteObjeto:', direccionDesdeClienteObjeto);
      console.log('clienteResumen:', clienteResumen);
      console.log('🧪 direccionesClienteFinal:', direccionesClienteFinal);
      console.log('🧪 dirección buscada:', direccionIdFinal);
      console.log('🧪 dirección encontrada:', direccionDesdeClienteObjeto);

      // ✅ Navegación con resumen completo
      navigate('/resumen-cotizacion', {
        state: {
          cotizacion: {
            ...payloadBorrador,
            productos: productosEnriquecidos,
            cliente: clienteResumen,
            forma_pago: cabecera?.forma_pago ?? payloadBorrador.forma_pago ?? '-',
            vigencia_hasta: payloadBorrador.vigencia_hasta || cabecera?.vigencia_hasta || '-',
            id_cotizacion: idCotizacionActual ?? respSave?.data?.id_cotizacion ?? respSave?.data?.id,
            numero_cotizacion: numeroCotizacionFinal
          }
        }
      });

    } catch (error) {
      console.error('Error al finalizar cotización:', error.response?.data || error.message || error);

      const backendMsg = error.response?.data?.error || error.response?.data?.message || error.message || '';
      const perProductRegex = /El markup del producto\s+([^\s)]+).*supera el máximo permitido/i;

      if (perProductRegex.test(backendMsg)) {
        const match = backendMsg.match(/El markup del producto\s+([^\s)]+)/i);
        const keyRaw = match ? match[1] : null;
        const key = keyRaw ? String(keyRaw) : null;

        setErroresProductos(prev => ({ ...(prev || {}), ...(key ? { [key]: backendMsg } : {}) }));

        setMensajeError(prev => {
          const prevCount = Object.keys((prev && typeof prev === 'object') ? prev : {}).length;
          const total = prevCount + (key ? 1 : 0);
          return `Hay ${total} producto(s) con valores fuera de rango`;
        });

        setMensajeExito('');
      } else {
        setMensajeError(backendMsg || 'No se pudo finalizar la cotización');
        setMensajeExito('');
      }
    }

  };


  // Guardar cotización como borrador
  // Guardar cotización como borrador
  const handleGuardarBorrador = async () => {
    const normalizarNumero = v => (v === null || v === undefined || v === '' ? null : Number(v));

    const normalizarProducto = p => ({
      id_producto: normalizarNumero(p.id_producto ?? p.id),
      cantidad: normalizarNumero(p.cantidad) || 1,
      precio_unitario: Number(p.precio_unitario ?? p.precio) || 0,
      descuento: Number(p.descuento ?? 0) || 0,
      markup_ingresado: (p.markup_ingresado !== null && p.markup_ingresado !== undefined)
        ? Number(p.markup_ingresado)
        : null,
      tasa_iva: Number(p.tasa_iva ?? 21) || 21,
      // ✅ decorativos
      detalle: p.detalle ?? p.nombre ?? '',
      marca: p.marca ?? '',
      categoria: p.categoria ?? '',
      subcategoria: p.subcategoria ?? ''
    });

    if (!usuarioActual?.id) {
      setMensajeError('No se pudo identificar al vendedor');
      setMensajeExito('');
      return;
    }

    let idCondFinal = normalizarNumero(getCondicionId(condicionSeleccionada));
    let formaFinal = typeof condicionSeleccionada === 'object'
      ? (condicionSeleccionada.forma_pago ?? condicionSeleccionada.nombre ?? '').toString().trim()
      : (String(condicionSeleccionada || '')).trim();

    if (!idCondFinal && typeof condicionSeleccionada === 'string' && Array.isArray(condiciones) && condiciones.length > 0) {
      const buscar = formaFinal.toLowerCase();
      const byName = condiciones.find(c => ((c.forma_pago ?? c.nombre) + '').toString().trim().toLowerCase() === buscar);
      if (byName) {
        idCondFinal = normalizarNumero(byName.id);
        formaFinal = (byName.forma_pago ?? byName.nombre ?? '').toString().trim();
        setCondicionSeleccionada({ id: idCondFinal, forma_pago: formaFinal });
      }
    }

    const carritoLocal = Array.isArray(carrito) ? carrito : [];
    const productos = carritoLocal.map(normalizarProducto).filter(p => Number.isFinite(p.id_producto));

    const diasStrSelect = typeof diasPago === 'string' ? diasPago.trim() : (diasPago != null ? String(diasPago).trim() : '');
    const diasStrExtra = typeof diasPagoExtra === 'string' ? diasPagoExtra.trim() : (diasPagoExtra != null ? String(diasPagoExtra).trim() : '');
    const diasFinalRaw = diasStrSelect && diasStrSelect !== '' ? diasStrSelect
      : (diasStrExtra && diasStrExtra !== '' ? diasStrExtra : null);
    const diasFinalNum = diasFinalRaw !== null ? Number(diasFinalRaw) : null;
    const diasPagoPayload = Number.isFinite(diasFinalNum) ? diasFinalNum : null;

    const vigenciaNormalized = (typeof toYYYYMMDD === 'function') ? toYYYYMMDD(vigenciaHasta) : (vigenciaHasta || null);
    const idEstadoBorradorLocal = (typeof resolveEstadoId === 'function') ? resolveEstadoId('borrador') : null;

    const payload = (typeof buildPayload === 'function')
      ? buildPayload(idEstadoBorradorLocal ?? 'borrador', { dias_pago: diasPagoPayload, vigencia_hasta: vigenciaNormalized })
      : {
        id_cliente: normalizarNumero(clienteSeleccionado ?? clienteObjeto?.id ?? cliente),
        id_contacto: contacto ? normalizarNumero(typeof contacto === 'object' ? contacto.id : contacto) : null,
        id_usuario: normalizarNumero(usuarioActual?.id),
        id_direccion_cliente: normalizarNumero(direccionIdSeleccionada),
        id_condicion: idCondFinal || null,
        forma_pago: formaFinal || '',
        vigencia_hasta: vigenciaNormalized || null,
        observaciones: observaciones || '',
        plazo_entrega: plazoEntrega || '',
        costo_envio: normalizarNumero(costoEnvio) || 0,
        ...(idEstadoBorradorLocal ? { id_estado: idEstadoBorradorLocal } : {}),
        productos: productos.map(p => ({
          ...p,
          markup_ingresado: (p.markup_ingresado !== null && p.markup_ingresado !== undefined)
            ? Number(p.markup_ingresado)
            : null
        })),
        dias_pago: diasPagoPayload
      };

    console.log('➡️ payload a enviar (borrador):', payload);
    console.log('debug estados: condicionSeleccionada (raw):', condicionSeleccionada, '-> resolved id:', idCondFinal, 'condiciones:', condiciones);
    console.log('debug dias: diasPago (select) =', diasStrSelect, 'diasPagoExtra (input) =', diasStrExtra, '-> payload.dias_pago =', diasPagoPayload);

    if (!payload.id_cliente) {
      setMensajeError('Debés seleccionar un cliente válido antes de guardar la cotización');
      setMensajeExito('');
      return;
    }
    if (!payload.id_direccion_cliente) {
      setMensajeError('Debés seleccionar una dirección del cliente antes de guardar la cotización');
      setMensajeExito('');
      return;
    }
    if (!payload.productos || payload.productos.length === 0) {
      setMensajeError('La cotización debe tener al menos un producto');
      setMensajeExito('');
      return;
    }

    if (typeof validarAntesDeEnviar === 'function') {
      const ok = validarAntesDeEnviar();
      if (!ok) return;
    }

    try {
      if (idCotizacionActual) {
        const resp = await axios.put(
          `/api/cotizaciones/${idCotizacionActual}/actualizar`,
          payload,
          { withCredentials: true }
        );
        setMensajeExito('Cotización actualizada como borrador');
        setEstadoCotizacion(resp.data?.estado_nombre ?? resp.data?.estado ?? (payload.id_estado ? String(payload.id_estado) : ''));
        console.log('✅ Borrador actualizado:', idCotizacionActual);
      } else {
        const res = await axios.post(
          '/api/cotizaciones/iniciar',
          payload,
          { withCredentials: true }
        );

        const idResp = res.data?.id_cotizacion ?? res.data?.id ?? null;
        setIdCotizacionActual(idResp);
        if (idResp) localStorage.setItem('idCotizacionActual', idResp);

        setNumeroCotizacion(res.data?.numero_cotizacion ?? '');
        setEstadoCotizacion(
          res.data?.estado_nombre ??
          res.data?.estado ??
          (payload.id_estado ? String(payload.id_estado) : '')
        );

        // ✅ Guardar email del contacto en clienteObjeto
        setClienteObjeto(prev => ({
          ...prev,
          email: res.data?.cliente?.email ?? prev?.email ?? ''
        }));

        setMensajeExito('Cotización guardada como borrador');
        console.log('✅ Borrador creado:', res.data);
      }


      setMensajeError('');
    } catch (error) {
      console.error('Error al guardar borrador:', error.response?.data || error.message || error);

      const backendMsg = error.response?.data?.error || error.response?.data?.message || error.message || '';
      const perProductRegex = /El markup del producto\s+([^\s)]+).*supera el máximo permitido/i;

      if (perProductRegex.test(backendMsg)) {
        const match = backendMsg.match(/El markup del producto\s+([^\s)]+)/i);
        const keyRaw = match ? match[1] : null;
        const key = keyRaw ? String(keyRaw) : null;

        setErroresProductos(prev => ({ ...(prev || {}), ...(key ? { [key]: backendMsg } : {}) }));
        setMensajeError(prev => {
          const prevCount = Object.keys((prev && typeof prev === 'object') ? prev : {}).length;
          const total = prevCount + (key ? 1 : 0);
          return `Hay ${total} producto(s) con valores fuera de rango`;
        });
        setMensajeExito('');
      } else {
        setMensajeError(backendMsg || 'No se pudo guardar la cotización');
        setMensajeExito('');
      }
    }
  };


  return (

    <div className="bg-light d-flex flex-column min-vh-100">


      <main className="flex-grow-1">
        <div className="container my-4">
          <h1 className="mb-3"><i className="bi bi-receipt text-primary"></i> Nueva cotización</h1>
          {retomando && (
            <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
              Retomando cotización en borrador...
            </div>
          )}

          {/* Botón para volver a mis cotizaciones */}
          <div className="mb-3">
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate('/menu')}
            >
              ← Volver a mis cotizaciones
            </button>
          </div>
        </div>

        {/* Cliente */}
        <div className="card card-soft mb-3">
          <div className="card-body p-3">
            <h5 className="section-title"><i className="bi bi-person-badge"></i> Cliente</h5>
            <div className="row g-3">

              {/* Input de búsqueda */}
              <div className="col-md-6 buscador-cliente-container">
                <label className="form-label">Cliente / CUIT</label>

                {clienteObjeto ? (
                  <div className="form-control bg-light">
                    {clienteObjeto.razon_social} – CUIT: {clienteObjeto.cuit}
                  </div>
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar cliente por nombre o CUIT"
                    value={busquedaCliente}
                    onChange={(e) => setBusquedaCliente(e.target.value)}
                  />
                )}

                {!clienteObjeto && sugerencias.length > 0 && (
                  <ul className="sugerencias-lista">
                    {sugerencias.map((c) => (
                      <li
                        key={c.id}
                        className="sugerencia-item"
                        onClick={() => {
                          setClienteSeleccionado(c.id);
                          setCliente(c.id);
                          setClienteObjeto(c);
                          setBusquedaCliente(`${c.razon_social} – CUIT: ${c.cuit}`);
                          setSugerencias([]);

                          axios.get(`/api/clientes/${c.id}/contactos`)
                            .then(({ data }) => {
                              const lista = Array.isArray(data) ? data : [];
                              setContactosCliente(lista);

                              const contactoPreservado = lista.find(ct => ct.id === contacto);
                              setContacto(contactoPreservado?.id || '');
                            })
                            .catch(err => {
                              console.error('Error al cargar contactos del cliente', err);
                              setContactosCliente([]);
                              setContacto('');
                            });
                        }}
                      >
                        {c.razon_social} – CUIT: {c.cuit}
                      </li>
                    ))}
                  </ul>
                )}
              </div>


              {/* Contacto */}
              <div className="col-md-6">
                <label className="form-label">Contacto</label>
                <select
                  className="form-select"
                  value={contacto}
                  onChange={(e) => setContacto(e.target.value)}
                  disabled={contactosCliente.length === 0}
                >
                  <option value="">Seleccionar contacto...</option>
                  {contactosCliente.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre_contacto} {c.apellido}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>





          {/* modalidad de emtrega */}
          <div className="row g-3 mt-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label">Modalidad</label>
              <select
                className="form-select"
                value={modalidadEntrega}
                onChange={(e) => {
                  const value = e.target.value;
                  setModalidadEntrega(value);
                  if (value === 'Retiro') {
                    setDireccionIdSeleccionada('');
                    setCostoEnvio('0');
                  }
                }}
              >
                <option value="Envío">Envío</option>
                <option value="Retiro">Retiro</option>
              </select>
            </div>



            {/* Dirección */}
            <div className="col-md-3">
              <label className="form-label">Dirección</label>
              <select
                className="form-select"
                value={direccionIdSeleccionada}
                onChange={(e) => setDireccionIdSeleccionada(e.target.value)}
                disabled={modalidadEntrega === 'Retiro'}
              >
                <option value="">Seleccionar...</option>
                {direccionesCliente.map(d => (
                  <option key={d.id_direccion} value={d.id_direccion}>
                    {d.locacion} – {d.localidad}, {d.provincia}
                  </option>
                ))}
              </select>
            </div>




            {/* Costo de envío */}
            <div className="col-md-4">
              <label className="form-label">Costo de envío</label>
              <input
                type="text"
                className="form-control"
                value={costoEnvio !== null
                  ? `${zonaEnvio} - US$ ${costoEnvio}`
                  : 'No disponible'
                }
                disabled
              />
            </div>



            {/* Bonificable */}
            <div className="col-md-2">
              <div className="form-check mt-4">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="bonificableCheck"
                  checked={resumen.envioBonificado}
                  disabled
                />
                <label className="form-check-label" htmlFor="bonificableCheck">
                  Bonificable
                </label>
              </div>
            </div>


          </div>







          {/* Condiciones Comerciales */}
          <div className="card card-soft mb-3">
            <div className="card-body">
              <h5 className="section-title"><i className="bi bi-credit-card-2-front"></i> Condiciones Comerciales</h5>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Forma de pago</label>
                  {/* Select construido desde condiciones cargadas */}

                  <select
                    className="form-select"
                    value={condicionSeleccionada && condicionSeleccionada.id ? String(condicionSeleccionada.id) : (condicionSeleccionada && condicionSeleccionada.forma_pago ? '__custom_sel' : '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        setCondicionSeleccionada('');
                        setFormaPago('');
                        return;
                      }
                      if (val === '__custom_sel') return;

                      const seleccionado = Array.isArray(condiciones) ? condiciones.find(c => Number(c.id) === Number(val)) : undefined;

                      if (seleccionado) {
                        const forma = String(seleccionado.forma_pago ?? seleccionado.nombre ?? '').trim();
                        setCondicionSeleccionada({ id: seleccionado.id, forma_pago: forma });
                        setFormaPago(forma);

                        if (seleccionado.dias_pago !== undefined && seleccionado.dias_pago !== null) {
                          const diasStr = String(seleccionado.dias_pago ?? '').trim();
                          if (typeof setDiasPendiente === 'function') {
                            setDiasPendiente(diasStr);
                          } else {
                            const opciones = Array.isArray(opcionesDiasPago) ? opcionesDiasPago.map(x => String(x ?? '').trim()) : [];
                            if (diasStr && opciones.includes(diasStr)) { setDiasPago(diasStr); setDiasPagoExtra(''); }
                            else if (diasStr) { setDiasPago(''); setDiasPagoExtra(diasStr); }
                            diasResueltoRef.current = true;
                          }
                        }
                      } else {
                        const text = e.target.options[e.target.selectedIndex]?.text ?? '';
                        setCondicionSeleccionada({ id: null, forma_pago: String(text).trim() });
                        setFormaPago(String(text).trim());
                        // NO tocar dias aquí
                      }
                    }}
                  >
                    <option value="">Seleccioná...</option>

                    {Array.isArray(condiciones) && condiciones.length > 0
                      ? condiciones.map(c => (
                        <option key={c.id} value={String(c.id)}>
                          {String(c.forma_pago ?? c.nombre ?? '').trim()}
                        </option>
                      ))
                      : null
                    }

                    {condicionSeleccionada && (condicionSeleccionada.id === null || condicionSeleccionada.id === undefined) && condicionSeleccionada.forma_pago ? (
                      <option key="__custom_sel" value="__custom_sel" disabled>
                        {String(condicionSeleccionada.forma_pago).trim()}
                      </option>
                    ) : null}
                  </select>


                  <div className="d-flex flex-wrap gap-3 mb-3">
                    {/* Plazo de entrega */}
                    <div className="flex-grow-1">
                      <label htmlFor="plazoEntrega" className="form-label">Plazo de entrega</label>
                      <input
                        type="text"
                        className="form-control"
                        id="plazoEntrega"
                        value={plazoEntrega}
                        onChange={(e) => setPlazoEntrega(e.target.value)}
                        placeholder="Ej: 7 días hábiles"
                      />
                    </div>

                    {/* Vencimiento */}
                    <div style={{ width: '180px' }}>
                      <label htmlFor="vencimiento" className="form-label">Vencimiento (días)</label>
                      <input
                        type="number"
                        className="form-control"
                        id="vencimiento"
                        value={vencimiento}
                        onChange={(e) => {
                          const dias = Number(e.target.value);
                          setVencimiento(dias);
                          if (dias > 0) {
                            const hoy = new Date();
                            hoy.setDate(hoy.getDate() + dias);
                            const fechaCalculada = hoy.toISOString().slice(0, 10);
                            setVigenciaHasta(fechaCalculada);
                          } else {
                            setVigenciaHasta('');
                          }
                        }}
                        min={1}
                        placeholder="Ej: 15"
                      />

                      {/* Mostrar fecha calculada */}
                      {vigenciaHasta && (
                        <div className="text-muted small mt-1">
                          Fecha estimada de vencimiento: <strong>{vigenciaHasta}</strong>
                        </div>
                      )}
                    </div>


                  </div>




                </div>



                {/*Tipo de cambio */}
                <div className="col-md-4">
                  <label className="form-label">Tipo de cambio</label>
                  <input
                    type="text"
                    className="form-control"
                    value={tipoCambio}
                    readOnly
                    tabIndex={-1} // opcional: evita que el usuario lo enfoque con Tab
                  />
                </div>

                {/*Plazo de pago */}
                <div className="col-md-4">
                  <label className="form-label">Plazo de pago</label>
                  <div className="input-group">
                    <select
                      className="form-select"
                      value={String(diasPago ?? '')}
                      onChange={(e) => {
                        const val = String(e.target.value || '').trim();
                        userInteractedRef.current = true;
                        diasResueltoRef.current = true;


                        setDiasPago(val);
                        setDiasPagoExtra('');
                      }}
                    >
                      <option value="">Seleccioná...</option>
                      {Array.isArray(opcionesDiasPago) && opcionesDiasPago.map((opcion, idx) => (
                        <option key={idx} value={String(opcion).trim()}>
                          {String(opcion).trim()}
                        </option>
                      ))}
                    </select>



                    {/* Mostrar campo extra solo si el valor actual no está en el select */}
                    {/* campo extra como text para manejo de string/trim (puedes volver a number en producción) */}
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Otro valor"
                      value={String(diasPagoExtra ?? '')}
                      onChange={(e) => {
                        const val = String(e.target.value || '').trim();
                        console.log('ONCHANGE extra ->', val);
                        setDiasPagoExtra(val);
                        setDiasPago('');
                      }}
                    />
                  </div>



                  {/*observaciones */}
                  <div className="mb-3">
                    <label htmlFor="observaciones" className="form-label">Observaciones</label>
                    <input
                      type="text"
                      id="observaciones"
                      className="form-control"
                      placeholder="Escribí una nota breve si lo necesitás"
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      maxLength={300}
                    />
                  </div>




                </div>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="card card-soft">
            <div className="card-body">
              <h5 className="section-title"><i className="bi bi-box-seam"></i> Productos</h5>

              <div className="d-flex gap-2 mb-3">
                {/* 🔍 Input de búsqueda */}
                <input
                  type="text"
                  className="form-control"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar producto por nombre, marca, categoría..."
                />

                {/* 🔎 Botón Buscar */}
                <button className="btn btn-primary" onClick={handleBuscar}>
                  Buscar
                </button>

                {/* 📦 Botón Productos */}
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setProductosFiltrados([]);
                    setPaginaActual(1);
                    setMostrarModal(true);
                  }}
                >
                  Productos
                </button>
              </div>



              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Part #</th>
                      <th>Detalle</th>
                      <th>Cant.</th>
                      <th>Precio</th>
                      <th>Mark-up %</th>
                      <th>Precio+MU</th>
                      <th>Desc. $</th>
                      <th>Base</th>
                      <th>IVA</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>


                    {carrito.map((p, i) => {
                      const precioFinal = num(p.precio) * (1 + num(p.markup_ingresado) / 100);
                      const baseLinea = Math.max(0, (num(p.cantidad) || 1) * precioFinal - num(p.descuento));

                      return (
                        <tr key={p.id}>
                          <td>{p.part_number}</td>
                          <td>{p.detalle}</td>

                          {/* Cantidad editable */}
                          <td>
                            <input
                              type="number"
                              min="1"
                              max={p.stock}
                              value={p.cantidad}
                              className="form-control form-control-sm"
                              onChange={(e) => {
                                const v = Math.min(Math.max(1, (typeof num === 'function' ? num(e.target.value) : Number(e.target.value) || 1)), Number(p.stock || Infinity));
                                const nuevo = [...carrito];
                                nuevo[i] = { ...nuevo[i], cantidad: v };
                                setCarrito(nuevo);

                                if (typeof userInteractedRef !== 'undefined' && userInteractedRef) userInteractedRef.current = true;

                                const productKey = String(getProductKey(nuevo[i], i));
                                console.log('DEBUG cantidad onChange -> key:', productKey, 'cantidad:', v);

                                if (typeof recalcTotals === 'function') recalcTotals(nuevo);
                              }}
                            />
                          </td>

                          {/* Precio NO editable */}
                          <td>{Number(p.precio || 0).toFixed(2)}</td>



                          {/* Margen editable */}
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"

                              min="0"
                              value={p.markup_ingresado ?? ''}
                              onChange={(e) => {
                                const nuevo = [...carrito];
                                const nuevoMarkup = Math.max(0, num(e.target.value));
                                nuevo[i] = {
                                  ...nuevo[i],
                                  markup_ingresado: e.target.value === '' ? null : nuevoMarkup
                                };
                                setCarrito(nuevo);

                                if (userInteractedRef?.current !== undefined) userInteractedRef.current = true;

                                const productKey = String(getProductKey(nuevo[i], i));
                                console.log('DEBUG validate call -> key:', productKey, 'nuevoMarkup:', nuevoMarkup);
                                validateMarkupForProduct(productKey, nuevoMarkup);
                              }}
                            />

                            {/* Mostrar error INLINE usando la misma clave */}
                            {(() => {
                              const productKey = String(getProductKey(p, i));
                              return erroresProductos && erroresProductos[productKey] ? (
                                <div className="text-danger small mt-1" role="alert" aria-live="polite">
                                  {erroresProductos[productKey]}
                                </div>
                              ) : null;
                            })()}
                          </td>

                          {/* Precio final */}
                          <td>{Number(precioFinal || 0).toFixed(2)}</td>

                          {/* Descuento editable */}
                          <td>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={Number(p.descuento || 0)}
                              className="form-control form-control-sm"
                              onChange={(e) => {
                                const nuevo = [...carrito];
                                const descuento = Math.max(0, (typeof num === 'function' ? num(e.target.value) : Number(e.target.value) || 0));
                                nuevo[i] = { ...nuevo[i], descuento };
                                setCarrito(nuevo);

                                if (typeof userInteractedRef !== 'undefined' && userInteractedRef) userInteractedRef.current = true;

                                const productKey = String(getProductKey(nuevo[i], i));
                                console.log('DEBUG descuento onChange -> key:', productKey, 'descuento:', descuento);

                                if (typeof recalcTotals === 'function') recalcTotals(nuevo);
                              }}
                            />
                          </td>

                          {/* Base */}
                          <td>{Number(baseLinea || 0).toFixed(2)}</td>

                          {/* IVA NO editable */}
                          <td>{Number(p.tasa_iva ?? 0)}%</td>

                          {/* Eliminar */}
                          <td className="text-center">
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                if (window.confirm('¿Eliminar este ítem del carrito?')) {
                                  const nuevo = [...carrito];
                                  nuevo.splice(i, 1);
                                  setCarrito(nuevo);
                                }
                              }}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })}





                  </tbody>
                </table>
              </div>
            </div>
          </div>


          {/* Resumen: calcula totales y muestra */}
<div className="card card-soft mt-3 summary-panel">
  <div className="card-body p-3">
    <h6 className="section-title mb-2">Resumen</h6>

    {resumen.envioBonificado && (
      <div className="alert alert-success py-1 px-2 mb-2 text-center">
        ¡Envío bonificado por superar los US$ 1500!
      </div>
    )}

    <table className="table table-sm mb-0 totales-table">
      <tbody>
        <tr>
          <th className="text-muted fw-normal">Subtotal productos</th>
          <td className="text-end fw-semibold">US$ {resumen.baseProd.toFixed(2)}</td>
        </tr>

        <tr>
          <th className="text-muted fw-normal">Costo de envío</th>
          <td className="text-end fw-semibold">US$ {resumen.envio.toFixed(2)}</td>
        </tr>

        <tr>
          <th className="text-muted fw-normal">Base imponible</th>
          <td className="text-end fw-semibold">US$ {resumen.baseImp.toFixed(2)}</td>
        </tr>

        <tr>
          <th className="text-muted fw-normal">IVA 21% {resumen.envio > 0 ? '(incluye envío)' : ''}</th>
          <td className="text-end fw-semibold">US$ {resumen.iva21.toFixed(2)}</td>
        </tr>

        {resumen.iva105 > 0 && (
          <tr>
            <th className="text-muted fw-normal">IVA 10.5%</th>
            <td className="text-end fw-semibold">US$ {resumen.iva105.toFixed(2)}</td>
          </tr>
        )}

        {resumen.totalDescuentos > 0 && (
          <tr>
            <th className="text-muted fw-normal">Descuento total aplicado</th>
            <td className="text-end fw-semibold">US$ {resumen.totalDescuentos.toFixed(2)}</td>
          </tr>
        )}

        <tr className="total-row">
          <th className="text-uppercase">Total</th>
          <td className="text-end">
            <strong>US$ {resumen.total.toFixed(2)}</strong>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>



          {/* Acciones / Guardar, Finalizar, Enviar, Cancelar */}
          <div className="d-flex justify-content-between align-items-center my-3 flex-wrap gap-2">
            {idCotizacionActual ? (
              <>
                {/* Cancelar edición */}
                <button className="btn btn-sm btn-outline-danger" onClick={handleCancelarEdicion}>
                  <i className="bi bi-x-circle me-1"></i> Cancelar edición
                </button>

                {/* Botones centrales: Actualizar + Finalizar */}
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-warning" onClick={handleActualizarCotizacion}>
                    <i className="bi bi-pencil-square me-1"></i> Actualizar
                  </button>

                  <button className="btn btn-sm btn-outline-primary" onClick={() => handleFinalizarCotizacion(false)}>
                    <i className="bi bi-check2-circle me-1"></i> Finalizar
                  </button>
                </div>


              </>
            ) : (
              <>
                {/* Cancelar creación */}
                <button className="btn btn-sm btn-outline-danger" onClick={handleCancelarCreacion}>
                  <i className="bi bi-x-circle me-1"></i> Cancelar cotización
                </button>

                {/* Botones centrales: Guardar + Finalizar */}
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-secondary" onClick={handleGuardarBorrador}>
                    <i className="bi bi-save me-1"></i> Guardar borrador
                  </button>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => handleFinalizarCotizacion(false)}>
                    <i className="bi bi-check2-circle me-1"></i> Finalizar
                  </button>
                </div>


              </>
            )}

            {/* Mensajes de estado */}
            <div className="w-100 mt-2">
              {mensajeExito && (
                <div className="text-success small">
                  <i className="bi bi-check-circle me-1"></i> {mensajeExito}
                </div>
              )}
              {mensajeError && (
                <div className="text-danger small">
                  <i className="bi bi-exclamation-triangle me-1"></i> {mensajeError}
                </div>
              )}
            </div>
          </div>




        </div>
      </main>

      {mostrarModal && (
        <div
          className={`modal-backdrop-custom ${mostrarModal ? 'fade-in' : ocultarModal ? 'fade-out' : 'd-none'}`}
        >
          <div className="modal-dialog-custom">
            <div className="modal-box">
              <div className="modal-header">
                <h5 className="modal-title"><i className="bi bi-box"></i> Selección de productos</h5>
                <button className="btn-close" onClick={cerrarModalConTransicion}></button>
              </div>


              <div className="modal-body">
                {productosFiltrados.length === 0 && productosDisponibles.length === 0 ? (
                  <div className="alert alert-warning text-center">
                    No se encontraron productos para mostrar.
                  </div>
                ) : (
                  <div className="list-group">
                    {(productosFiltrados.length > 0 ? productosFiltrados : productosDisponibles)
                      .slice(indexInicio, indexFin)
                      .map(p => (
                        <div key={p.id} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>{p.detalle}</strong><br />
                              <small className="text-muted">
                                {p.part_number} · {p.marca} · ${p.precio}  · IVA {p.tasa_iva}%
                              </small>
                            </div>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => agregarAlCarritoDesdeModal(p)}
                            >
                              Seleccionar
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* Paginación */}
                <div className="d-flex justify-content-center mt-3">
                  <button
                    className="btn btn-outline-secondary me-2"
                    disabled={paginaActual === 1}
                    onClick={() => setPaginaActual(p => p - 1)}
                  >
                    ←
                  </button>
                  <span>Página {paginaActual}</span>
                  <button
                    className="btn btn-outline-secondary ms-2"
                    disabled={
                      (productosFiltrados.length > 0 ? productosFiltrados.length : productosDisponibles.length) <= indexFin
                    }
                    onClick={() => setPaginaActual(p => p + 1)}
                  >
                    →
                  </button>
                </div>
              </div>


              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={cerrarModalConTransicion}>Cerrar</button>

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};



export default NuevaCotizacion;