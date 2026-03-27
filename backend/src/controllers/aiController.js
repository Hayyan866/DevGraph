import * as openaiService from '../services/openai.js';
import * as technologyModel from '../models/technology.js';

/**
 * POST /api/ai/generate-roadmap
 * Body: { goal }. Returns full AI-generated roadmap (courses, projects, related techs). Does not save to DB.
 */
export async function generateRoadmap(req, res, next) {
  try {
    let { goal } = req.body;
    if (!goal || typeof goal !== 'string') {
      return res.status(400).json({ error: 'goal is required' });
    }
    goal = goal.trim();
    const normalizedGoal = await openaiService.correctGoalTypo(goal);
    const existingTech = await technologyModel.findAllApproved();
    const existingNames = existingTech.map((t) => t.name);
    const roadmap = await openaiService.generateRoadmapFromAI(normalizedGoal, existingNames);
    res.json(roadmap);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ai/explain
 * Body: { technology_id } or { technology_name }. Returns explanation, use cases, prerequisites.
 */
export async function explain(req, res, next) {
  try {
    const { technology_id, technology_name } = req.body;
    let name = technology_name;
    if (!name && technology_id) {
      const tech = await technologyModel.findById(technology_id);
      if (!tech) return res.status(404).json({ error: 'Technology not found' });
      name = tech.name;
    }
    if (!name) {
      return res.status(400).json({ error: 'technology_id or technology_name is required' });
    }
    const result = await openaiService.explainTechnology(name);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ai/skill-gap
 * Body: { known_skills } (array of strings). Returns suggested next skills with reasons.
 */
export async function skillGap(req, res, next) {
  try {
    const { known_skills } = req.body;
    const skills = Array.isArray(known_skills) ? known_skills : (known_skills ? [known_skills] : []);
    const result = await openaiService.suggestSkillGap(skills);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
