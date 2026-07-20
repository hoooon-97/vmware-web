const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'vmware-web-secret-change-me';

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: '인증이 필요합니다' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: '유효하지 않은 토큰입니다' });
  }
}

module.exports = authMiddleware;
