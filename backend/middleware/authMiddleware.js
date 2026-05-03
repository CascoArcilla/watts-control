const jwt = require('jsonwebtoken');
const { User, Group } = require('../models');

const verifyToken = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: 'No hay token de autenticación' });
  }

  try {
    const decoded = jwt.verify(token, process.env.EC_SECRET_KEY);

    // Fetch user and groups to attach to req object
    const user = await User.findByPk(decoded.id, {
      include: [{ model: Group }]
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (user.is_bloked) {
      return res.status(403).json({ message: 'Usuario bloqueado' });
    }

    req.userId = decoded.id;
    req.user = user;
    req.userGroups = user.Groups.map(g => g.name);
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
       return res.status(401).json({ message: 'Token expirado', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: 'Token invalido' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.userGroups) {
      return res.status(403).json({ message: 'No hay roles para el usuario' });
    }

    const hasRole = req.userGroups.some(role => roles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  requireRole
};
