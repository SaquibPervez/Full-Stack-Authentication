import express from 'express';
import { signUp, logIn } from '../schemas.js';
import { validate } from '../middleware/validate.js';
import { register, login, logout } from '../controllers/authController.js';
import { refreshToken } from '../utils/jwtHelpers.js';

const router = express.Router();

router.post("/signup", validate(signUp), register);
router.post("/login", validate(logIn), login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

export default router;