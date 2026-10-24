import fs from "node:fs";
import path from "node:path";
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

function appendAuditRecord(record) {
  try {
    const gitDir = path.resolve(".git");

    if (!fs.existsSync(gitDir)) {
      return;
    }

    const logPath = path.join(
      gitDir,
      "copilot-hooks-audit.jsonl"
    );

    fs.appendFileSync(
      logPath,
      `${JSON.stringify(record)}\n`,
      "utf8"
    );
  } catch {
    /*
     * Error auditing must not create another agent failure.
     */
  }
}

const payload = await readInput();

appendAuditRecord({
  event: "errorOccurred",
  sessionId:
    payload.sessionId ??
    payload.session_id ??
    "unknown",
  errorName:
    payload.error?.name ??
    "unknown",
  errorContext:
    payload.errorContext ??
    payload.error_context ??
    "unknown",
  recoverable:
    payload.recoverable ?? null,
  timestamp: new Date().toISOString()
});

/*
 * errorOccurred is notification-only.
 * No stdout decision is required.
 */