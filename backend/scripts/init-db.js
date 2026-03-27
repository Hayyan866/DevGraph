/**
 * Create database and run schema.
 * Usage: node scripts/init-db.js
 * Expects DATABASE_URL in .env (e.g. postgresql://user:pass@localhost:5432/devgraph)
 * Create the DB first: createdb devgraph
 */
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set in .env');
  process.exit(1);
}

const client = new pg.Client({ connectionString });
client.connect().then(() => client.query(schema))
  .then(() => {
    console.log('Schema applied successfully.');
    return client.end();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
