import jwt from 'jsonwebtoken'
import { TOKEN_SECRET} from '../config/jwt.js'


//middleware de validacion de Token 
export const authRequired = (req, res, next)=> {
  
    const {token} = req.cookies;
    console.log('Token recibido:', token);

    if (!token)
         return res.status(401).json({message:"No se proporcionó token de autenticación"});

           jwt.verify(token, TOKEN_SECRET, (err, user ) => {
                if (err) return res.status(403).json({message: "Token inválido"});
                 req.user = user
console.log('Usuario autenticado:', user);
                next();        
            })

};
