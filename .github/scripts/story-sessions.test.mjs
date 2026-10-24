import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { listSessions, resumeSession, startSession } from './story-sessions.mjs'

const temporaryRoots = []

function git(args, cwd) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
}

function createRepository({ existingSdlcArtifact = false } = {}) {
  const parent = mkdtempSync(path.join(os.tmpdir(), 'story-sessions-'))
  temporaryRoots.push(parent)
  const repoRoot = path.join(parent, 'sample-repo')
  const appRoot = path.join(repoRoot, 'sample-app')
  mkdirSync(appRoot, { recursive: true })
  git(['init', '-b', 'integration', repoRoot], parent)
  git(['-C', repoRoot, 'config', 'user.name', 'Session Test'], parent)
  git(['-C', repoRoot, 'config', 'user.email', 'session-test@example.invalid'], parent)
  writeFileSync(path.join(appRoot, 'README.md'), 'baseline\n')
  if (existingSdlcArtifact) {
    const legacyArtifact = path.join(appRoot, 'docs', 'sdlc')
    mkdirSync(legacyArtifact, { recursive: true })
    writeFileSync(path.join(legacyArtifact, 'requirements.md'), 'Story 1 legacy requirements\n')
  }
  git(['-C', repoRoot, 'add', '.'], parent)
  git(['-C', repoRoot, 'commit', '-m', 'integration baseline'], parent)
  return { parent, repoRoot, appRoot }
}

test.after(() => {
  for (const root of temporaryRoots) rmSync(root, { recursive: true, force: true })
})

test('starts two isolated worktrees from integration and discovers them without a registry', () => {
  const { repoRoot } = createRepository()
  const first = startSession({ cwd: repoRoot, applicationRoot: 'sample-app', storyId: 'STORY-1', baseBranch: 'integration' })
  const firstOpened = startSession({ cwd: first.worktree, applicationRoot: 'sample-app', storyId: 'STORY-1', baseBranch: 'integration' })
  writeFileSync(path.join(first.worktree, 'sample-app', 'story-1.txt'), 'unfinished story 1\n')

  const second = startSession({ cwd: repoRoot, applicationRoot: 'sample-app', storyId: 'STORY-2', baseBranch: 'integration' })
  const sessions = listSessions({ cwd: repoRoot, applicationRoot: 'sample-app' })

  assert.notEqual(first.worktree, second.worktree)
  assert.notEqual(first.branch, second.branch)
  assert.equal(first.baseBranch, 'integration')
  assert.equal(second.baseBranch, 'integration')
  assert.equal(first.isCurrentWorktree, false)
  assert.equal(firstOpened.alreadyExists, true)
  assert.equal(firstOpened.isCurrentWorktree, true)
  assert.equal(second.isCurrentWorktree, false)
  assert.equal(first.sdlcArtifactDirectory, 'sample-app/docs/sdlc/stories/STORY-1')
  assert.equal(second.sdlcArtifactDirectory, 'sample-app/docs/sdlc/stories/STORY-2')
  assert.equal(readFileSync(path.join(first.worktree, 'sample-app', 'story-1.txt'), 'utf8'), 'unfinished story 1\n')
  assert.deepEqual(sessions.map((session) => session.storyId).sort(), ['STORY-1', 'STORY-2'])
  assert.equal(sessions.every((session) => session.worktree), true)
  assert.equal(existsSync(path.join(repoRoot, '.git', 'copilot-story-sessions.json')), false)
})

test('isolates managed story artifacts from SDLC files already on the integration branch', () => {
  const { repoRoot } = createRepository({ existingSdlcArtifact: true })
  const storyTwo = startSession({ cwd: repoRoot, applicationRoot: 'sample-app', storyId: 'STORY-2', baseBranch: 'integration' })
  const legacyRequirements = path.join(storyTwo.worktree, 'sample-app', 'docs', 'sdlc', 'requirements.md')
  const storyTwoRequirements = path.join(storyTwo.worktree, storyTwo.sdlcArtifactDirectory, 'requirements.md')
  mkdirSync(path.dirname(storyTwoRequirements), { recursive: true })
  writeFileSync(storyTwoRequirements, 'Story 2 requirements\n')

  assert.equal(storyTwo.sdlcArtifactDirectory, 'sample-app/docs/sdlc/stories/STORY-2')
  assert.equal(readFileSync(legacyRequirements, 'utf8').replace(/\r\n/g, '\n'), 'Story 1 legacy requirements\n')
  assert.equal(readFileSync(storyTwoRequirements, 'utf8'), 'Story 2 requirements\n')
  assert.notEqual(path.resolve(legacyRequirements), path.resolve(storyTwoRequirements))
})

test('resumes the selected story and reattaches its existing branch when the worktree is absent', () => {
  const { repoRoot } = createRepository()
  const created = startSession({ cwd: repoRoot, applicationRoot: 'sample-app', storyId: 'STORY-1', baseBranch: 'integration' })
  const directResume = resumeSession({ cwd: repoRoot, applicationRoot: 'sample-app', storyId: 'STORY-1' })
  assert.equal(directResume.worktree, created.worktree)
  assert.equal(directResume.isCurrentWorktree, false)
  assert.equal(resumeSession({ cwd: created.worktree, applicationRoot: 'sample-app', storyId: 'STORY-1' }).isCurrentWorktree, true)

  git(['worktree', 'remove', created.worktree], repoRoot)
  const reattached = resumeSession({ cwd: repoRoot, applicationRoot: 'sample-app', storyId: 'STORY-1' })

  assert.equal(reattached.worktree, created.worktree)
  assert.equal(reattached.isCurrentWorktree, false)
  assert.ok(listSessions({ cwd: repoRoot, applicationRoot: 'sample-app' }).some((session) => session.storyId === 'STORY-1'))
})

test('rejects collisions and invalid IDs without changing existing work', () => {
  const { repoRoot } = createRepository()
  const created = startSession({ cwd: repoRoot, applicationRoot: 'sample-app', storyId: 'STORY-1', baseBranch: 'integration' })
  writeFileSync(path.join(created.worktree, 'sample-app', 'unfinished.txt'), 'preserve me\n')

  assert.throws(
    () => startSession({ cwd: repoRoot, applicationRoot: 'sample-app', storyId: 'STORY-1', baseBranch: 'integration' }),
    /already exists/,
  )
  assert.throws(
    () => startSession({ cwd: repoRoot, applicationRoot: 'sample-app', storyId: '../escape', baseBranch: 'integration' }),
    /Story ID/,
  )
  assert.equal(readFileSync(path.join(created.worktree, 'sample-app', 'unfinished.txt'), 'utf8'), 'preserve me\n')
})

test('leaves dirty work in the current checkout untouched when starting a story', () => {
  const { repoRoot, appRoot } = createRepository()
  const currentFile = path.join(appRoot, 'README.md')
  writeFileSync(currentFile, 'existing uncommitted work\n')
  const statusBefore = git(['-C', repoRoot, 'status', '--porcelain'], repoRoot)

  const session = startSession({ cwd: repoRoot, applicationRoot: 'sample-app', storyId: 'STORY-NEW', baseBranch: 'integration' })

  assert.equal(readFileSync(currentFile, 'utf8'), 'existing uncommitted work\n')
  assert.equal(git(['-C', repoRoot, 'status', '--porcelain'], repoRoot), statusBefore)
  assert.equal(readFileSync(path.join(session.worktree, 'sample-app', 'README.md'), 'utf8').replace(/\r\n/g, '\n'), 'baseline\n')
})