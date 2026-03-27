/**
 * Seed approved technologies and optional admin user for testing.
 * Run after init-db: npm run db:seed
 */
import bcrypt from 'bcryptjs';
import { query } from '../src/config/db.js';

const SALT_ROUNDS = 10;

const sampleTechnologies = [
  { name: 'HTML', description: 'The standard markup language for web pages.', category: 'frontend', difficulty: 'beginner', related_technologies: ['css', 'javascript'], project_ideas: ['Portfolio', 'Blog layout', 'Landing page'] },
  { name: 'CSS', description: 'Stylesheet language for presentation.', category: 'frontend', difficulty: 'beginner', related_technologies: ['html', 'tailwind', 'javascript'], project_ideas: ['Dashboard UI', 'Responsive site'] },
  { name: 'JavaScript', description: 'Programming language of the web.', category: 'frontend', difficulty: 'beginner', related_technologies: ['typescript', 'react', 'nodejs'], project_ideas: ['Todo app', 'Weather widget'] },
  { name: 'TypeScript', description: 'Typed superset of JavaScript.', category: 'frontend', difficulty: 'intermediate', related_technologies: ['javascript', 'react', 'nodejs'], project_ideas: ['Type-safe API client', 'CLI tool'] },
  { name: 'React', description: 'Library for building user interfaces.', category: 'frontend', difficulty: 'intermediate', related_technologies: ['javascript', 'typescript', 'nextjs'], project_ideas: ['Todo app', 'Chat UI', 'E-commerce frontend'] },
  { name: 'Node.js', description: 'JavaScript runtime for server-side applications.', category: 'backend', difficulty: 'intermediate', related_technologies: ['javascript', 'express', 'mongodb'], project_ideas: ['REST API', 'Real-time chat server'] },
  { name: 'Express', description: 'Minimal web framework for Node.js.', category: 'backend', difficulty: 'intermediate', related_technologies: ['nodejs', 'mongodb', 'postgresql'], project_ideas: ['REST API', 'Auth server'] },
  { name: 'PostgreSQL', description: 'Powerful open-source relational database.', category: 'database', difficulty: 'intermediate', related_technologies: ['nodejs', 'express', 'django'], project_ideas: ['Inventory system', 'Multi-tenant SaaS'] },
  { name: 'MongoDB', description: 'NoSQL document database.', category: 'database', difficulty: 'intermediate', related_technologies: ['nodejs', 'express'], project_ideas: ['User management', 'CMS'] },
  { name: 'Docker', description: 'Containerization platform.', category: 'devops', difficulty: 'intermediate', related_technologies: ['kubernetes', 'nodejs'], project_ideas: ['Containerize web app', 'Docker Compose stack'] },
  { name: 'Python', description: 'High-level programming language.', category: 'backend', difficulty: 'beginner', related_technologies: ['django', 'flask', 'ml'], project_ideas: ['Web scraper', 'Data analysis'] },
  { name: 'Machine Learning', description: 'AI subset for systems that learn from data.', category: 'ai', difficulty: 'advanced', related_technologies: ['python', 'tensorflow', 'pytorch'], project_ideas: ['Image classifier', 'Recommendation engine'] },
];

async function seed() {
  for (const t of sampleTechnologies) {
    await query(
      `INSERT INTO technologies (name, description, category, difficulty, related_technologies, project_ideas, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'approved')`,
      [t.name, t.description, t.category, t.difficulty, JSON.stringify(t.related_technologies), JSON.stringify(t.project_ideas)]
    );
  }
  const hash = await bcrypt.hash('admin123', SALT_ROUNDS);
  await query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO NOTHING`,
    ['Admin', 'admin@devgraph.local', hash]
  );
  console.log('Seed completed: technologies and admin user (admin@devgraph.local / admin123)');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
