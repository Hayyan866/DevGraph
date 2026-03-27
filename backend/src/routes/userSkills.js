import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { listSkills, addSkill, removeSkill, mySkills } from '../controllers/userSkillsController.js';

const router = Router();

// All routes require authentication
router.use(auth);

/** GET /api/user-skills — current user's skills */
router.get('/', mySkills);

/** GET /api/user-skills/user/:userId — get skills for a specific user (self or admin) */
router.get('/user/:userId', listSkills);

/** POST /api/user-skills — add a skill */
router.post('/', addSkill);

/** DELETE /api/user-skills/:id — remove a skill */
router.delete('/:id', removeSkill);

export default router;
