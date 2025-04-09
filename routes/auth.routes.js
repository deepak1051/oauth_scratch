import express from 'express';
import { googleLogin, googleCallback, logout } from '../controllers/auth.ct.js';

import { refreshAccessToken } from '../controllers/auth.ct.js';

const router = express.Router();

// Google OAuth
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);

router.get('/refresh-token', refreshAccessToken);

// GitHub will be added later
router.get('/logout', logout);

export default router;
