import * as openaiService from '../services/openai.js';

/**
 * POST /api/gap-analysis
 * Body: { current_skills: string[], target_role: string }
 * Returns: { missingSkills, coverage_percent, categories, readiness_score, suggestions }
 */
export async function analyzeGap(req, res, next) {
    try {
        const { current_skills, target_role } = req.body;
        if (!target_role || typeof target_role !== 'string') {
            return res.status(400).json({ error: 'target_role is required' });
        }
        const skills = Array.isArray(current_skills) ? current_skills.filter(Boolean) : [];
        const result = await openaiService.analyzeSkillGap(skills, target_role.trim());
        res.json(result);
    } catch (err) {
        next(err);
    }
}
