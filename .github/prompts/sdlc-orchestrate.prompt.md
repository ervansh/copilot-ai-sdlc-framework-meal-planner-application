# Run Complete Agentic SDLC

Use `sdlc-orchestrator`.

Provide:

```text
Application: <name>
Application Root: <application-root>
Run Mode: <START | RESUME>
Source Type: <JIRA | CONFLUENCE | WORD>
Source Reference: <reference>
Publish User Story to Confluence: <YES | NO>
```

Coordinate the complete lifecycle by invoking specialist custom agents.

Mandatory orchestration rules:
1. The orchestrator must use the `agent` tool for specialist work.
2. The orchestrator must not use shell execution or repository editing to perform specialist work.
3. Requirements may not be approved while material product questions remain.
4. Architecture may not invent missing product requirements.
5. Design Review must be performed by `design-reviewer` in a separate delegated context.
6. Implementation Planning must model dependency-blocked tasks accurately.
7. Implementation must produce changed-file evidence plus test/check evidence.
8. Code Review and Final Verification remain independent lifecycle stages.
9. External Jira/Confluence access must use MCP rather than direct credential-based REST calls.
10. Never merge the PR.

At every transition report:

```text
Delegated Agent: <agent-name>
Delegation Result: <status>
```
