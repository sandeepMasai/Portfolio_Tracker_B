const UserService = require('../services/user.service');
const { validationResult } = require('express-validator');
const createHttpError = require('http-errors');

class UserController {
  async getUserProfile(req, res, next) {
    try {
      const userId = req.user._id;
      const user = await UserService.getUserProfile(userId);
      if (!user) {
        throw createHttpError(404, 'User not found');
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createHttpError(400, { errors: errors.array() });
      }
      const userId = req.user._id;
      const updateData = req.body;
      const updatedUser = await UserService.updateProfile(userId, updateData);
      if (!updatedUser) {
        throw createHttpError(404, 'User not found');
      }
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req, res, next) {
    try {
      const userId = req.user._id;
      await UserService.deleteAccount(userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();