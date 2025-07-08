
import jwt from 'jsonwebtoken';

// Hardcoded credentials for demo purposes
const VALID_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'password123'
};

// Secret key for JWT (in production, this should be stored securely)
const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';

export const validateCredentials = (email: string, password: string): boolean => {
  return email === VALID_CREDENTIALS.email && password === VALID_CREDENTIALS.password;
};

export const generateJWTToken = (email: string): string => {
  const payload = {
    email,
    role: 'admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };

  return jwt.sign(payload, JWT_SECRET);
};

export const verifyJWTToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Invalid JWT token:', error);
    return null;
  }
};
