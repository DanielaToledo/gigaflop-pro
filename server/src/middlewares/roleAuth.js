// middlewares/roleAuth.js
export const authorize = (rolesPermitidos) => {
  return (req, res, next) => {
    const userRole = req.user?.rol; // viene del token validado en validateToken.js

    if (!rolesPermitidos.includes(userRole)) {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    next();
  };
};