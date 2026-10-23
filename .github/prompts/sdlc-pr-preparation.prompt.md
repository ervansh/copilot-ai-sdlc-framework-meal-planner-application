# SDLC Pull Request Preparation

Use `pr-preparer` and `pull-request-preparation`.

Provide:

```text
Application: <name>
Application Root: <application-root>
Story ID: <stable-story-id, when managed>
SDLC Artifact Directory: <resolved-sdlc-artifact-directory>
```

Entry gate:

Final Verification permits PR Preparation.

Prepare:

- `<application-root>/CHANGELOG.md`
- `<SDLC Artifact Directory>/pull-request.md`

Use Git for local operations and the configured GitHub MCP server for remote
pull-request operations. Inspect the repository, branch, remote, worktree,
diffs, and existing PR before preparing changes.

Before staging/committing PR changes, pushing, or creating a PR, present the
exact files/diff, proposed commit message, remote, head/base branches, title,
and complete body, then request one explicit per-run human approval. Do not
switch branches, discard work, include unrelated changes, use direct HTTP, read
credentials from configuration, or silently fall back to `gh`.

After approval, create the PR only if an equivalent PR does not already exist.
Read the created PR back through GitHub MCP and verify its URL, repository,
head, base, and open state. Report a blocked status if Git push authentication,
GitHub MCP authentication, or verification is unavailable.

Never force push or merge.
