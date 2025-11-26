cat > src/index.ts <<'EOF'
import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { orchestrateJob } from './orchestrator';

dotenv.config();
const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// tiny id generator — no external library needed
function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;
}

app.get('/', (_req, res) => res.send('jury-ai orchestrator (prototype)'));

app.post('/debate', async (req, res) => {
  const { prompt, models, mode } = req.body;

  if (!prompt || !models || !Array.isArray(models) || models.length < 2) {
    return res.status(400).json({ error: 'Provide prompt and at least two models' });
  }

  const jobId = makeId();
  try {
    const result = await orchestrateJob({ jobId, prompt, models, mode });
    res.json({ jobId, result });
  } catch (err: any) {
    console.error('orchestrator error', err);
    res.status(500).json({ error: err.message || 'orchestrator failed' });
  }
});

app.listen(PORT, () => {
  console.log(`jury-ai listening on ${PORT}`);
});
EOF
