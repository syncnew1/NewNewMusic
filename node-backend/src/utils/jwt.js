const jwt = require('jsonwebtoken');
const { promisify } = require('util');

class JWTManager {
  constructor() {
    this.secret = process.env.JWT_SECRET || 'your-secret-key';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
  }

  // Generate access token
  generateToken(payload) {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
      issuer: 'NewNewMusic',
      audience: 'NewNewMusic-users'
    });
  }

  // Generate refresh token
  generateRefreshToken(payload) {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.refreshExpiresIn,
      issuer: 'NewNewMusic',
      audience: 'NewNewMusic-users'
    });
  }

  // Verify token
  async verifyToken(token) {
    try {
      const decoded = await promisify(jwt.verify)(token, this.secret, {
        issuer: 'NewNewMusic',
        audience: 'NewNewMusic-users'
      });
      return { success: true, decoded };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Decode token without verification (for debugging)
  decodeToken(token) {
    try {
      return jwt.decode(token, { complete: true });
    } catch (error) {
      return null;
    }
  }

  // Generate token pair (access + refresh)
  generateTokenPair(payload) {
    const accessToken = this.generateToken(payload);
    const refreshToken = this.generateRefreshToken(payload);
    
    return {
      accessToken,
      refreshToken,
      expiresIn: this.expiresIn
    };
  }

  // Extract token from Authorization header
  extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }
}

module.exports = new JWTManager();