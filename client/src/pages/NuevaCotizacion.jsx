import React, { useEffect, useState } from 'react';
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



  // Otros estados como mpstrar modal, año, productos, etc.
  const [yearActual, setYearActual] = useState(new Date().getFullYear());
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [seleccionModal, setSeleccionModal] = useState({});
  const [condicionesComerciales, setCondicionesComerciales] = useState([]);
  const [opcionesDiasPago, setOpcionesDiasPago] = useState([]);

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

  // Determina si estamos en modo edición (retomar cotización existente)
  const modoEdicion = Boolean(idCotizacionActual);

  // Obtener el usuario actual desde el contexto
  const { usuario: usuarioActual } = useUser();
  const idVendedor = usuarioActual.id_vendedor;







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
        markup: p.markup ?? 0,
        descuento: p.descuento ?? 0,
        precio: num(p.precio) || 0,
        tasa_iva: num(p.tasa_iva) || 21
      }));
      setCarrito(formateados);
      setProductosSeleccionados(formateados);
    } else {
      const guardados = localStorage.getItem('productosParaCotizar');
      if (guardados) {
        try {
          const productos = JSON.parse(guardados);
          const formateados = productos.map(p => ({
            ...p,
            cantidad: 1,
            markup: 0,
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
      markup: 0,
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
      markup: 0,
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



// 👇 Helper para convertir nombre a ID
const getCondicionId = (nombreCondicion) => {
  const condicion = condiciones.find(c => c.nombre === nombreCondicion);
  return condicion?.id || null;
};





  const cargarCotizacionExistente = async (id) => {
    try {
      const res = await axios.get(`/api/cotizaciones/borrador/retomar/${id}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      console.log('Respuesta completa de cotización:', res.data);
      const { cabecera, productos } = res.data;

      if (!cabecera?.id_cliente) {
        console.error('❌ cabecera.id_cliente está vacío o undefined');
        return;
      }

      // Setear cliente
      setClienteSeleccionado(cabecera.id_cliente);

      // Buscar cliente en la lista o construirlo desde cabecera
      let clienteEncontrado = clientesDisponibles.find(c => c.id === cabecera.id_cliente);

      if (!clienteEncontrado && cabecera.razon_social && cabecera.cuit) {
        clienteEncontrado = {
          id: cabecera.id_cliente,
          razon_social: cabecera.razon_social.trim(),
          cuit: cabecera.cuit.trim()
        };

        // Agregar cliente si no está en la lista
        setClientesDisponibles(prev => {
          const yaExiste = prev.some(c => c.id === clienteEncontrado.id);
          return yaExiste ? prev : [...prev, clienteEncontrado];
        });
      }

      setClienteObjeto(clienteEncontrado);
      setBusquedaCliente(`${clienteEncontrado?.razon_social} – CUIT: ${clienteEncontrado?.cuit}`);

      // Cargar contactos
      try {
        const contactosRes = await axios.get(`/api/clientes/${cabecera.id_cliente}/contactos`);
        const listaContactos = Array.isArray(contactosRes.data) ? contactosRes.data : [];
        setContactosCliente(listaContactos);

        const contactoEncontrado = listaContactos.find(c => c.id === cabecera.id_contacto);
        setContacto(contactoEncontrado?.id || '');
      } catch (err) {
        console.error('Error al cargar contactos del cliente', err);
        setContactosCliente([]);
        setContacto('');
      }

      // Cargar direcciones
      try {
        const direccionesRes = await axios.get(`/api/clientes/${cabecera.id_cliente}/direcciones`);
        setDireccionesCliente(Array.isArray(direccionesRes.data) ? direccionesRes.data : []);

         setDireccionIdSeleccionada(cabecera.id_direccion_cliente || '');
console.log('🧪 Dirección retomada:', cabecera.id_direccion_cliente);
      } catch (err) {
        console.error('Error al cargar direcciones del cliente', err);
        setDireccionesCliente([]);
      }

      // Cargar días de pago
      try {
        const diasRes = await axios.get(`/api/clientes/${cabecera.id_cliente}/dias-pago`);
        setOpcionesDiasPago(diasRes.data.map(String));
      } catch (err) {
        console.error('Error al cargar días de pago', err);
        setOpcionesDiasPago([]);
      }

      // Cargar condiciones comerciales
      await cargarCondiciones(cabecera.id_cliente);
      setCondicionSeleccionada(cabecera.forma_pago?.trim() || '');

      // Cargar productos
      const formateados = productos.map(p => ({
        ...p,
        cantidad: p.cantidad || 1,
        markup: p.markup ?? 0,
        descuento: p.descuento ?? 0,
        precio: Number(p.precio) || 0,
        tasa_iva: Number(p.tasa_iva) || 21
      }));

      setProductosSeleccionados(formateados);
      setCarrito(formateados);

      // Otros datos de cabecera
      setVigenciaHasta(cabecera.vigencia_hasta || '');
      setObservaciones(cabecera.observaciones || '');
      setPlazoEntrega(cabecera.plazo_entrega || '');
      setCostoEnvio(cabecera.costo_envio || '');

      // Estado e identificadores
      setEstadoCotizacion(cabecera.estado);
      setNumeroCotizacion(cabecera.numero_cotizacion);
      setIdCotizacionActual(cabecera.id);
      localStorage.setItem('idCotizacionActual', cabecera.id);

    } catch (error) {
      console.error('Error al cargar cotización existente:', error);
    }
  };








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
    if (clienteSeleccionado) {
      cargarCondiciones(clienteSeleccionado);
    }
  }, [clienteSeleccionado]);

 
 
 
  // Cargar condiciones comerciales al seleccionar cliente
 const cargarCondiciones = async (idCliente) => {
  try {
    const { data } = await axios.get(`/api/clientes/${idCliente}/condiciones`, {
      headers: { 'Cache-Control': 'no-cache' }
    });

    const forma = (data.forma_pago || '').trim();
    const cambio = (data.tipo_cambio || '').trim();
    const dias = String(data.dias_pago || '').trim();

    setFormaPago(forma);
    setCondicionSeleccionada(forma); // 👈 esto es lo nuevo

    setTipoCambio('');
    setTimeout(() => {
      setTipoCambio(cambio);
    }, 0);

    if (opcionesDiasPago.includes(dias)) {
      setDiasPago(dias);
      setDiasPagoExtra('');
    } else {
      setDiasPago('');
      setDiasPagoExtra(dias);
    }

    console.log('Tipo de cambio recibido:', cambio);
    console.log('Forma de pago:', forma);
    console.log('Días de pago:', dias);
  } catch (err) {
    console.error('Error al cargar condiciones comerciales:', err);
  }
};

  // Cargar opciones de plazos de pago
  useEffect(() => {
    if (clienteSeleccionado) {
      axios.get(`/api/clientes/${clienteSeleccionado}/dias-pago`)
        .then(({ data }) => {
          const opciones = data.map(String);
          setOpcionesDiasPago(opciones);
        })
        .catch(err => console.error('Error al cargar días de pago del cliente', err));
    }
  }, [clienteSeleccionado]);


  // Resumen de la cotización: totales, IVA, descuentos, etc.
  const resumen = useMemo(() => {
    let base21 = 0, base105 = 0;
    let totalDescuentos = 0;

    carrito.forEach(p => {
      const precio = isNaN(parseFloat(p.precio)) ? 0 : parseFloat(p.precio);
      const cantidad = isNaN(parseFloat(p.cantidad)) ? 1 : parseFloat(p.cantidad);
      const markup = isNaN(parseFloat(p.markup)) ? 0 : parseFloat(p.markup);
      const descuento = isNaN(parseFloat(p.descuento)) ? 0 : parseFloat(p.descuento);
      const iva = isNaN(parseFloat(p.tasa_iva)) ? 21 : parseFloat(p.tasa_iva);
      totalDescuentos += descuento;
      const pf = precio * (1 + markup / 100);
      const base = Math.max(0, cantidad * pf - descuento);

      if (iva === 21) base21 += base;
      else if (iva === 10.5) base105 += base;
      else base21 += base;
    });

    const baseProd = base21 + base105;

    // Costo de envío original
    const envio = isNaN(parseFloat(costoEnvio)) ? 0 : parseFloat(costoEnvio);

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
    return productos.map(p => ({
      id_producto: p.id_producto || p.id,
      cantidad: Number(p.cantidad) || 1,
      precio_unitario: Number(p.precio_unitario ?? p.precio) || 0,
      descuento: Number(p.descuento) || 0,
      markup: Number(p.markup) || 0,
      tasa_iva: Number(p.tasa_iva) || 21
    }));
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


  // Guardar cotización como borrador
  const handleGuardarBorrador = async () => {
    if (!clienteSeleccionado) {
      setMensajeError('Debés seleccionar un cliente antes de guardar la cotización');
      setMensajeExito('');
      return;
    }

    if (!usuarioActual?.id_vendedor) {
      setMensajeError('No se pudo identificar al vendedor');
      setMensajeExito('');
      return;
    } console.log('Productos seleccionados al guardar:', productosSeleccionados);
    for (const p of productosSeleccionados) {
      if (
        typeof p.id_producto !== 'number' ||
        typeof p.cantidad !== 'number' ||
        typeof p.precio_unitario !== 'number' ||
        typeof p.descuento !== 'number'
      ) {
        console.warn('❌ Producto mal formado:', p);
      } else {
        console.log('✅ Producto válido:', p);
      }
    }


    const payload = {
      id_cliente: clienteSeleccionado,
      id_vendedor: usuarioActual.id_vendedor,
      id_contacto: typeof contacto === 'object' ? contacto.id : contacto,
      id_direccion_cliente: direccionIdSeleccionada,
     id_condicion: getCondicionId(condicionSeleccionada),
      vigencia_hasta: vigenciaHasta,
      observaciones: observaciones,
      plazo_entrega: plazoEntrega,
      estado: 'borrador',
      productos: formatearProductosParaGuardar(carrito)
    };

    console.log('Guardando borrador con:', { ...payload, idCotizacionActual });
    console.log('ID actual de cotización:', idCotizacionActual);
    console.log('🧪 Condición seleccionada:', condicionSeleccionada);
console.log('🧪 ID de condición:', getCondicionId(condicionSeleccionada));

    try {
      console.log('🧪 Enviando productos al backend:', productosSeleccionados);
      if (idCotizacionActual) {
        await axios.put(`/api/cotizaciones/${idCotizacionActual}/actualizar`, payload);
        setMensajeExito('Cotización actualizada como borrador');
      } else {
        const res = await axios.post('/api/cotizaciones/iniciar', payload); // Nuevo endpoint para iniciar cotización
        setIdCotizacionActual(res.data.id_cotizacion);
        localStorage.setItem('idCotizacionActual', res.data.id_cotizacion);
        setNumeroCotizacion(res.data.numero_cotizacion);
        setEstadoCotizacion(res.data.estado);
        setMensajeExito('Cotización guardada como borrador');
      }

      setMensajeError('');
    } catch (error) {
      console.error('Error al guardar borrador:', error.response?.data || error.message || error);
      setMensajeError('No se pudo guardar la cotización');
      setMensajeExito('');
    }
  };




  const handleSeleccionCliente = async (cliente) => {
    // 🛡️ Evita recargar si ya está seleccionado
    if (cliente?.id === clienteSeleccionado) return;

    setCliente(cliente.id);
    setClienteSeleccionado(cliente.id);
    setClienteObjeto(cliente);
    setBusquedaCliente(cliente.razon_social);

    try {
      const { data } = await axios.get(`/api/clientes/${cliente.id}/contactos`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      setContactosCliente(Array.isArray(data) ? data : []);
      setContacto('');
    } catch (err) {
      console.error('Error al cargar contactos del cliente', err);
      setContactosCliente([]);
    }
  };


  // Actualizar cotización existente
  const handleActualizarCotizacion = async () => {
    if (!idCotizacionActual) {
      setMensajeError('No hay cotización activa para actualizar');
      return;
    }

    try {
      console.log('🧪 Enviando productos:', productosSeleccionados);
      await axios.put(`/api/cotizaciones/${idCotizacionActual}/actualizar`, {
        id_cliente: clienteSeleccionado,
        id_contacto: contactoSeleccionado,
        id_direccion_cliente: direccionIdSeleccionada,
        id_condicion: getCondicionId(condicionSeleccionada),
        vigencia_hasta: vigenciaHasta,
        observaciones,
        plazo_entrega: plazoEntrega,
        costo_envio: costoEnvio,
        estado: 'borrador',
        productos: formatearProductosParaGuardar(carrito)
      });

      setMensajeExito('Cotización actualizada correctamente');
      setMensajeError('');
    } catch (error) {

      setMensajeError('No se pudo actualizar la cotización');
      setMensajeExito('');
    } console.log('🧪 Enviando productos formateados:', formatearProductosParaGuardar(carrito));
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


  
const handleFinalizarCotizacion = async () => {
  alert('Finalizar cotización ejecutado');
 // 👇 Agregá esto para ver qué valores están llegando
  console.log({
    clienteSeleccionado,
    id_vendedor: usuarioActual?.id_vendedor,
    id_direccion_cliente: direccionIdSeleccionada,
    contacto,
    condicionSeleccionada,
    vencimiento,
    carritoLength: carrito.length
  });

  if (
    !clienteSeleccionado ||
    !usuarioActual?.id_vendedor ||
    !idireccionIdSeleccionada ||
    !contacto ||
    !condicionSeleccionada ||
    !vencimiento ||
    carrito.length === 0
  ) {
    setMensajeError('Faltan datos obligatorios para finalizar la cotización');
    setMensajeExito('');
    return;
  }

  // Calcular vigencia_hasta a partir de vencimiento
  const hoy = new Date();
  hoy.setDate(hoy.getDate() + Number(vencimiento));
  const fechaVencimiento = hoy.toISOString().slice(0, 10);
  setVigenciaHasta(fechaVencimiento); // opcional si querés mostrarla en tiempo real

  const payload = {
    id_cliente: clienteSeleccionado,
    id_vendedor: usuarioActual?.id_vendedor,
    id_contacto: typeof contacto === 'object' ? contacto.id : contacto,
    id_direccion_cliente: direccionIdSeleccionada,
    id_condicion: condicionSeleccionada,
    vigencia_hasta: fechaVencimiento,
    vencimiento,
    observaciones,
    plazo_entrega: plazoEntrega,
    costo_envio: costoEnvio,
    estado: 'pendiente',
    productos: formatearProductosParaGuardar(carrito)
  };

  try {
    if (idCotizacionActual) {
      await axios.put(`/api/cotizaciones/finalizar/${idCotizacionActual}`, payload);
    } else {
      const res = await axios.post('/api/cotizaciones/iniciar', payload);
      setIdCotizacionActual(res.data.id_cotizacion);
      setNumeroCotizacion(res.data.numero_cotizacion);
    }

    setEstadoCotizacion('pendiente');
    setMensajeExito('Cotización finalizada y enviada al cliente');
    setMensajeError('');
    navigate('/menu');
  } catch (error) {
    console.error('Error al finalizar cotización:', error);
    setMensajeError('No se pudo finalizar la cotización');
    setMensajeExito('');
  }
};


  const handleEnviarCotizacion = async () => {
    const datosCotizacion = {
      id_cliente: clienteSeleccionado,
      id_vendedor: usuarioActual?.id_vendedor,
      id_contacto: typeof contacto === 'object' ? contacto.id : contacto,
      id_direccion_cliente: direccionIdSeleccionada,
      id_condicion: condicionSeleccionada,
      vigencia_hasta: vigenciaHasta,
      observaciones,
      plazo_entrega: plazoEntrega,
      costo_envio: costoEnvio,
      productos: formatearProductosParaGuardar(carrito)
    };

    try {
      if (idCotizacionActual) {
        await axios.put(`/api/cotizaciones/finalizar/${idCotizacionActual}`, {
          ...datosCotizacion,
          estado: 'pendiente'
        });
      } else {
        const res = await axios.post('/api/cotizaciones/iniciar', {
          ...datosCotizacion,
          estado: 'pendiente'
        });
        setIdCotizacionActual(res.data.id_cotizacion);
        setNumeroCotizacion(res.data.numero_cotizacion);
        setEstadoCotizacion(res.data.estado);
      }

      setMensajeExito('Cotización enviada al cliente');
      setMensajeError('');
      navigate('/menu');
    } catch (error) {
      console.error('❌ Error al enviar cotización:', error);
      setMensajeError('No se pudo enviar la cotización');
      setMensajeExito('');
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
                  <select
                    className="form-select"
                    value={formaPago}
                    onChange={(e) => setFormaPago(e.target.value)}
                  >
                    <option value="">Seleccioná...</option>
                    <option>Transferencia</option>
                    <option>Cheque</option>
                    <option>Tarjeta de crédito</option>
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
                    </div>


                  </div>




                </div>




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


                <div className="col-md-4">
                  <label className="form-label">Plazo de pago</label>
                  <div className="input-group">
                    <select
                      className="form-select"
                      value={diasPago}
                      onChange={(e) => setDiasPago(e.target.value)}
                    >
                      <option value="">Seleccioná...</option>
                      {opcionesDiasPago.map((opcion, idx) => (
                        <option key={idx} value={opcion}>{opcion}</option>
                      ))}
                    </select>




                    {/* Mostrar campo extra solo si el valor actual no está en el select */}
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Otro valor"
                      value={diasPagoExtra}
                      onChange={(e) => setDiasPagoExtra(e.target.value)}
                    />
                  </div>
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
                      const precioFinal = num(p.precio) * (1 + num(p.markup) / 100);
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
                                const v = Math.min(Math.max(1, num(e.target.value)), p.stock);
                                const nuevo = [...carrito];
                                nuevo[i] = { ...nuevo[i], cantidad: v };
                                setCarrito(nuevo);
                              }}
                            />
                          </td>

                          {/* Precio NO editable */}
                          <td>{num(p.precio).toFixed(2)}</td>

                          {/* Margen editable */}
                          <td>
                            <input
                              type="number"
                              min="0"
                              value={p.markup}
                              className="form-control form-control-sm"
                              onChange={(e) => {
                                const nuevo = [...carrito];
                                nuevo[i] = { ...nuevo[i], markup: Math.max(0, num(e.target.value)) };
                                setCarrito(nuevo);
                              }}
                            />
                          </td>

                          {/* Precio final */}
                          <td>{precioFinal.toFixed(2)}</td>

                          {/* Descuento editable */}
                          <td>
                            <input
                              type="number"
                              min="0"
                              value={p.descuento}
                              className="form-control form-control-sm"
                              onChange={(e) => {
                                const nuevo = [...carrito];
                                nuevo[i] = { ...nuevo[i], descuento: Math.max(0, num(e.target.value)) };
                                setCarrito(nuevo);
                              }}
                            />
                          </td>

                          {/* Base */}
                          <td>{baseLinea.toFixed(2)}</td>

                          {/* IVA NO editable */}
                          <td>{p.tasa_iva}%</td>

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


          {/* Resumen  calcula los totales y muestra */}
          <div className="card card-soft mt-3">
            <div className="card-body">
              <h5 className="section-title">Resumen</h5>
              <div className="totales-table">
                <div className="row"><div className="col-7">Subtotal productos</div><div className="col-5 text-end"><strong>US$ {resumen.baseProd.toFixed(2)}</strong></div></div>
                <div className="row"><div className="col-7">Costo de envío</div><div className="col-5 text-end"><strong>US$ {resumen.envio.toFixed(2)}</strong></div></div>
                {resumen.envioBonificado && (
                  <div className="alert alert-success text-end py-1 mb-2">
                    ¡Envío bonificado por superar los US$ 1500!
                  </div>
                )}

                <div className="row"><div className="col-7">Base imponible</div><div className="col-5 text-end"><strong>US$ {resumen.baseImp.toFixed(2)}</strong></div></div>
                <div className="row"><div className="col-7">IVA 21% (incluye envío)</div><div className="col-5 text-end"><strong>US$ {resumen.iva21.toFixed(2)}</strong></div></div>
                <div className="row"><div className="col-7">IVA 10.5%</div><div className="col-5 text-end"><strong>US$ {resumen.iva105.toFixed(2)}</strong></div></div>
                <div className="row"><div className="col-7">Descuento total aplicado</div><div className="col-5 text-end"><strong>US$ {resumen.totalDescuentos.toFixed(2)}</strong></div>
                  <div className="row"><div className="col-7">Total</div><div className="col-5 text-end"><strong>US$ {resumen.total.toFixed(2)}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </div>



          {/* Acciones / Guardar, Finalizar, Enviar, Cancelar */}
          <div className="d-flex justify-content-between align-items-center my-3 flex-wrap gap-2">
            {estadoCotizacion === 'borrador' && idCotizacionActual ? (
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
                  <button className="btn btn-sm btn-outline-primary" onClick={handleFinalizarCotizacion}>
                    <i className="bi bi-check2-circle me-1"></i> Finalizar
                  </button>
                </div>

                {/* Enviar */}
                <button className="btn btn-sm btn-success" onClick={handleEnviarCotizacion}>
                  <i className="bi bi-send-check me-1"></i> Enviar al cliente
                </button>
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
                  <button className="btn btn-sm btn-outline-primary" onClick={handleFinalizarCotizacion}>
                    <i className="bi bi-check2-circle me-1"></i> Finalizar
                  </button>
                </div>

                {/* Enviar */}
                <button className="btn btn-sm btn-success" onClick={handleEnviarCotizacion}>
                  <i className="bi bi-send-check me-1"></i> Enviar al cliente
                </button>
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
