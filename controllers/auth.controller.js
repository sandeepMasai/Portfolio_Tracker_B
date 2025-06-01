const AuthService = require('../services/auth.service');
const { validationResult } = require('express-validator');
const createHttpError = require('http-errors');

class AuthController {
  async register(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createHttpError(400, { errors: errors.array() });
      }

      const { name, email, password } = req.body;
      const user = await AuthService.register(name, email, password);

      res.status(201).json({
        message: 'User registered successfully',
        userId: user._id || user.id, // Ensure ID is returned
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createHttpError(400, { errors: errors.array() });
      }

      const { email, password } = req.body;
      const { user, token } = await AuthService.login(email, password);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id || user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw createHttpError(400, 'Refresh token not provided');
      }

      const { token } = await AuthService.refreshToken(refreshToken);

      res.json({
        message: 'Token refreshed successfully',
        token,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
