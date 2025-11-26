import { fakeModelCall } from './remote_adapters';
import { runSandboxTests } from './sandbox';

export async function orchestrateJob(job: any) {
  const { jobId, prompt, models } = job;
  const transcript: any[] = [];

  // Phase 1: Independent answers
  const answers: Record<string, any> = {};
  for (const m of models) {
    const resp = await fakeModelCall(m, [
      { role: 'system', content: m.role || 'You are an assistant.' },
      { role: 'user', content: prompt }
    ]);
    transcript.push({ phase: 'independent', from: m.id, content: resp });
    answers[m.id] = resp;
  }

  // Phase 2: Cross-examination
  const crossQ: Record<string, any> = {};
  for (const m of models) {
    const other = models.find((x: any) => x.id !== m.id);
    const input = [
      { role: 'system', content: m.role || 'You are an assistant.' },
      { role: 'user', content: `Here is opponent ${other.id}'s answer:\n\n${answers[other.id].text}\n\nFind flaws and propose tests.` }
    ];
    const resp = await fakeModelCall(m, input);
    transcript.push({ phase: 'cross_q', from: m.id, content: resp });
    crossQ[m.id] = resp;
  }

  // Phase 3: Refute and patch
  const patched: Record<string, any> = {};
  for (const m of models) {
    const input = [
      { role: 'system', content: m.role || 'You are an assistant.' },
      { role: 'user', content: `You received critique:\n\n${crossQ[m.id].text}\n\nPatch or defend your solution and provide tests.` }
    ];
    const resp = await fakeModelCall(m, input);
    transcript.push({ phase: 'refute', from: m.id, content: resp });
    patched[m.id] = resp;

    if (resp.code && resp.tests) {
      const sandboxResults = await runSandboxTests(resp.code, resp.tests);
      transcript.push({ phase: 'sandbox_result', from: m.id, content: sandboxResults });
      patched[m.id].sandbox = sandboxResults;
    }
  }

  // Phase 4: Simple scoring
  const scores: Record<string, number> = {};
  for (const m of models) {
    let score = 0;

    if (patched[m.id].sandbox) {
      score += (patched[m.id].sandbox.passed || 0) * 50;
    }

    const opponent = models.find((x: any) => x.id !== m.id);
    if (crossQ[opponent.id] && typeof crossQ[opponent.id].text === 'string') {
      if (crossQ[opponent.id].text.includes('fatal') || crossQ[opponent.id].text.includes('incorrect')) score -= 30;
    }

    scores[m.id] = score;
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const winner = sorted.length ? sorted[0][0] : null;

  return { jobId, winner, scores, transcript };
}
