import { query } from '../config/db.js';

/**
 * Get all skills for a user.
 */
export async function getUserSkills(userId) {
    const res = await query(
        'SELECT id, user_id, skill_name, category, proficiency_level, created_at FROM user_skills WHERE user_id = $1 ORDER BY created_at ASC',
        [userId]
    );
    return res.rows;
}

/**
 * Add a skill for a user. Ignores conflicts (skill already exists).
 */
export async function addUserSkill(userId, { skill_name, category = 'general', proficiency_level = 'intermediate' }) {
    const res = await query(
        `INSERT INTO user_skills (user_id, skill_name, category, proficiency_level)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, skill_name) DO UPDATE SET category = EXCLUDED.category, proficiency_level = EXCLUDED.proficiency_level
     RETURNING id, user_id, skill_name, category, proficiency_level, created_at`,
        [userId, skill_name.trim(), category, proficiency_level]
    );
    return res.rows[0];
}

/**
 * Remove a specific skill by id (must belong to user).
 */
export async function removeUserSkill(userId, skillId) {
    const res = await query(
        'DELETE FROM user_skills WHERE id = $1 AND user_id = $2 RETURNING id',
        [skillId, userId]
    );
    return res.rows[0] || null;
}

/**
 * Replace all skills for a user (bulk update).
 */
export async function replaceUserSkills(userId, skills) {
    await query('DELETE FROM user_skills WHERE user_id = $1', [userId]);
    if (!skills.length) return [];
    const inserted = [];
    for (const s of skills) {
        const row = await addUserSkill(userId, s);
        inserted.push(row);
    }
    return inserted;
}
