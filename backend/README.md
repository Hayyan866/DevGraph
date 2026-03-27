# DevGraph Backend

Production-ready Node.js + Express + PostgreSQL API for the AI Developer Knowledge Graph. Uses JWT auth, role-based access, and OpenAI for roadmap generation, typo-tolerant search, skill-gap analysis, and technology explanations.

## Tech Stack

- **Node.js** + **Express**
- **PostgreSQL**
- **JWT** (auth, roles: `admin` / `user`)
- **OpenAI** (roadmap, explain, skill-gap, typo correction, related techs)
- **dotenv** for env vars

## Setup

1. **Install dependencies**

   ```bash
   cd backend && npm install
   ```

2. **PostgreSQL**

   - Create a database: `createdb devgraph`
   - Set `DATABASE_URL` in `.env` (copy from `.env.example`)

3. **Environment**

   ```bash
   cp .env.example .env
   # Edit .env: DATABASE_URL, JWT_SECRET, OPENAI_API_KEY
   ```

4. **Schema & seed**

   ```bash
   npm run db:init
   npm run db:seed
   ```

5. **Run**

   ```bash
   npm run dev
   ```

   API runs at `http://localhost:3001` (or `PORT` from `.env`).

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | - | Register (name, email, password) |
| POST | `/api/auth/login` | - | Login → JWT |
| GET | `/api/technologies` | - | List approved technologies |
| GET | `/api/technologies/:id` | - | Get one technology |
| GET | `/api/technologies/search/:name` | - | Typo-tolerant search (AI) |
| GET | `/api/technologies/:id/related` | - | Related technologies (AI if empty) |
| POST | `/api/technologies` | admin | Add technology |
| POST | `/api/learning-path` | user | Create learning path (goal → AI roadmap, saved) |
| GET | `/api/learning-path/user/:id` | user | User’s learning paths |
| POST | `/api/learning-progress` | user | Update tech status (technology_id, status) |
| GET | `/api/learning-progress/user/:id` | user | User’s progress |
| POST | `/api/ai/generate-roadmap` | - | AI roadmap only (goal) |
| POST | `/api/ai/explain` | - | Explain tech (technology_id or technology_name) |
| POST | `/api/ai/skill-gap` | - | Suggest next skills (known_skills[]) |

## Example AI Prompts (see `src/services/openai.js`)

- **Typo correction:** Normalize goal (e.g. "mren" → "MERN Stack").
- **Roadmap:** JSON with steps (technologies, courses, projectIdeas, relatedTechnologies).
- **Explain:** explanation, useCases, prerequisites.
- **Skill-gap:** suggestions with name, reason, category.
- **Related techs:** list of related technology names.
- **Search:** typo-tolerant match against technology list.

## Seed Data

- Approved technologies (HTML, CSS, JS, React, Node, etc.).
- Admin user: `admin@devgraph.local` / `admin123` (change in production).

## Frontend Integration

Set in frontend `.env`:

```env
VITE_API_URL=http://localhost:3001
```

Then run frontend (`npm run dev` in `frontend/`). Auth, roadmap save, dashboard paths/progress, and AI features use the backend.
