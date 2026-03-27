import { Router } from 'express';
import * as learningPathController from '../controllers/learningPathController.js';
import { auth } from '../middleware/auth.js';
import { requireBody, requireFields, requireParams } from '../middleware/validate.js';

const router = Router();

router.post('/', auth, requireBody, requireFields(['goal']), learningPathController.createPath);
router.get('/user/:id', auth, requireParams(['id']), learningPathController.getByUserId);

export default router;
