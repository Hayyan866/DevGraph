import { query } from '../config/db.js';

export async function upsert({ userId, technologyId, status, completedAt = null }) {
  const res = await query(
    `INSERT INTO learning_progress (user_id, technology_id, status, completed_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, technology_id)
     DO UPDATE SET status = $3, completed_at = $4, updated_at = NOW()
     RETURNING *`,
    [userId, technologyId, status, status === 'completed' ? (completedAt || new Date()) : null]
  );
  return rowToProgress(res.rows[0]);
}

export async function findByUserId(userId) {
  const res = await query(
    `SELECT lp.*, t.name as technology_name, t.category, t.difficulty
     FROM learning_progress lp
     JOIN technologies t ON t.id = lp.technology_id
     WHERE lp.user_id = $1
     ORDER BY lp.updated_at DESC`,
    [userId]
  );
  return res.rows.map(rowToProgress);
}

function rowToProgress(row) {
  const r = row || {};
  return {
    id: String(r.id),
    userId: r.user_id,
    technologyId: String(r.technology_id),
    technologyName: r.technology_name,
    category: r.category,
    difficulty: r.difficulty,
    status: r.status,
    completedAt: r.completed_at,
    updatedAt: r.updated_at,
  };
}
