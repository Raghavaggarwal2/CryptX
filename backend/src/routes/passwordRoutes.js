const express = require('express');
const { getPasswords, createPassword, deletePassword } = require('../controllers/passwordController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply middleware to all password routes
router.use(authenticateToken);

router.get('/', getPasswords);
router.post('/', createPassword);
router.delete('/:id', deletePassword);

module.exports = router;
