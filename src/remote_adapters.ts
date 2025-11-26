export async function fakeModelCall(model: any, messages: any[]) {
  // Deterministic fake response
  const last = messages[messages.length - 1];
  const text = `(${model.id}) Response to: ${String(last.content).slice(0, 120)}`;

  const lower = String(last.content).toLowerCase();
  const isSolve = lower.includes('solve') || lower.includes('codeforces') || lower.includes('implement');

  const code = isSolve ? "def solve():\n    print(42)\n" : null;
  const tests = isSolve ? [{ input: "", expected: "42" }] : null;

  await new Promise((r) => setTimeout(r, 200));

  return { text, code, tests };
}
