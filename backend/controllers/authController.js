const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Group, UserToken } = require('../models');

const JWT_SECRET = process.env.EC_SECRET_KEY;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({
      where: { username },
      include: [{ model: Group }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.is_bloked) {
      return res.status(403).json({ message: 'Account is blocked' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);

    // Save refresh token to DB
    await UserToken.create({
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      is_revoked: false,
      userId: user.id
    });

    setCookies(res, accessToken, refreshToken);

    const userGroups = user.Groups.map(g => g.name);

    res.json({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        roles: userGroups
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.me = async (req, res) => {
  // Uses verifyToken middleware so req.user and req.userGroups are available
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      roles: req.userGroups
    }
  });
};

exports.refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

    // Check if token exists in DB and is not revoked
    const tokenRecord = await UserToken.findOne({
      where: { token: refreshToken, userId: decoded.id, is_revoked: false }
    });

    if (!tokenRecord) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    if (new Date() > tokenRecord.expires_at) {
      return res.status(401).json({ message: 'Refresh token expired' });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(decoded.id);

    // Revoke old and save new
    tokenRecord.is_revoked = true;
    await tokenRecord.save();

    await UserToken.create({
      token: newRefreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      is_revoked: false,
      userId: decoded.id
    });

    setCookies(res, newAccessToken, newRefreshToken);

    res.json({ message: 'Tokens refreshed' });

  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
      await UserToken.update(
        { is_revoked: true },
        { where: { token: refreshToken, userId: decoded.id } }
      );
    } catch (error) {
      // Ignore verification errors on logout
    }
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};
