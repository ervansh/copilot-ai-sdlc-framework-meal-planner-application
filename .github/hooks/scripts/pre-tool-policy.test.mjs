import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const policyPath = fileURLToPath(
  new URL("./pre-tool-policy.mjs", import.meta.url)
);

function evaluate(command, toolName = "powershell") {
  const result = spawnSync(process.execPath, [policyPath], {
    encoding: "utf8",
    input: JSON.stringify({
      toolName,
      toolArgs: { command }
    })
  });

  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test("denies force push", () => {
  const decision = evaluate("git push --force");

  assert.equal(decision.permissionDecision, "deny");
});

test("denies pull request merge", () => {
  const decision = evaluate("gh pr merge 123");

  assert.equal(decision.permissionDecision, "deny");
});

test("leaves normal push to the regular permission flow", () => {
  const decision = evaluate("git push origin feature/example");

  assert.deepEqual(decision, {});
});

test("does not inspect non-shell tool arguments", () => {
  const decision = evaluate("git push --force", "read");

  assert.deepEqual(decision, {});
});