const express = require('express');
const AuthController = require('../controllers/auth.controller');
const { authValidation } = require('../middleware/validation.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware'); 

const router = express.Router();

router.post('/register', authValidation.register, AuthController.register);
router.post('/login', authValidation.login, AuthController.login);
router.post('/refresh-token', AuthController.refreshToken); // No validation needed for refresh token itself, just check presence

module.exports = router;