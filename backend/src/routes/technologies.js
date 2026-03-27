import { Router } from 'express';
import * as technologyController from '../controllers/technologyController.js';
import { auth, requireAdmin } from '../middleware/auth.js';
import { requireBody, requireFields } from '../middleware/validate.js';

const router = Router();

router.get('/', technologyController.list);
router.get('/search/:name', technologyController.search);
router.get('/:id', technologyController.getById);
router.get('/:id/related', technologyController.getRelated);

router.post('/', auth, requireAdmin, requireBody, requireFields(['name', 'category', 'difficulty']), technologyController.create);

export default router;
