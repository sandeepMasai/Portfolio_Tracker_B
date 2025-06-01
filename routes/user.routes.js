const express = require('express');
const UserController = require('../controllers/user.controller');
const { userValidation } = require('../middleware/validation.middleware');

const router = express.Router();

router.route('/profile')
  .get(UserController.getUserProfile)
  .put(userValidation.update, UserController.updateProfile);

router.delete('/account', UserController.deleteAccount);

module.exports = router;