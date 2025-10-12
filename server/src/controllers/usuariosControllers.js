import bcrypt from 'bcryptjs';
import { creatAccesToken, TOKEN_SECRET} from '../config/jwt.js';
import { findUserByEmail, createUser, findUserById } from '../models/UsuariosModels.js';

// Registrar usuario
export const register = async (req, res) => {
  const { usuario, email, password, rol = 'Vendedor', apellido= '' } = req.body;

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const rolesPermitidos = ['vendedor', 'administrador', 'gerente'];
    const rolFinal = rolesPermitidos.includes(rol?.toLowerCase()) ? rol.toLowerCase() : 'vendedor';
    // 🔁 Delegás todo al modelo
    const userId = await createUser(usuario, email, hashedPassword, rolFinal, apellido);

    res.status(201).json({ message: 'Usuario registrado con éxito', userId });
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Iniciar sesión
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await findUserByEmail(email); // Cambiado "user" por "usuario"
    if (!usuario) {
      return res.status(400).json({ message: 'Datos incorrectos' });
    }

    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Datos incorrectos' });
    }

    const token = await creatAccesToken({
      id: usuario.id,
      nombre: usuario.usuario,
      rol: usuario.rol // Agregar rol al token
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400000
    });

    res.status(200).json({
      message: 'Inicio de sesión exitoso', usuario: { id: usuario.id, nombre: usuario.usuario, rol: usuario.rol }
    });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Cerrar sesión
export const logout = (req, res) => {
  console.log(req.cookies);
  res.clearCookie('token');
  res.status(200).json({ message: 'Sesión cerrada correctamente' });
};

// Obtener perfil
export const profile = async (req, res) => {
  try {
    const usuario = await findUserById(req.user.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({
      usuario: { id: usuario.id, nombre: usuario.usuario, email: usuario.email, rol: usuario.rol }
    });
    // Cambiado "user" por "usuario"
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Verificar autenticación
export const checkAuth = async (req, res) => {
  try {
    res.status(200).json({
      authenticated: true,
      usuario: { id: req.user.id, nombre: req.user.nombre } // Cambiado "user" por "usuario"
    });
  } catch (error) {
    console.error('Error en checkAuth:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};


