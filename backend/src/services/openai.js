/**
 * OpenAI service for typo correction, roadmap generation, explanations, skill-gap, and related techs.
 * All prompts are documented for transparency and tuning.
 */

import OpenAI from 'openai';
import { config } from '../config/index.js';

const openai = config.openai?.apiKey
  ? new OpenAI({ apiKey: config.openai.apiKey })
  : null;

const MODEL = 'gpt-4o-mini';

function ensureOpenAI() {
  if (!openai) {
    throw new Error('OPENAI_API_KEY is not set. AI features are disabled.');
  }
}

// ─── Typo correction / goal normalization ───────────────────────────────────
/**
 * Prompt: Normalize user goal input (typo-tolerant).
 * Example: "mren" → "MERN Stack", "full stak" → "Full Stack Developer"
 */
const TYPO_CORRECTION_PROMPT = `You are a career goal normalizer for developers. Given a possibly misspelled or vague learning goal, return a single clear, canonical goal phrase.

Rules:
- Fix typos (e.g. "mren" -> "MERN Stack", "full stak" -> "Full Stack Developer").
- If the input is already clear, return it with minimal editing (e.g. capitalize).
- Return ONLY the corrected goal phrase, no explanation, no quotes, no prefix.
- Keep it short (2-6 words). Examples: "MERN Stack Developer", "Frontend Expert", "DevOps Engineer", "AI/ML Engineer".`;

export async function correctGoalTypo(userInput) {
  ensureOpenAI();
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: TYPO_CORRECTION_PROMPT },
      { role: 'user', content: String(userInput).trim() || 'Full Stack Developer' },
    ],
    max_tokens: 50,
    temperature: 0.2,
  });
  const text = completion.choices[0]?.message?.content?.trim();
  return text || String(userInput).trim();
}

// ─── Roadmap generation ───────────────────────────────────────────────────
/**
 * Prompt: Generate a learning roadmap (steps with technologies, courses, project ideas).
 * Output must be valid JSON matching the roadmap schema.
 */
const ROADMAP_SYSTEM_PROMPT = `You are an expert learning path designer for software developers. Generate a structured learning roadmap as JSON.

Output a single JSON object with this exact structure (no markdown, no code block wrapper):
{
  "goal": "the normalized goal string",
  "steps": [
    {
      "stepName": "Step N: Short title",
      "technologies": [
        {
          "id": "slug-id",
          "name": "Display Name",
          "category": "frontend|backend|database|devops|ai",
          "difficulty": "beginner|intermediate|advanced",
          "description": "One sentence description"
        }
      ],
      "courses": [{"title": "Course or resource name", "url": "https://..."}],
      "projectIdeas": ["Idea 1", "Idea 2"],
      "relatedTechnologies": ["slug-id-1", "slug-id-2"]
    }
  ]
}

Rules:
- goal: use the user's goal (corrected if they had typos).
- steps: 4-8 steps, ordered from foundational to advanced.
- Each step should have at least one technology. Use slug-style id (e.g. "react", "nodejs", "postgresql").
- courses: 1-3 per step, real or plausible URLs.
- projectIdeas: 2-4 per step.
- relatedTechnologies: ids of related techs for graph connections.
- Be concrete and practical.`;

export async function generateRoadmapFromAI(userGoal, existingTechNames = []) {
  ensureOpenAI();
  const userMessage = existingTechNames.length
    ? `Goal: "${userGoal}". Optional existing technology names in the system: ${existingTechNames.slice(0, 30).join(', ')}. Use consistent ids where relevant.`
    : `Goal: "${userGoal}".`;
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: ROADMAP_SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 4000,
    temperature: 0.5,
    response_format: { type: 'json_object' },
  });
  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error('Empty roadmap response from AI');
  return JSON.parse(raw);
}

// ─── Explain technology ─────────────────────────────────────────────────────
const EXPLAIN_PROMPT = `You are a technical educator. Given a technology name and optional context, provide:
1. A clear 2-4 sentence explanation.
2. 3-5 concrete use cases.
3. Prerequisites (technologies or concepts) the learner should know first.

Respond with JSON only (no markdown):
{
  "explanation": "string",
  "useCases": ["string"],
  "prerequisites": ["string"]
}`;

export async function explainTechnology(technologyName, context = '') {
  ensureOpenAI();
  const userMessage = context
    ? `Technology: ${technologyName}. Context: ${context}`
    : `Technology: ${technologyName}`;
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: EXPLAIN_PROMPT },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 600,
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });
  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error('Empty explanation from AI');
  return JSON.parse(raw);
}

// ─── Skill gap analysis ──────────────────────────────────────────────────────
const SKILL_GAP_PROMPT = `You are a career advisor for developers. Given a list of technologies/skills the user already knows, suggest 4-8 skills they should learn next with a brief reason. Consider common career paths (full stack, DevOps, ML, etc.).

Respond with JSON only:
{
  "suggestions": [
    {
      "name": "Technology or skill name",
      "reason": "One sentence why this is a good next step",
      "category": "frontend|backend|database|devops|ai"
    }
  ]
}`;

export async function suggestSkillGap(knownSkills) {
  ensureOpenAI();
  const list = Array.isArray(knownSkills) ? knownSkills.join(', ') : String(knownSkills);
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: SKILL_GAP_PROMPT },
      { role: 'user', content: `Known skills: ${list}` },
    ],
    max_tokens: 800,
    temperature: 0.4,
    response_format: { type: 'json_object' },
  });
  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error('Empty skill-gap response from AI');
  return JSON.parse(raw);
}

// ─── Related technologies (for graph / search) ───────────────────────────────
const RELATED_TECH_PROMPT = `Given a technology name (and optional list of existing tech names), suggest 4-6 related technologies that a developer would typically learn next or use together. Return JSON only:
{
  "related": ["Technology A", "Technology B", ...]
}
Use exact names; prefer common ecosystem tools and languages.`;

export async function suggestRelatedTechnologyNames(technologyName, existingNames = []) {
  ensureOpenAI();
  const userMessage = existingNames.length
    ? `Technology: ${technologyName}. Existing in DB: ${existingNames.slice(0, 20).join(', ')}. Suggest related from this set when relevant, or add new ones.`
    : `Technology: ${technologyName}`;
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: RELATED_TECH_PROMPT },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 200,
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });
  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed.related) ? parsed.related : [];
}

// ─── Search / typo-tolerant technology search ───────────────────────────────
const SEARCH_PROMPT = `You are a search assistant for a developer knowledge graph. The user may have typos. Given their search query and a list of technology names (and ids), return the best matching technology names or ids.

Respond with JSON only:
{
  "matches": ["id1", "id2", ...]
}
If the query is vague (e.g. "frontend"), return multiple relevant ids. If one clear match (e.g. "react"), return that id. Use the exact ids from the list when possible.`;

export async function searchTechnologiesTypoTolerant(searchQuery, techList) {
  if (!searchQuery || !Array.isArray(techList) || techList.length === 0) {
    return [];
  }
  ensureOpenAI();
  const list = techList.map((t) => `${t.id}: ${t.name}`).join(', ');
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: SEARCH_PROMPT },
      { role: 'user', content: `Query: "${searchQuery}". Technologies: ${list}` },
    ],
    max_tokens: 150,
    temperature: 0.2,
    response_format: { type: 'json_object' },
  });
  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  const matches = Array.isArray(parsed.matches) ? parsed.matches : [];
  return matches.filter((id) => techList.some((t) => String(t.id) === String(id)));
}

// ─── Skill Gap Analysis (for dashboard charts) ───────────────────────────────
const GAP_ANALYSIS_PROMPT = `You are a developer career analyst. Given a user's current skills and a target role, produce a detailed skill gap analysis.

Respond with JSON only (no markdown, no code block):
{
  "coverage_percent": <0-100 overall coverage>,
  "readiness_score": <0-100 how ready they are>,
  "missingSkills": [
    { "name": "Skill Name", "priority": "high|medium|low", "category": "frontend|backend|database|devops|ai", "reason": "Why needed" }
  ],
  "categories": [
    { "name": "Frontend", "key": "frontend", "have": <0-10>, "need": <0-10> },
    { "name": "Backend", "key": "backend", "have": <0-10>, "need": <0-10> },
    { "name": "Database", "key": "database", "have": <0-10>, "need": <0-10> },
    { "name": "DevOps", "key": "devops", "have": <0-10>, "need": <0-10> },
    { "name": "AI / ML", "key": "ai", "have": <0-10>, "need": <0-10> }
  ],
  "readinessBreakdown": [
    { "name": "Mastered", "value": <percent> },
    { "name": "In Progress", "value": <percent> },
    { "name": "Missing", "value": <percent> }
  ]
}

Rules:
- Be realistic. If the user knows many skills matching the role, coverage_percent should be high.
- categories.have = how many relevant skills in that category the user knows (0-10 scale).
- categories.need = how many skills in that category the role typically requires (0-10 scale).
- missingSkills: list 4-8 key missing skills, prioritized.
- readinessBreakdown must sum to 100.`;

export async function analyzeSkillGap(currentSkills, targetRole) {
  ensureOpenAI();
  const skillList = currentSkills.length ? currentSkills.join(', ') : 'None';
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: GAP_ANALYSIS_PROMPT },
      { role: 'user', content: `Current skills: ${skillList}\nTarget role: ${targetRole}` },
    ],
    max_tokens: 1200,
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });
  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error('Empty gap analysis response from AI');
  return JSON.parse(raw);
}

