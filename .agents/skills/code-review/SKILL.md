---
name: code-review
description: Universal code and pull request (PR) diff review skill. Dynamically discovers repository guidelines from AGENTS.md and .agents/skills, evaluates changes against universal software quality and security standards, and outputs structured P0-P3 GitHub reviews with automated publishing via GitHub MCP or GitHub CLI.
---

# Universal Code & PR Diff Review Skill (`code-review`)

This skill provides a systematic protocol for performing high-signal, constructive, and comprehensive code reviews across any repository. It dynamically resolves project-specific rules from local configuration files while enforcing universal software quality, security, and performance standards.

---

## 1. Core Review Philosophy

- **Diff-Only Static Inspection**: Perform static inspection on the diff and surrounding file context. Do not run terminal build, test, or lint commands during review unless explicitly directed by the user.
- **Single Source of Truth**: Adhere strictly to project conventions defined in the repository's guideline files (`AGENTS.md`, `.agents/skills/*`, etc.). Do not enforce personal or subjective styling preferences that contradict local rules.
- **Actionable & Constructive**: Every flagged issue must clearly explain **why** it is problematic (rationale) and provide **how** to fix it with concrete, copy-pasteable diffs or code snippets.
- **High Signal, Low Noise**: Clearly distinguish blocking defects from non-blocking suggestions. Never block PRs on cosmetic nits.
- **Celebrate Good Engineering**: Explicitly highlight well-structured code, elegant solutions, clean refactors, and good test coverage using praise callouts.

---

## 2. Ingestion & Target Resolution Protocol

When activated, identify the changes to review according to this priority:

1. **Target Specified by User**:
   - Specific branch, commit range (e.g. `main..feature`), list of files, or pasted diff $\rightarrow$ inspect those targets directly.
   - GitHub PR URL or PR number $\rightarrow$ retrieve the PR details and diff using GitHub MCP (`pull_request_read` with method `get_diff` or `get_files`) or GitHub CLI (`gh pr diff <number>`).
2. **Current Branch vs. Base (Default PR Mode)**:
   - Determine current branch: `git branch --show-current`
   - Check available base branch: `git rev-parse --verify origin/main` (fallback to `main`)
   - Obtain the diff: `git diff origin/main...HEAD` (or `main...HEAD`)
   - Obtain changed file list with stats: `git diff --stat origin/main...HEAD`
3. **Uncommitted Working Tree Changes (Pre-commit Review)**:
   - If on the main branch or if requested to review local changes: `git status --short` followed by `git diff HEAD` (or `git diff --cached` for staged changes).

### Smart Filtering & Noise Reduction
To keep reviews focused on high-impact code:
- **Exclude from Deep Review**:
  - Lockfiles (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `Cargo.lock`, `poetry.lock`)
  - Build artifacts & cache directories (`.next/`, `dist/`, `out/`, `build/`, `.turbo/`, `node_modules/`, `target/`)
  - Minified bundles and auto-generated type declaration dumps
  - Static media binaries (images, videos, fonts, binary assets)
- **Categorize Changed Domains**:
  - Group changed files by layer (e.g., schemas/contracts, data access/queries, server endpoints, state/forms, client UI, test files) to drive targeted pattern ingestion in Section 3.

---

## 3. Dynamic Repository Standards Discovery Protocol

Before evaluating code, inspect the repository to discover its conventions dynamically:

### Step A: Root Guidelines Discovery
Check for top-level agent instruction files in the workspace root:
- `AGENTS.md` (or `CLAUDE.md`, `.cursorrules`, `CONTRIBUTING.md`)
- If present, read the relevant conventions (e.g., framework version constraints, async boundaries, naming conventions, project structure).

### Step B: Targeted Skill & Pattern Ingestion (Path-Matched)
Inspect `.agents/skills/` (or `.claude/skills/`):
1. List available directories under `.agents/skills/`.
2. Filter for **architectural and pattern skills** (e.g., names ending with `-patterns`, `architecture`, or domain modeling).
   - **Ignore workflow / conversational skills** (e.g., `grilling`, `grill-me`, `grill-with-docs`, `wizard`, `to-spec`, `implement`, `diagnosing-bugs`, `writing-for-agents`).
3. Ingest **only** the pattern skills matching the files modified in the diff:
   - **Data fetching / queries modified** $\rightarrow$ Load `tanstack-query-patterns/SKILL.md` (if present).
   - **Forms / validation modified** $\rightarrow$ Load `react-hook-form-patterns/SKILL.md` (if present).
   - **Tests modified (`*.test.*`, `*.spec.*`)** $\rightarrow$ Load `testing-patterns/SKILL.md` (if present).
   - **Domain models / entities modified** $\rightarrow$ Load `domain-modeling/SKILL.md` (if present).

*(If no repository-specific guidelines or matching skills are found, evaluate using the Universal Engineering Baseline below.)*

---

## 4. Universal Engineering Baseline

Evaluate all changes against foundational software engineering standards:

### Correctness & Robustness
- **Null / Undefined Safety**: Guard against optional/nullable values (`?.`, `??`, fallback states).
- **Asynchronous Flow**: Unhandled Promise rejections, missing `await` statements, race conditions, cleanup in lifecycle hooks.
- **Edge Cases**: Empty collections, zero values, boundary numbers, unusual characters.
- **Error States**: Graceful failure modes, error boundaries, proper status code handling.

### Security (OWASP Top 10)
- **Input Sanitization & Injection**: Unsanitized user inputs, dynamic SQL/HTML rendering, prototype pollution.
- **Authentication & Authorization**: Missing server-side authorization checks, route protection, IDOR vulnerabilities.
- **Secret Leaks**: Hardcoded API keys, environment variables exposed to client bundles, PII leaks.

### Performance & Resource Usage
- **Unnecessary Computations**: Expensive operations inside hot loops or unmemoized render cycles.
- **Network & Data**: N+1 queries, unindexed lookups, overfetching data, missing request deduplication.
- **Bundle & Hygiene**: Tree-shakeable imports, preventing heavy server utilities from leaking into client bundles, removing raw `console.log` / `debugger` statements.

---

## 5. Severity & Priority Taxonomy

Classify every finding into one of the following priority levels:

| Level | Severity | Description | Merge Blocking? |
|---|---|---|---|
| **P0** | **Blocker** | Critical security flaws, data corruption, auth bypass, build crashes, breaking framework violations (e.g. leaking server keys, broken async APIs). | **YES** (Must fix before merge) |
| **P1** | **Major** | Functional bugs, broken error states, unhandled edge cases, direct violation of repo conventions in `AGENTS.md` or pattern skills. | **YES** (Fix or explicit justification required) |
| **P2** | **Minor** | Sub-optimal types (`any`), non-critical performance leaks, missing test coverage, code organization improvements. | **NO** (Recommended improvement) |
| **P3** | **Nitpick** | Readability suggestions, minor naming improvements, style consistency. Explicitly tagged as `[Nitpick]`. | **NO** (Completely optional) |
| **Praise** | **Highlight** | Commendations for exemplary code, clever solutions, or solid test coverage. | — |

---

## 6. Review Execution & Verification Workflow

1. **Step 1: Collect Diff & File Context**:
   - Inspect the diff.
   - For complex hunks, inspect surrounding lines in the source file using `view_file` to understand caller context.
2. **Step 2: Execute Discovery Protocol**:
   - Read `AGENTS.md` and relevant pattern skills matching the modified files under `.agents/skills/`.
3. **Step 3: Map Findings to Standards**:
   - Cross-check code against both discovered repo standards and the universal baseline.
   - Assign severity (P0–P3 or Praise) based on real user impact.
4. **Step 4: Draft Actionable Output**:
   - Use the Structured Review Output Template below.
   - Cite exact file paths and line ranges with markdown links (`[file.ts#L10-L20](file:///path/to/file.ts#L10-L20)`).
   - Provide copy-pasteable diff blocks showing both the problem and the recommended fix.
5. **Step 5: Publish Review to GitHub (if MCP or CLI available)**:
   - Determine repo owner, name, and PR number.
   - Publish the formal review (`APPROVE`, `REQUEST_CHANGES`, or `COMMENT`) following Section 8.

---

## 7. Review Output Template (GitHub PR Style)

```markdown
# 🔍 Code Review: <PR Title or Branch Name>

## 🎯 Verdict
**[ APPROVE | REQUEST CHANGES | COMMENT ]**

> **Summary Verdict**: *1-2 sentences summarizing whether the changeset is ready to merge and calling out any critical findings.*

---

## 📋 Executive Summary
*High-level summary of what this PR accomplishes and its architectural impact.*

---

## 📐 Conventions & Architecture Checklist
*(Dynamically populated based on discovered AGENTS.md / .agents/skills)*

| Area / Guideline | Source | Status | Notes |
|---|---|---|---|
| **<Area 1 Conventions>** | `AGENTS.md` | ✅ Pass / ⚠️ Issue | Brief note |
| **<Pattern 2 Guideline>** | `.agents/skills/<name>` | ✅ Pass / ⚠️ Issue | Brief note |
| **Universal Baseline** | Universal Security & Hygiene | ✅ Pass / ⚠️ Issue | Brief note |

---

## 🚨 Critical & Major Issues (P0 / P1)
*(Omit this section if there are no P0 or P1 issues)*

### [P0/P1] <Concise Title of the Issue>
- **File**: [`path/to/file.ts#L25-L35`](file:///<workspace-root>/path/to/file.ts#L25-L35)
- **Rationale**: Explanation of why this causes a bug, security flaw, or convention breakage.
- **Suggested Fix**:
```diff
- problematic line
+ corrected line
```

---

## 💡 Suggestions & Nitpicks (P2 / P3)
*(Omit this section if there are no P2 or P3 issues)*

### [P2 / Minor] <Improvement Title>
- **File**: [`path/to/file.ts#L50`](file:///<workspace-root>/path/to/file.ts#L50)
- **Details**: Explanation of the improvement.
- **Suggested Fix**:
```tsx
// Suggested adjustment
```

### [P3 / Nitpick] <Styling or Naming Polish>
- **File**: [`path/to/file.ts#L72`](file:///<workspace-root>/path/to/file.ts#L72)
- **Details**: Optional polish suggestion.

---

## 👏 Highlights & Praise
- **[Praise]**: Commendation for well-structured patterns, clean refactor, or solid type definitions.

---

## 🏁 Next Steps
- Bulleted list of concrete actions needed to unblock merge or finalize the PR.
```

---

## 8. Publishing Review Comments to GitHub (MCP & CLI Integration)

When a GitHub PR or commit target is identified, publish the review directly to GitHub using either the **GitHub MCP Server** or the **GitHub CLI (`gh`)**.

### A. Target Repository & Context Detection
1. **Repository Identity**:
   - Extract repository owner and name from git remote:
     ```powershell
     git remote get-url origin
     ```
     Example: `https://github.com/owner/repo` $\rightarrow$ `owner = "owner"`, `repo = "repo"`.
2. **PR Number Discovery**:
   - If the user explicitly provided a PR number (e.g. PR #12), use it directly.
   - If on a feature branch, find matching PR via GitHub MCP tool `search_issues`:
     Query: `repo:<owner>/<repo> is:pr is:open head:<current-branch>`
     Or list PRs via MCP `list_pull_requests` with `state: "open"`.
   - If GitHub CLI is available: `gh pr view --json number,url -q .number`.
3. **Commit Hash Discovery**:
   - For standalone commit reviews: `git rev-parse HEAD` (or the specific commit SHA).

---

### B. Route 1: GitHub MCP Server (Primary Route)

If `github-mcp-server` tools are available in the environment, use them directly:

#### 1. Submitting PR Review with Verdict
Call the MCP tool `pull_request_review_write`:
- **ServerName**: `"github-mcp-server"`
- **ToolName**: `"pull_request_review_write"`
- **Arguments**:
  ```json
  {
    "method": "create",
    "owner": "<owner>",
    "repo": "<repo>",
    "pullNumber": <pr_number>,
    "event": "APPROVE" | "REQUEST_CHANGES" | "COMMENT",
    "body": "<formatted_review_markdown>"
  }
  ```
  **Event Mapping**:
  - Verdict `APPROVE` $\rightarrow$ `"event": "APPROVE"`
  - Verdict `REQUEST CHANGES` $\rightarrow$ `"event": "REQUEST_CHANGES"`
  - Verdict `COMMENT` $\rightarrow$ `"event": "COMMENT"`

#### 2. Posting PR Discussion Comment (Fallback)
If submitting a formal review is not needed or fails, post a general comment on the PR via `add_issue_comment`:
- **ServerName**: `"github-mcp-server"`
- **ToolName**: `"add_issue_comment"`
- **Arguments**:
  ```json
  {
    "owner": "<owner>",
    "repo": "<repo>",
    "issue_number": <pr_number>,
    "body": "<formatted_review_markdown>"
  }
  ```

---

### C. Route 2: GitHub CLI (`gh`) (Fallback Route)

If GitHub MCP is not available, verify whether GitHub CLI is installed and authenticated:
1. Check authentication status:
   ```powershell
   gh auth status
   ```
2. **Submit PR Review**:
   ```powershell
   # If verdict is APPROVE:
   gh pr review <pr_number> --approve --body "<review_body>"

   # If verdict is REQUEST CHANGES:
   gh pr review <pr_number> --request-changes --body "<review_body>"

   # If verdict is COMMENT:
   gh pr review <pr_number> --comment --body "<review_body>"
   ```
3. **Submit Commit Comment**:
   For reviews targeting a specific commit hash:
   ```powershell
   gh api repos/<owner>/<repo>/commits/<commit_sha>/comments -f body="<review_body>"
   ```

---

### D. Publication Confirmation & Linkage
- Once sent via MCP or CLI, confirm the submission in chat:
  - Link directly to the PR or commit review: `https://github.com/<owner>/<repo>/pull/<pr_number>`
  - Report the submitted verdict (`APPROVE`, `REQUEST CHANGES`, or `COMMENT`).
