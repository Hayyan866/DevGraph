import { query } from '../config/db.js';

/** List approved technologies; if none, returns empty (AI can suggest via separate flow). */
export async function findAllApproved() {
  const res = await query(
    `SELECT id, name, description, category, difficulty,
            related_technologies, project_ideas, learning_resources, status, updated_at
     FROM technologies WHERE status = 'approved' ORDER BY name`
  );
  return res.rows.map(rowToTechnology);
}

export async function findById(id) {
  const res = await query(
    `SELECT id, name, description, category, difficulty,
            related_technologies, project_ideas, learning_resources, status, updated_at
     FROM technologies WHERE id = $1`,
    [id]
  );
  if (res.rows.length === 0) return null;
  return rowToTechnology(res.rows[0]);
}

export async function create(tech) {
  const res = await query(
    `INSERT INTO technologies (name, description, category, difficulty, related_technologies, project_ideas, learning_resources, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, name, description, category, difficulty, related_technologies, project_ideas, learning_resources, status, updated_at`,
    [
      tech.name,
      tech.description || '',
      tech.category,
      tech.difficulty,
      JSON.stringify(tech.related_technologies || []),
      JSON.stringify(tech.project_ideas || []),
      JSON.stringify(tech.learning_resources || []),
      tech.status || 'pending',
    ]
  );
  return rowToTechnology(res.rows[0]);
}

export async function update(id, updates) {
  const fields = [];
  const values = [];
  let i = 1;
  const allowed = ['name', 'description', 'category', 'difficulty', 'related_technologies', 'project_ideas', 'learning_resources', 'status'];
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      fields.push(`${key} = $${i}`);
      values.push(typeof updates[key] === 'object' && !(updates[key] instanceof Date) ? JSON.stringify(updates[key]) : updates[key]);
      i++;
    }
  }
  if (fields.length === 0) return findById(id);
  values.push(id);
  const res = await query(
    `UPDATE technologies SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
    values
  );
  return res.rows[0] ? rowToTechnology(res.rows[0]) : null;
}

/** Map snake_case DB row to camelCase + ensure arrays. */
function rowToTechnology(row) {
  const r = row || {};
  return {
    id: String(r.id),
    name: r.name,
    description: r.description || '',
    category: r.category,
    difficulty: r.difficulty,
    relatedTechnologies: Array.isArray(r.related_technologies) ? r.related_technologies : (r.related_technologies ? JSON.parse(r.related_technologies) : []),
    projectIdeas: Array.isArray(r.project_ideas) ? r.project_ideas : (r.project_ideas ? JSON.parse(r.project_ideas) : []),
    learningResources: Array.isArray(r.learning_resources) ? r.learning_resources : (r.learning_resources ? JSON.parse(r.learning_resources) : []),
    status: r.status,
    updatedAt: r.updated_at,
  };
}

export async function findByIds(ids) {
  if (!ids || ids.length === 0) return [];
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
  const res = await query(
    `SELECT * FROM technologies WHERE id IN (${placeholders}) AND status = 'approved'`,
    ids
  );
  return res.rows.map(rowToTechnology);
}
