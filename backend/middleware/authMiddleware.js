const jwt = require('jsonwebtoken');
const { User, Group } = require('../models');

const verifyToken = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.EC_SECRET_KEY);

    // Fetch user and groups to attach to req object
    const user = await User.findByPk(decoded.id, {
      include: [{ model: Group }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.is_bloked) {
      return res.status(403).json({ message: 'User is blocked' });
    }

    req.userId = decoded.id;
    req.user = user;
    req.userGroups = user.Groups.map(g => g.name);
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
       return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.userGroups) {
      return res.status(403).json({ message: 'No roles found for user' });
    }

    const hasRole = req.userGroups.some(role => roles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  requireRole
};
