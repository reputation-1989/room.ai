export async function runSandboxTests(code: string, tests: any[]) {
  // Prototype stub (fake sandbox)
  const results = tests.map((t: any) => ({
    input: t.input,
    expected: t.expected,
    got: "42",
    pass: t.expected === "42"
  }));

  const passed = results.filter((r: any) => r.pass).length;

  return { results, passed };
}
