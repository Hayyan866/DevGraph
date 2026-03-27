import * as technologyModel from '../models/technology.js';
import * as openaiService from '../services/openai.js';

/** GET /api/technologies — list approved; if empty, AI can still drive roadmap. */
export async function list(req, res, next) {
  try {
    const techs = await technologyModel.findAllApproved();
    res.json(techs);
  } catch (err) {
    next(err);
  }
}

/** GET /api/technologies/:id */
export async function getById(req, res, next) {
  try {
    const id = req.params.id;
    const tech = await technologyModel.findById(id);
    if (!tech) {
      return res.status(404).json({ error: 'Technology not found' });
    }
    res.json(tech);
  } catch (err) {
    next(err);
  }
}

/** GET /api/technologies/search/:name — typo-tolerant search using AI. */
export async function search(req, res, next) {
  const name = req.params.name?.trim() || '';
  try {
    if (!name) return res.json([]);
    const all = await technologyModel.findAllApproved();
    if (all.length === 0) return res.json([]);
    const matchedIds = await openaiService.searchTechnologiesTypoTolerant(name, all);
    const results = all.filter((t) => matchedIds.includes(t.id));
    res.json(results);
  } catch (err) {
    if (err.message?.includes('OPENAI_API_KEY') && name) {
      const all = await technologyModel.findAllApproved();
      const q = name.toLowerCase();
      const fallback = all.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
      return res.json(fallback);
    }
    next(err);
  }
}

/** POST /api/technologies — admin only, add technology. */
export async function create(req, res, next) {
  try {
    const { name, description, category, difficulty, related_technologies, project_ideas, learning_resources, status } = req.body;
    if (!name || !category || !difficulty) {
      return res.status(400).json({ error: 'name, category, and difficulty are required' });
    }
    const tech = await technologyModel.create({
      name,
      description: description || '',
      category,
      difficulty,
      related_technologies: related_technologies || [],
      project_ideas: project_ideas || [],
      learning_resources: learning_resources || [],
      status: status || 'approved',
    });
    res.status(201).json(tech);
  } catch (err) {
    next(err);
  }
}

/** GET /api/technologies/:id/related — fetch related technologies (dynamic from DB or AI). */
export async function getRelated(req, res, next) {
  try {
    const tech = await technologyModel.findById(req.params.id);
    if (!tech) {
      return res.status(404).json({ error: 'Technology not found' });
    }
    const relatedIds = tech.relatedTechnologies || [];
    if (relatedIds.length === 0) {
      const names = await openaiService.suggestRelatedTechnologyNames(tech.name, [tech]);
      const all = await technologyModel.findAllApproved();
      const byName = new Map(all.map((t) => [t.name.toLowerCase(), t]));
      const resolved = names
        .map((n) => byName.get(n.toLowerCase()))
        .filter(Boolean);
      return res.json(resolved);
    }
    const related = await technologyModel.findByIds(relatedIds.map(String));
    res.json(related);
  } catch (err) {
    next(err);
  }
}
