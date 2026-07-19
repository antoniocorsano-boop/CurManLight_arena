param(
  [Parameter(Position = 0)]
  [ValidateSet("start", "checkpoint", "status", "handoff")]
  [string]$Command = "status",

  [string]$Goal = "",
  [string]$Message = "",
  [string]$Session = ""
)

$ErrorActionPreference = "Stop"

function Get-RepoRoot {
  $root = git rev-parse --show-toplevel 2>$null
  if (-not $root) { $root = (Get-Location).Path }
  return $root.Trim()
}

function Get-BranchName {
  $branch = git branch --show-current 2>$null
  if (-not $branch) { return "unknown" }
  return $branch.Trim()
}

function Get-Timestamp {
  return Get-Date -Format "yyyyMMdd_HHmmss"
}

function Get-HumanTime {
  return Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz"
}

function Get-LatestSession([string]$Root) {
  $sessionRoot = Join-Path $Root "session"
  if (-not (Test-Path $sessionRoot)) { return $null }
  $dirs = Get-ChildItem -LiteralPath $sessionRoot -Directory | Sort-Object Name -Descending
  if ($dirs.Count -eq 0) { return $null }
  return $dirs[0].FullName
}

function New-SessionFiles([string]$Root, [string]$SessionName, [string]$GoalText) {
  $sessionDir = Join-Path (Join-Path $Root "session") $SessionName
  New-Item -ItemType Directory -Force -Path $sessionDir | Out-Null

  $now = Get-HumanTime
  $branch = Get-BranchName
  if ([string]::IsNullOrWhiteSpace($GoalText)) {
    $GoalText = "Continue repository work with durable agent memory."
  }

  Set-Content -LiteralPath (Join-Path $sessionDir "session_state.md") -Encoding utf8 -Value @(
    "# Session State",
    "",
    "- Session: $SessionName",
    "- Repo: $Root",
    "- Branch: $branch",
    "- Started: $now",
    "- Updated: $now",
    "",
    "## Goal",
    $GoalText,
    "",
    "## Current Subtask",
    "Initialize or continue work using shared agent memory.",
    "",
    "## Loaded Skills",
    "- agent-memory protocol - preserve context across Codex, opencode, Copilot, and Claude.",
    "",
    "## Current Status",
    "Session created. Update this section as work progresses.",
    "",
    "## Plan",
    "- [ ] Gather relevant context.",
    "- [ ] Make the requested changes.",
    "- [ ] Verify and update handoff.",
    "",
    "## Assumptions",
    "- Session files are safe to commit because they must not contain secrets.",
    "",
    "## Blockers",
    "- None known."
  )

  Set-Content -LiteralPath (Join-Path $sessionDir "timeline.md") -Encoding utf8 -Value @(
    "# Timeline",
    "",
    "## $now",
    "- Session created.",
    "- Goal: $GoalText"
  )

  Set-Content -LiteralPath (Join-Path $sessionDir "files.md") -Encoding utf8 -Value @(
    "# Files",
    "",
    "## Inspected",
    "- `AGENTS.md` - shared agent startup instructions.",
    "",
    "## Changed",
    "- None yet.",
    "",
    "## Generated",
    "- `session/$SessionName/` - durable working-session memory."
  )

  Set-Content -LiteralPath (Join-Path $sessionDir "handoff.md") -Encoding utf8 -Value @(
    "# Handoff",
    "",
    "## Resume From Here",
    "Session `$SessionName` is active. Read `session_state.md` for current status and `timeline.md` for recent decisions.",
    "",
    "## Next Actions",
    "- Continue the current task.",
    "- Update session memory before stopping.",
    "",
    "## Watch Outs",
    "- Do not write secrets or large logs into session files."
  )

  return $sessionDir
}

function Resolve-Session([string]$Root, [string]$SessionName) {
  if (-not [string]::IsNullOrWhiteSpace($SessionName)) {
    return Join-Path (Join-Path $Root "session") $SessionName
  }
  return Get-LatestSession $Root
}

$repoRoot = Get-RepoRoot
$sessionRoot = Join-Path $repoRoot "session"
New-Item -ItemType Directory -Force -Path $sessionRoot | Out-Null

switch ($Command) {
  "start" {
    $name = if ([string]::IsNullOrWhiteSpace($Session)) { Get-Timestamp } else { $Session }
    $dir = New-SessionFiles $repoRoot $name $Goal
    Write-Output "Started session: $dir"
  }
  "checkpoint" {
    $dir = Resolve-Session $repoRoot $Session
    if (-not $dir -or -not (Test-Path $dir)) {
      $dir = New-SessionFiles $repoRoot (Get-Timestamp) $Goal
    }
    if ([string]::IsNullOrWhiteSpace($Message)) {
      $Message = "Checkpoint recorded."
    }
    $now = Get-HumanTime
    Add-Content -LiteralPath (Join-Path $dir "timeline.md") -Encoding utf8 -Value @(
      "",
      "## $now",
      "- $Message"
    )
    $statePath = Join-Path $dir "session_state.md"
    if (Test-Path $statePath) {
      (Get-Content -LiteralPath $statePath) -replace "^- Updated: .*$", "- Updated: $now" | Set-Content -LiteralPath $statePath -Encoding utf8
    }
    Write-Output "Checkpoint updated: $dir"
  }
  "handoff" {
    $dir = Resolve-Session $repoRoot $Session
    if (-not $dir -or -not (Test-Path $dir)) {
      throw "No session found. Run 'start' first."
    }
    Get-Content -LiteralPath (Join-Path $dir "handoff.md")
  }
  "status" {
    $dir = Resolve-Session $repoRoot $Session
    if (-not $dir) {
      Write-Output "No session found. Run: powershell -ExecutionPolicy Bypass -File scripts/agent-memory.ps1 start -Goal `"your goal`""
      exit 0
    }
    Write-Output "Repo: $repoRoot"
    Write-Output "Branch: $(Get-BranchName)"
    Write-Output "Latest session: $dir"
    Write-Output ""
    if (Test-Path (Join-Path $dir "handoff.md")) {
      Get-Content -LiteralPath (Join-Path $dir "handoff.md")
    }
  }
}

