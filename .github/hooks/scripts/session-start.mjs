import process from "node:process";

async function readInput() {
  let input = "";

  for await (const chunk of process.stdin) {
    input += chunk;
  }

  if (!input.trim()) {
    return {};
  }

  try {
    return JSON.parse(input);
  } catch {
    return {};
  }
}

await readInput();

const additionalContext = `
Agentic SDLC repository guardrails are active.

Before performing lifecycle work:

1. Read .github/copilot-instructions.md.

2. Respect lifecycle artifact ownership:
   - Requirements Approval -> requirements.md
   - Architecture Approval -> architecture.md
   - Design Review Outcome -> design-review.md
   - Implementation Plan Approval and task status -> impl-plan.md
   - Implementation evidence -> implementation-log.md
   - Code Review Outcome -> code-review.md
   - Final Verification Outcome -> verification.md
   - Pull Request evidence -> pull-request.md

3. Never infer human approval.

4. Historical review metadata must not override later approval stored in the
   authoritative artifact.

5. Do not claim tests, builds, Git operations, remote pushes, or pull requests
   succeeded unless they were actually executed successfully.

6. Independent review agents must report required corrections rather than
   silently modifying reviewed production code.

7. Preserve human approval and acceptance gates.

8. If environment capability is unavailable, record the limitation instead of
   fabricating completion.
`.trim();

process.stdout.write(
  JSON.stringify({
    additionalContext
  })
);