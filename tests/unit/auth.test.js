const User = require('../../models/User');
const AuthService = require('../../services/auth.service');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const createHttpError = require('http-errors');

// Mock mongoose and bcrypt
jest.mock('../../models/User');
jest.mock('bcrypt');
jest.mock('../../config/jwt', () => ({
  generateToken: jest.fn(() => 'mocked_jwt_token'),
  verifyToken: jest.fn(),
}));

describe('AuthService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      User.findOne.mockResolvedValue(null); // No existing user
      // Mock the User constructor to return an object with a save method
      User.mockImplementation(() => {
        const mockUserInstance = {
          _id: 'user123',
          email: 'new@example.com',
          name: 'New User',
          save: jest.fn().mockResolvedValue(this), // 'this' refers to the mockUserInstance
        };
        return mockUserInstance;
      });

      const user = await AuthService.register('New User', 'new@example.com', 'password123');

      expect(User.findOne).toHaveBeenCalledWith({ email: 'new@example.com' });
      // Ensure the User constructor was called with the correct arguments
      expect(User).toHaveBeenCalledWith({ name: 'New User', email: 'new@example.com', password: 'password123' });
      expect(user.save).toHaveBeenCalled(); // Check if save was called on the instance
      expect(user).toHaveProperty('_id', 'user123');
      expect(user).toHaveProperty('email', 'new@example.com');
      expect(user).toHaveProperty('name', 'New User'); // Added this for completeness
    });

    it('should throw 409 if user already exists', async () => {
      User.findOne.mockResolvedValue({ email: 'existing@example.com' }); // User exists
      User.mockImplementation(() => ({ // Ensure save is mocked even if not called
        save: jest.fn(),
      }));

      await expect(AuthService.register('Existing User', 'existing@example.com', 'password123'))
        .rejects.toEqual(createHttpError(409, 'User with this email already exists'));
      expect(User.findOne).toHaveBeenCalledWith({ email: 'existing@example.com' });
      expect(User.prototype.save).not.toHaveBeenCalled(); // Ensure save is not called
    });

    it('should throw error if save fails', async () => {
      User.findOne.mockResolvedValue(null);
      // Mock the constructor and the save method to reject
      User.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('DB error')),
      }));

      await expect(AuthService.register('New User', 'new@example.com', 'password123'))
        .rejects.toThrow('DB error');
    });
  });

  describe('login', () => {
    it('should log in a user successfully and return a token', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        role: 'user',
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      // Mock findOne to return an object with a select method, then resolve with mockUser
      User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });

      const { user, token } = await AuthService.login('test@example.com', 'password123');

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
      expect(token).toBe('mocked_jwt_token');
      expect(user).toEqual(mockUser);
    });

    it('should throw 401 for invalid email', async () => {
      User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) }); // User not found

      await expect(AuthService.login('nonexistent@example.com', 'password123'))
        .rejects.toEqual(createHttpError(401, 'Invalid credentials'));
    });

    it('should throw 401 for invalid password', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        role: 'user',
        comparePassword: jest.fn().mockResolvedValue(false), // Password mismatch
      };
      User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });

      await expect(AuthService.login('test@example.com', 'wrongpassword'))
        .rejects.toEqual(createHttpError(401, 'Invalid credentials'));
      expect(mockUser.comparePassword).toHaveBeenCalledWith('wrongpassword');
    });
  });
});