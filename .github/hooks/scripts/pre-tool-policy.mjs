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
    return null;
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

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      permissionDecision: "deny",
      permissionDecisionReason: reason
    })
  );
}

const payload = await readInput();

if (!payload) {
  deny(
    "SDLC pre-tool policy could not parse the tool request. Tool execution is denied rather than bypassing the safety policy."
  );

  process.exit(0);
}

const toolName = String(
  payload.toolName ??
    payload.tool_name ??
    ""
).toLowerCase();

/*
 * Only inspect shell-execution tools.
 *
 * This prevents text written to README files or other source files from being
 * blocked merely because it contains examples such as "git push --force".
 */
if (!["bash", "powershell"].includes(toolName)) {
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

const rules = [
  {
    pattern: /\bgit\s+push\b[^;&|]*(?:--force-with-lease|--force|-f(?:\s|$))/i,
    reason:
      "Force-pushing is blocked by the Agentic SDLC repository policy. A human must perform any history-rewriting push explicitly."
  },
  {
    pattern: /\bgit\s+push\b[^;&|]*--delete\b/i,
    reason:
      "Remote branch deletion is blocked by the Agentic SDLC repository policy."
  },
  {
    pattern: /\bgit\s+reset\s+--hard\b/i,
    reason:
      "git reset --hard is blocked because it can destroy uncommitted repository work."
  },
  {
    pattern: /\bgit\s+clean\b[^;&|]*-[a-z]*f[a-z]*\b/i,
    reason:
      "Forced git clean is blocked because it can permanently delete untracked work."
  },
  {
    pattern: /\bgit\s+branch\s+-D\b/i,
    reason:
      "Forced branch deletion is blocked by the Agentic SDLC repository policy."
  },
  {
    pattern: /\bgit\s+checkout\s+--\s+\.\s*(?:$|[;&|])/i,
    reason:
      "Destructive checkout of the working tree is blocked because it can discard user changes."
  },
  {
    pattern: /\bgit\s+restore\s+(?:--worktree\s+)?\.\s*(?:$|[;&|])/i,
    reason:
      "Repository-wide destructive restore is blocked because it can discard user changes."
  },
  {
    pattern: /\bgh\s+pr\s+merge\b/i,
    reason:
      "Automated pull-request merging is blocked. The framework stops at human PR review."
  },
  {
    pattern: /\bgh\s+repo\s+delete\b/i,
    reason:
      "Repository deletion is blocked by the Agentic SDLC safety policy."
  },
  {
    pattern: /\bnpm\s+audit\s+fix\b[^;&|]*--force\b/i,
    reason:
      "npm audit fix --force is blocked because it can introduce unreviewed breaking dependency changes."
  },
  {
    pattern: /\brm\s+-[a-z]*rf[a-z]*\s+(?:\/|\.|\.\.|\.git)(?:\s|$)/i,
    reason:
      "Broad recursive filesystem deletion is blocked by the Agentic SDLC safety policy."
  },
  {
    pattern:
      /\bremove-item\b[^;&|]*-recurse\b[^;&|]*-force\b[^;&|]*(?:\.git|(?:^|\s)\.(?:\s|$))/i,
    reason:
      "Broad recursive PowerShell deletion is blocked by the Agentic SDLC safety policy."
  }
];

for (const rule of rules) {
  if (rule.pattern.test(commandText)) {
    deny(rule.reason);
    process.exit(0);
  }
}

/*
 * Returning an empty object leaves the normal Copilot permission flow intact.
 * This hook only denies commands matching an explicit safety rule.
 */
process.stdout.write("{}");