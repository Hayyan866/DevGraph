import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { analyzeGap } from '../controllers/gapAnalysisController.js';

const router = Router();

/** POST /api/gap-analysis — analyze skill gap (auth required) */
router.post('/', auth, analyzeGap);

export default router;
