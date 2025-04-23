// file: src/routes/v2/users.js
const express = require('express');
const router = express.Router();
const userController = require('../../controllers/v2/userController');
const { verifyToken } = require('../../middleware/authMiddleware');

// v2: Added verifyToken middleware to protect routes

router.get('/', verifyToken, userController.getAllUsers);
router.delete('/:id', verifyToken, userController.deleteUser);
router.get('/:id', verifyToken, userController.getUser);
router.put('/:id', verifyToken, userController.updateUser);

module.exports = router;