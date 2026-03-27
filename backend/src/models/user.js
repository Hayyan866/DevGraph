import { query } from '../config/db.js';

export async function createUser({ name, email, passwordHash, role = 'user' }) {
  const res = await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at`,
    [name, email, passwordHash, role]
  );
  return res.rows[0];
}

export async function findByEmail(email) {
  const res = await query(
    'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
    [email]
  );
  return res.rows[0];
}

export async function findById(id) {
  const res = await query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
    [id]
  );
  return res.rows[0];
}
