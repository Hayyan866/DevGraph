import * as learningPathModel from '../models/learningPath.js';
import * as openaiService from '../services/openai.js';
import * as technologyModel from '../models/technology.js';

/**
 * POST /api/learning-path
 * Body: { goal } (typo-tolerant). Generates AI roadmap and saves to DB for the authenticated user.
 */
export async function createPath(req, res, next) {
  try {
    const userId = req.user.id;
    let { goal } = req.body;
    if (!goal || typeof goal !== 'string') {
      return res.status(400).json({ error: 'goal is required' });
    }
    goal = goal.trim();
    const normalizedGoal = await openaiService.correctGoalTypo(goal);
    const existingTech = await technologyModel.findAllApproved();
    const existingNames = existingTech.map((t) => t.name);
    const roadmap = await openaiService.generateRoadmapFromAI(normalizedGoal, existingNames);

    const steps = roadmap.steps || [];
    const progress = 0;
    const path = await learningPathModel.create({
      userId,
      goal: normalizedGoal,
      steps,
      progress,
    });
    res.status(201).json(path);
  } catch (err) {
    next(err);
  }
}

/** GET /api/learning-path/user/:id — fetch learning paths for user (self or admin). */
export async function getByUserId(req, res, next) {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    if (Number.isNaN(targetUserId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }
    if (req.user.id !== targetUserId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const paths = await learningPathModel.findByUserId(targetUserId);
    res.json(paths);
  } catch (err) {
    next(err);
  }
}
