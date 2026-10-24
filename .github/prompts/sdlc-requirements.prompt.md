# SDLC Requirements — Source Driven

Use the `requirements-analyst` agent and `requirements-analysis` skill.

Provide explicit values in the chat:

```text
Application: <name>
Application Root: <application-root>
Story ID: <stable-story-id, when managed>
SDLC Artifact Directory: <resolved-sdlc-artifact-directory>
Source Type: <JIRA | CONFLUENCE | WORD>
Source Reference: <reference>
```

Target:

`<SDLC Artifact Directory>/requirements.md`

Workflow:

1. retrieve/read the source
2. report source provenance and explicit facts
3. ask only material clarification questions
4. wait for human answers
5. repeat until blocking questions = 0
6. create requirements.md as PENDING APPROVAL
7. stop for explicit human approval
8. after explicit approval, record APPROVED

Do not invent the source story.
Do not use another application's paths.
A requirements commit is optional operational evidence and is not an Architecture entry gate.
