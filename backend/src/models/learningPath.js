import { query } from '../config/db.js';

export async function create({ userId, goal, steps, progress = 0 }) {
  const res = await query(
    `INSERT INTO learning_paths (user_id, goal, steps, progress)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, goal, JSON.stringify(steps || []), progress]
  );
  return rowToPath(res.rows[0]);
}

export async function findByUserId(userId) {
  const res = await query(
    'SELECT * FROM learning_paths WHERE user_id = $1 ORDER BY updated_at DESC',
    [userId]
  );
  return res.rows.map(rowToPath);
}

export async function findById(id) {
  const res = await query('SELECT * FROM learning_paths WHERE id = $1', [id]);
  return res.rows[0] ? rowToPath(res.rows[0]) : null;
}

export async function updateProgress(id, progress) {
  const res = await query(
    'UPDATE learning_paths SET progress = $1 WHERE id = $2 RETURNING *',
    [progress, id]
  );
  return res.rows[0] ? rowToPath(res.rows[0]) : null;
}

function rowToPath(row) {
  const r = row || {};
  const steps = typeof r.steps === 'string' ? JSON.parse(r.steps) : (r.steps || []);
  return {
    id: String(r.id),
    userId: r.user_id,
    goal: r.goal,
    steps,
    progress: r.progress,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
