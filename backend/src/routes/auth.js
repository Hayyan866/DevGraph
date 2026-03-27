import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { requireBody, requireFields } from '../middleware/validate.js';

const router = Router();

router.post('/register', requireBody, requireFields(['name', 'email', 'password']), authController.register);
router.post('/login', requireBody, requireFields(['email', 'password']), authController.login);

export default router;
