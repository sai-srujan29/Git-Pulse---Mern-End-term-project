import express from 'express';
import {
  getGithubAuthUrl,
  handleGithubCallback,
  getMe,
  logout,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/github', getGithubAuthUrl);
router.get('/github/callback', handleGithubCallback);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
