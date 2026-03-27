import { Router } from 'express';
import * as learningProgressController from '../controllers/learningProgressController.js';
import { auth } from '../middleware/auth.js';
import { requireBody, requireFields, requireParams } from '../middleware/validate.js';

const router = Router();

router.post('/', auth, requireBody, requireFields(['technology_id']), learningProgressController.upsert);
router.get('/user/:id', auth, requireParams(['id']), learningProgressController.getByUserId);

export default router;
