// ══════════════════════════════════════════════════
// Auth Routes
// ══════════════════════════════════════════════════

import express from 'express';
import { validate } from '../../middleware/validate.js';
import { register, login, refreshToken, logout } from './auth.controller.js';
import { registerSchema, loginSchema } from './auth.validation.js';

const router = express.Router();

router.post('/signup', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

export default router;
