import * as userSkillsModel from '../models/userSkills.js';

/** GET /api/user-skills/user/:userId */
export async function listSkills(req, res, next) {
    try {
        const userId = req.params.userId;
        // Only allow users to see their own skills (unless admin)
        if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        const skills = await userSkillsModel.getUserSkills(userId);
        res.json(skills);
    } catch (err) {
        next(err);
    }
}

/** POST /api/user-skills */
export async function addSkill(req, res, next) {
    try {
        const { skill_name, category, proficiency_level } = req.body;
        if (!skill_name || !skill_name.trim()) {
            return res.status(400).json({ error: 'skill_name is required' });
        }
        const skill = await userSkillsModel.addUserSkill(req.user.id, {
            skill_name,
            category: category || 'general',
            proficiency_level: proficiency_level || 'intermediate',
        });
        res.status(201).json(skill);
    } catch (err) {
        next(err);
    }
}

/** DELETE /api/user-skills/:id */
export async function removeSkill(req, res, next) {
    try {
        const skillId = req.params.id;
        const deleted = await userSkillsModel.removeUserSkill(req.user.id, skillId);
        if (!deleted) {
            return res.status(404).json({ error: 'Skill not found or access denied' });
        }
        res.json({ success: true, id: deleted.id });
    } catch (err) {
        next(err);
    }
}

/** GET /api/user-skills — current user's skills */
export async function mySkills(req, res, next) {
    try {
        const skills = await userSkillsModel.getUserSkills(req.user.id);
        res.json(skills);
    } catch (err) {
        next(err);
    }
}
