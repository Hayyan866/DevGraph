import { Router } from 'express';
import * as aiController from '../controllers/aiController.js';
import { requireBody, requireFields } from '../middleware/validate.js';

const router = Router();

router.post('/generate-roadmap', requireBody, requireFields(['goal']), aiController.generateRoadmap);
router.post('/explain', requireBody, aiController.explain);
router.post('/skill-gap', requireBody, aiController.skillGap);

export default router;
