const express = require('express');
const { requestSignup, verifySignup, completeSignup, login, forgotPassword, resetPassword } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', requestSignup);
router.post('/verify', verifySignup);
router.post('/complete-signup', completeSignup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
