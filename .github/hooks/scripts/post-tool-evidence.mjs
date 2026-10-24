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

function collectStrings(value, output = []) {
  if (typeof value === "string") {
    output.push(value);
    return output;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectStrings(item, output);
    }

    return output;
  }

  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      collectStrings(item, output);
    }
  }

  return output;
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
     * Audit logging is best-effort.
     * It must not break successful tool execution.
     */
  }
}

const payload = await readInput();

const toolName = String(
  payload.toolName ??
    payload.tool_name ??
    "unknown"
);

const sessionId =
  payload.sessionId ??
  payload.session_id ??
  "unknown";

appendAuditRecord({
  event: "postToolUse",
  sessionId,
  toolName,
  timestamp: new Date().toISOString()
});

if (!["bash", "powershell"].includes(toolName.toLowerCase())) {
  process.stdout.write("{}");
  process.exit(0);
}

const toolArgs =
  payload.toolArgs ??
  payload.tool_input ??
  {};

const commandText = collectStrings(toolArgs)
  .join(" ")
  .replace(/\s+/g, " ")
  .trim();

const verificationPatterns = [
  /\bnpm\s+test\b/i,
  /\bnpm\s+run\s+test(?::browser)?\b/i,
  /\bnpm\s+run\s+lint\b/i,
  /\bnpm\s+run\s+build\b/i,
  /\bnpx\s+tsc\b/i,
  /\bnpm\s+audit\b/i
];

const isVerificationCommand =
  verificationPatterns.some((pattern) =>
    pattern.test(commandText)
  );

if (!isVerificationCommand) {
  process.stdout.write("{}");
  process.exit(0);
}

process.stdout.write(
  JSON.stringify({
    additionalContext:
      "SDLC evidence reminder: a verification command just completed. Record the exact command and its actual result in the appropriate implementation, review, verification, or PR evidence artifact. Do not claim PASS unless the executed output supports it."
  })
);