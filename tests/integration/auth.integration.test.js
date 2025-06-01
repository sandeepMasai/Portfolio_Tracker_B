const request = require('supertest');
const app = require('../../server'); // Your Express app
const mongoose = require('mongoose');
const User = require('../../models/User');
const { generateToken } = require('../../config/jwt'); // For generating test tokens
require('dotenv').config();

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    // Connect to a test database or clear existing data
    // Ensure you have a separate test database URI in .env or handle it here
    await mongoose.connect(process.env.MONGODB_URI);
    await User.deleteMany({}); // Clear users before tests
  });

  afterEach(async () => {
    await User.deleteMany({}); // Clear users after each test
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Integration Test User',
          email: 'integration@test.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'User registered successfully');
      expect(res.body).toHaveProperty('userId');

      const user = await User.findOne({ email: 'integration@test.com' });
      expect(user).not.toBeNull();
      expect(user.name).toBe('Integration Test User');
    });

    it('should return 409 if email already exists', async () => {
      // First, register a user
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Existing User',
          email: 'existing@test.com',
          password: 'password123',
        });

      // Try to register again with the same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'existing@test.com',
          password: 'anotherpassword',
        });

      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty('message', 'User with this email already exists');
    });

    it('should return 400 for invalid input', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Invalid',
          email: 'invalid-email', // Invalid email
          password: '123', // Too short password
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
      // Now expecting the message to contain combined error messages
      expect(res.body.message).toContain('Invalid email format');
      expect(res.body.message).toContain('Password must be at least 6 characters long');
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;
    beforeEach(async () => {
      // Create a user for login tests
      testUser = await User.create({
        name: 'Login Test User',
        email: 'login@test.com',
        password: 'loginpassword', // Password will be hashed by pre-save hook
      });
    });

    it('should log in successfully and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'loginpassword',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Login successful');
      expect(res.body).toHaveProperty('token');
      expect(typeof res.body.token).toBe('string');
    });

    it('should return 401 for invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@test.com',
          password: 'loginpassword',
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should return 401 for invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });
  });
});