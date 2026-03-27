import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import authRoutes from './routes/auth.js';
import technologyRoutes from './routes/technologies.js';
import learningPathRoutes from './routes/learningPath.js';
import learningProgressRoutes from './routes/learningProgress.js';
import aiRoutes from './routes/ai.js';
import userSkillsRoutes from './routes/userSkills.js';
import gapAnalysisRoutes from './routes/gapAnalysis.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/technologies', technologyRoutes);
app.use('/api/learning-path', learningPathRoutes);
app.use('/api/learning-progress', learningProgressRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/user-skills', userSkillsRoutes);
app.use('/api/gap-analysis', gapAnalysisRoutes);

app.get('/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

export default app;
