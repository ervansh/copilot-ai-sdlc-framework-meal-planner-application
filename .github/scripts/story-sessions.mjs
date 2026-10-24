import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, realpathSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function fail(message) {
  throw new Error(message)
}

function git(args, cwd, { allowFailure = false } = {}) {
  try {
    return execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim()
  } catch (error) {
    if (allowFailure) return undefined
    fail(error.stderr?.toString().trim() || `git ${args[0]} failed.`)
  }
}

function repositoryContext(cwd = process.cwd()) {
  const worktreeRoot = git(['rev-parse', '--show-toplevel'], cwd)
  const commonDir = path.resolve(worktreeRoot, git(['rev-parse', '--git-common-dir'], worktreeRoot))
  if (path.basename(commonDir) !== '.git' || !existsSync(commonDir)) {
    fail('Story sessions require a non-bare Git repository with a .git directory.')
  }

  const repoRoot = path.dirname(commonDir)
  if (git(['rev-parse', '--is-bare-repository'], worktreeRoot) !== 'false') {
    fail('Story sessions are not supported in a bare Git repository.')
  }
  return { repoRoot: realpathSync(repoRoot), currentWorktree: realpathSync(worktreeRoot) }
}

function normalizeStoryId(storyId) {
  if (typeof storyId !== 'string' || !/^[A-Za-z0-9](?:[A-Za-z0-9._-]{0,78}[A-Za-z0-9])?$/.test(storyId)) {
    fail('Story ID must start and end with a letter or number and contain only letters, numbers, dot, underscore, or hyphen (max 80 characters).')
  }
  return storyId.toUpperCase()
}

function applicationPath(repoRoot, applicationRoot) {
  if (typeof applicationRoot !== 'string' || !applicationRoot.trim() || path.isAbsolute(applicationRoot)) {
    fail('Application Root must be a non-empty path relative to the repository root.')
  }
  if (applicationRoot.split(/[\\/]/).includes('..')) {
    fail('Application Root must not contain parent-directory traversal.')
  }

  const resolved = path.resolve(repoRoot, applicationRoot)
  const relative = path.relative(repoRoot, resolved)
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    fail('Application Root must be inside the repository.')
  }

  let existingAncestor = resolved
  const missingSegments = []
  while (!existsSync(existingAncestor)) {
    missingSegments.unshift(path.basename(existingAncestor))
    existingAncestor = path.dirname(existingAncestor)
  }
  const canonical = path.join(realpathSync(existingAncestor), ...missingSegments)
  const canonicalRelative = path.relative(repoRoot, canonical)
  if (canonicalRelative === '..' || canonicalRelative.startsWith(`..${path.sep}`) || path.isAbsolute(canonicalRelative)) {
    fail('Application Root resolves outside the repository.')
  }
  return canonicalRelative ? canonicalRelative.split(path.sep).join('/') : '.'
}

function applicationKey(applicationRoot) {
  const normalizedRoot = process.platform === 'win32' ? applicationRoot.toLowerCase() : applicationRoot
  return createHash('sha256').update(normalizedRoot).digest('hex').slice(0, 12)
}

function deriveSession(applicationRoot, inputStoryId, repoRoot) {
  const storyId = normalizeStoryId(inputStoryId)
  const appKey = applicationKey(applicationRoot)
  const branch = `story/${appKey}/${storyId}`
  const worktree = path.join(
    path.dirname(repoRoot),
    `${path.basename(repoRoot)}-story-worktrees`,
    appKey,
    storyId.toLowerCase(),
  )
  const sdlcArtifactDirectory = path.posix.join(
    applicationRoot === '.' ? '' : applicationRoot,
    'docs/sdlc/stories',
    storyId,
  )
  return { applicationRoot, storyId, branch, worktree, sdlcArtifactDirectory }
}

function worktreeInventory(repoRoot) {
  const output = git(['worktree', 'list', '--porcelain'], repoRoot)
  const entries = []
  let entry
  for (const line of output.split(/\r?\n/)) {
    if (!line) {
      if (entry) entries.push(entry)
      entry = undefined
      continue
    }
    if (line.startsWith('worktree ')) {
      entry = { path: path.resolve(line.slice('worktree '.length)) }
    } else if (entry && line.startsWith('branch ')) {
      entry.branch = line.slice('branch '.length).replace(/^refs\/heads\//, '')
    } else if (entry && line === 'detached') {
      entry.detached = true
    } else if (entry && line.startsWith('prunable')) {
      entry.prunable = true
    }
  }
  if (entry) entries.push(entry)
  return entries
}

function verifyLocalBranch(repoRoot, branch) {
  if (!git(['check-ref-format', '--branch', branch], repoRoot, { allowFailure: true })) {
    fail(`Story ID produces an invalid Git branch name: ${branch}`)
  }
}

function verifyIntegrationBranch(repoRoot, branch) {
  if (!branch || !git(['check-ref-format', '--branch', branch], repoRoot, { allowFailure: true })) {
    fail('Specify a valid local integration branch with --base-branch.')
  }
  if (git(['show-ref', '--verify', '--quiet', `refs/heads/${branch}`], repoRoot, { allowFailure: true }) === undefined) {
    fail(`Integration branch does not exist as a local branch: ${branch}`)
  }
}

export function startSession({ cwd = process.cwd(), applicationRoot, storyId, baseBranch }) {
  const { repoRoot, currentWorktree } = repositoryContext(cwd)
  const normalizedRoot = applicationPath(repoRoot, applicationRoot)
  const session = deriveSession(normalizedRoot, storyId, repoRoot)
  verifyIntegrationBranch(repoRoot, baseBranch)
  verifyLocalBranch(repoRoot, session.branch)

  const inventory = worktreeInventory(repoRoot)
  const existingWorktree = inventory.find((item) => item.branch === session.branch)
  if (existingWorktree) {
    if (existingWorktree.prunable || !existsSync(existingWorktree.path)) {
      fail(`Story branch has a missing worktree registration; preserving it for manual recovery: ${existingWorktree.path}`)
    }
    if (path.resolve(existingWorktree.path) !== path.resolve(session.worktree)) {
      fail(`Story branch is checked out at a non-standard path; use that worktree or inspect it manually: ${existingWorktree.path}`)
    }
    if (path.resolve(existingWorktree.path) !== path.resolve(currentWorktree)) {
      fail(`Story worktree already exists; use RESUME and open its path: ${existingWorktree.path}`)
    }
    return {
      action: 'START',
      baseBranch,
      alreadyExists: true,
      isCurrentWorktree: path.resolve(existingWorktree.path) === path.resolve(currentWorktree),
      ...session,
    }
  }
  if (existsSync(session.worktree)) {
    fail(`Story worktree path already exists without its expected branch; preserving it: ${session.worktree}`)
  }
  if (git(['show-ref', '--verify', '--quiet', `refs/heads/${session.branch}`], repoRoot, { allowFailure: true }) !== undefined) {
    fail(`Story branch already exists; use RESUME or inspect it manually: ${session.branch}`)
  }

  mkdirSync(path.dirname(session.worktree), { recursive: true })
  git(['worktree', 'add', '-b', session.branch, session.worktree, baseBranch], repoRoot)
  return {
    action: 'START',
    baseBranch,
    isCurrentWorktree: path.resolve(session.worktree) === path.resolve(currentWorktree),
    ...session,
  }
}

export function resumeSession({ cwd = process.cwd(), applicationRoot, storyId }) {
  const { repoRoot, currentWorktree } = repositoryContext(cwd)
  const normalizedRoot = applicationPath(repoRoot, applicationRoot)
  const session = deriveSession(normalizedRoot, storyId, repoRoot)
  verifyLocalBranch(repoRoot, session.branch)

  const inventory = worktreeInventory(repoRoot)
  const existing = inventory.find((item) => item.branch === session.branch)
  if (existing) {
    if (existing.prunable || !existsSync(existing.path)) {
      fail(`Story branch has a missing worktree registration; preserving it for manual recovery: ${existing.path}`)
    }
    if (path.resolve(existing.path) !== path.resolve(session.worktree)) {
      fail(`Story branch is checked out at a non-standard path; use that worktree or inspect it manually: ${existing.path}`)
    }
    return {
      action: 'RESUME',
      isCurrentWorktree: path.resolve(existing.path) === path.resolve(currentWorktree),
      ...session,
    }
  }

  if (git(['show-ref', '--verify', '--quiet', `refs/heads/${session.branch}`], repoRoot, { allowFailure: true }) === undefined) {
    fail(`No story branch exists for ${normalizedRoot}/${session.storyId}. Use START to create it.`)
  }
  if (existsSync(session.worktree)) {
    fail(`Story worktree path exists but is not registered to its branch; preserving it: ${session.worktree}`)
  }
  git(['worktree', 'add', session.worktree, session.branch], repoRoot)
  return {
    action: 'RESUME',
    isCurrentWorktree: path.resolve(session.worktree) === path.resolve(currentWorktree),
    ...session,
  }
}

export function listSessions({ cwd = process.cwd(), applicationRoot }) {
  const { repoRoot, currentWorktree } = repositoryContext(cwd)
  const normalizedRoot = applicationPath(repoRoot, applicationRoot)
  const prefix = `story/${applicationKey(normalizedRoot)}/`
  return worktreeInventory(repoRoot)
    .filter((item) => item.branch?.startsWith(prefix))
    .map((item) => ({
      storyId: item.branch.slice(prefix.length),
      branch: item.branch,
      worktree: item.path,
      isCurrentWorktree: path.resolve(item.path) === path.resolve(currentWorktree),
      sdlcArtifactDirectory: path.posix.join(
        normalizedRoot === '.' ? '' : normalizedRoot,
        'docs/sdlc/stories',
        item.branch.slice(prefix.length),
      ),
      ...(item.prunable ? { unavailable: true } : {}),
    }))
}

function parseArguments(args) {
  const [command, ...rest] = args
  const options = {}
  const allowed = ['application-root', 'story-id', 'base-branch']
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index]
    if (!token.startsWith('--')) fail(`Unexpected argument: ${token}`)
    const key = token.slice(2)
    if (!allowed.includes(key)) fail(`Unknown option: ${token}`)
    const value = rest[index + 1]
    if (!value || value.startsWith('--')) fail(`Missing value for ${token}`)
    options[key] = value
    index += 1
  }
  return { command, options }
}

function printHelp() {
  process.stdout.write([
    'Story worktree management (discovered from Git):',
    '  node .github/scripts/story-sessions.mjs start --application-root <path> --story-id <id> --base-branch <local-branch>',
    '  node .github/scripts/story-sessions.mjs resume --application-root <path> --story-id <id>',
    '  node .github/scripts/story-sessions.mjs list --application-root <path>',
  ].join('\n') + '\n')
}

function runCli(args) {
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printHelp()
    return
  }
  const { command, options } = parseArguments(args)
  const common = {
    cwd: process.cwd(),
    applicationRoot: options['application-root'],
    storyId: options['story-id'],
  }
  let result
  if (command === 'start') {
    result = startSession({ ...common, baseBranch: options['base-branch'] })
  } else if (command === 'resume') {
    result = resumeSession(common)
  } else if (command === 'list') {
    result = listSessions(common)
  } else {
    fail(`Unknown session action: ${command}`)
  }
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  try {
    runCli(process.argv.slice(2))
  } catch (error) {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 1
  }
}