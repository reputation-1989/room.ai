# jury-ai (MVP scaffold)

Two-role LLM debate orchestrator (prototype).
Runs using a fake model first (no API key needed).

## How to run (in GitHub Codespaces)
1. Open this repo in Codespaces.
2. Terminal: `npm install`
3. Terminal: `npm run dev`
4. Test with:

curl -s -X POST http://localhost:3000/debate -H "Content-Type: application/json" -d '{
  "prompt":"Solve this sample problem: implement a function that prints 42",
  "models":[
    {"id":"A","role":"Competitive programmer"},
    {"id":"B","role":"Formal verifier"}
  ],
  "mode":"adversarial"
}'
