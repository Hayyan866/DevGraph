import * as learningProgressModel from '../models/learningProgress.js';

/** POST /api/learning-progress — update status for a technology. Body: { technology_id, status }. */
export async function upsert(req, res, next) {
  try {
    const userId = req.user.id;
    const { technology_id, status } = req.body;
    if (!technology_id) {
      return res.status(400).json({ error: 'technology_id is required' });
    }
    const validStatus = ['not_started', 'learning', 'completed'].includes(status) ? status : 'learning';
    const progress = await learningProgressModel.upsert({
      userId,
      technologyId: technology_id,
      status: validStatus,
    });
    res.json(progress);
  } catch (err) {
    next(err);
  }
}

/** GET /api/learning-progress/user/:id */
export async function getByUserId(req, res, next) {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    if (Number.isNaN(targetUserId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }
    if (req.user.id !== targetUserId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const list = await learningProgressModel.findByUserId(targetUserId);
    res.json(list);
  } catch (err) {
    next(err);
  }
}
