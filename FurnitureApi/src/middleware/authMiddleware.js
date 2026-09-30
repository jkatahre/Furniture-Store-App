const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to protect routes & request validation
exports.protect = async (req, res, next) => {
  let token;

  // Check for Authorization header (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token exists, access denied
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  try {
    // Verify & decode token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Set user info on request object
    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error('JWT Verification Error:', error);

    // Token invalid or expired
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Access denied.',
    });
  }
};
