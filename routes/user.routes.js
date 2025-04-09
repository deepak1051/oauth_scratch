import express from 'express';
import { authenticate } from '../middleware/auth.md.js';

const router = express.Router();

// Protected route (e.g. dashboard data)
router.get('/me', authenticate, async (req, res) => {
  res.status(200).json({
    id: req.user._id,
    email: req.user.email,
    name: req.user.name,
    avatar: req.user.avatar,
    role: req.user.role,
  });
});

export default router;
