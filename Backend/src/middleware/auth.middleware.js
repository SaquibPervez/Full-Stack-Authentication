import jwt from 'jsonwebtoken';
import { ApiError } from '../shared/ApiError.js';

export const authenticate = (req, res, next) => {
  const token = req.cookies?.accessToken || req.headers['authorization']?.split(' ')[1];

  if (!token) {
    throw ApiError.unauthorized('Access Denied: Please Login');
  }

  try {
    const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Token expired');
    }
    throw ApiError.unauthorized('Invalid token');
  }
};
