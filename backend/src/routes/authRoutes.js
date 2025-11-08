import express from 'express';
import { registerAdmin, loginAdmin, getCurrentAdmin } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/me', authenticateToken, getCurrentAdmin);

export default router;