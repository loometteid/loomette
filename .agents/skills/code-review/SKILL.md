---
name: code-review
description: Comprehensive code and pull request (PR) diff review skill. Performs static analysis across architecture, project conventions, security, performance, logic correctness, and code hygiene, outputting structured GitHub-style reviews with P0-P3 severity ratings, with automated publishing via GitHub MCP or GitHub CLI.
---

# Code & PR Diff Review Skill (`code-review`)

This skill provides a systematic protocol for performing high-signal, constructive, and comprehensive code reviews on pull requests, branch diffs, uncommitted working tree changes, or targeted files.

---

## 1. Core Review Philosophy

- **Diff-Only Static Inspection**: Reviews are conducted purely through static code and diff inspection. Do not run build, test, or lint terminal commands during review unless explicitly requested by the user.
- **Actionable & Constructive**: Every flagged issue must clearly explain **why** it is problematic (rationale) and provide **how** to fix it with concrete, copy-pasteable diffs or code snippets.
- **High-Signal, Low-Noise**: Clearly distinguish between blocking defects and non-blocking advice. Never block PRs on cosmetic preferences.
- **Celebrate Good Engineering**: Highlight well-structured code, elegant solutions, clean refactors, and good test coverage using praise callouts.

---

## 2. Ingestion & Target Resolution Protocol

When activated, identify the changes to review according to this priority:

1. **Target Specified by User**: If the user provides a specific branch, commit range (e.g. `main..feature`), list of files, or pastes a diff, inspect those specified targets directly.
2. **Current Branch vs. Base (Default PR Mode)**:
   - Determine current branch: `git branch --show-current`
   - Check available base branch: `git rev-parse --verify origin/main` (fallback to `main`)
   - Obtain the diff: `git diff origin/main...HEAD` (or `main...HEAD`)
   - Obtain changed file list with stats: `git diff --stat origin/main...HEAD`
3. **Uncommitted Working Tree Changes (Pre-commit Review)**:
   - If on the main branch or if requested to review local changes: `git status --short` followed by `git diff HEAD` (or `git diff --cached` for staged changes).

### Smart Filtering & Prioritization
To keep reviews focused on high-impact code:
- **Exclude from Deep Review**:
  - Lockfiles (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`)
  - Build artifacts & cache directories (`.next/`, `dist/`, `out/`, `build/`, `.turbo/`)
  - Minified files or auto-generated type declaration dumps
  - Static media binaries (images, videos, fonts, binary assets)
- **Review Prioritization Sequence**:
  1. **Data Contracts & Schemas**: Database schemas, migrations, Zod schemas (`schemas/*.schema.ts`), API payload types.
  2. **Query & Data Fetching Options**: TanStack Query options (`*.query-option.*.ts`), Supabase client interactions.
  3. **Server Logic & Endpoints**: React Server Components (RSC), Route Handlers (`app/api/**/route.ts`), Server Actions.
  4. **Forms & State Management**: Form components (`react-hook-form`), Zustand stores, context providers.
  5. **Client UI & Presentation**: Interactive components, layout, styling (Tailwind CSS, Base UI).

---

## 3. Loomette Architectural Conventions Checklist

Every review must verify adherence to project-specific rules established across `.agents/skills/*` and repository guidelines:

### A. Next.js 16 & React 19 Conventions (`AGENTS.md`)
- **Async Route Params & SearchParams**:
  - In page/layout components and route handlers, `params` and `searchParams` are Promises:
    ```tsx
    // Correct
    export default async function Page({ params }: { params: Promise<{ id: string }> }) {
      const { id } = await params;
    }
    ```
- **Async Request APIs**: Calls to `cookies()`, `headers()`, and `draftMode()` must be awaited.
- **Server/Client Boundaries**:
  - Mark client-interactive components explicitly with `"use client"`.
  - Mark server-only utility/data modules with `import "server-only"`.
  - Never import server-only code (or server Supabase client) into client components.

### B. TanStack Query Architecture (`.agents/skills/tanstack-query-patterns`)
- **Strict Query Option Split**:
  - Files must reside under `components/features/<feature>/query-options/`.
  - Browser query option: `*.query-option.client.ts` using `createBrowserSupabaseClient()`.
  - Server query option: `*.query-option.server.ts` using `createServerSupabaseClient()`.
- **Query Key Discipline**:
  - Suffix query keys with `as const` (e.g., `["feature", "items", userId] as const`).
  - Key arrays must match identically between `.client.ts` and `.server.ts`.
- **Stale Time**: Default to 5 minutes (`staleTime: 1000 * 60 * 5`) unless real-time updates require shorter freshness.
- **Server Prefetching**:
  - In Server Components, call `queryClient.prefetchQuery(...)` **without `await`** and render `<HydrationBoundary state={dehydrate(queryClient)}>` inside a `<Suspense>` boundary.
- **Logging**:
  - On query errors, log with `@logtape/logtape`: `getLogger(["query", "<feature>"])` with structured metadata.

### C. React Hook Form & Zod Architecture (`.agents/skills/react-hook-form-patterns`)
- **Schema Organization**:
  - Placed in `components/features/<feature>/schemas/<name>.schema.ts`.
  - Export both schema and inferred type: `export type FormValues = z.infer<typeof schema>`.
- **Explicit `defaultValues`**:
  - Every registered or controlled field must have an explicit default value in `useForm({ defaultValues: { ... } })`. No missing keys.
- **Component Integration**:
  - Use `<Controller />` from `react-hook-form` when wrapping Base UI / custom components (avoid manual ref hacks).
  - Use `useWatch` for dynamic/conditional fields to isolate re-renders instead of watching the whole form.
- **Mutations & Invalidation**:
  - Submit handlers should invoke TanStack Query mutations and invalidate matching query keys upon success.

### D. Supabase SSR & Security Context
- **Client Selection**:
  - Client components / browser callbacks: `@/lib/supabase/client` (`createBrowserSupabaseClient`).
  - Server Components / Actions / Route Handlers: `@/lib/supabase/server` (`createServerSupabaseClient`).
- **Authorization & RLS**:
  - Always verify authenticated user session before executing sensitive mutations or data access.
  - Never expose service role keys to client-accessible bundles.

### E. Logging & Code Hygiene
- **Structured Logging**: Use `@logtape/logtape` via `getLogger([category, subcategory])`.
- **No Console Statements**: Flag raw `console.log`, `console.error`, `debugger`, or leftover commented-out dead code.
- **Styling**: Use Tailwind v4 classes with the `cn()` utility (`clsx` + `tailwind-merge`) for conditional class merging.

---

## 4. Universal Code Quality & Security Evaluation

In addition to project conventions, inspect the changes against universal engineering standards:

### Correctness & Robustness
- **Null / Undefined Handling**: Check optional chaining (`?.`), nullish coalescing (`??`), and missing fallback states.
- **Array & Object Operations**: Safe handling of empty arrays, unexpected API payload formats, or missing properties.
- **Async Flow & Promises**: Ensure unhandled rejections are caught; prevent unhandled async errors in event handlers.
- **Race Conditions**: Verify debouncing on rapid search inputs, cleanup functions in `useEffect` (if used), and cancel tokens/aborts where appropriate.

### Security
- **Input Sanitization**: Validate all external inputs with Zod before using in database queries or server logic.
- **Injection & XSS**: Check that user-supplied strings are not dangerously inserted into HTML without sanitization.
- **Sensitive Data**: Ensure no secrets, tokens, PII, or internal credentials are committed or exposed in client bundles.

### Performance
- **React Re-renders**: Avoid inline object/array recreation in hot loops or deeply nested components.
- **Bundle Bloat**: Verify tree-shakeable imports (e.g. `import { Icon } from "lucide-react"` rather than whole-package imports).
- **Network Efficiency**: Ensure related queries are deduplicated and avoid N+1 sequential fetching patterns.

---

## 5. Severity & Priority Taxonomy

Classify every finding into one of the following priority levels:

| Level | Severity | Description | Merge Blocking? |
|---|---|---|---|
| **P0** | **Blocker** | Application crashes, security vulnerabilities, auth/data leaks, data loss/corruption, or severe architectural violations (e.g. leaking server keys, broken async Next.js 16 APIs). | **YES** (Must fix before merge) |
| **P1** | **Major** | Functional bugs, missing error handling, unhandled edge cases, performance bottlenecks, or direct violation of project patterns (e.g. query split mismatch, missing form defaultValues). | **YES** (Fix or explicit justification required) |
| **P2** | **Minor** | Sub-optimal types (`any`), missing edge case tests, minor performance improvements, code organization polish. | **NO** (Recommended improvement) |
| **P3** | **Nitpick** | Minor naming suggestions, style consistency, trivial formatting, or subjective readability tweaks. Explicitly tagged as `[Nitpick]`. | **NO** (Completely optional) |
| **Praise** | **Highlight** | Commendations for elegant code, excellent type safety, thoughtful edge-case handling, or clean abstractions. | — |

---

## 6. Step-by-Step Review Execution Workflow

When running a code review:

1. **Step 1: Identify Changed Files**:
   - Run `git status` and determine the comparison base (`origin/main...HEAD` or uncommitted changes).
   - Filter out lockfiles and build outputs.
2. **Step 2: Read Full Context**:
   - For every modified critical file, do not just read the patch lines; inspect surrounding code in the file using `view_file` to understand full component/function context.
   - Cross-check related schema files and query options when inspecting form or data-fetching changes.
3. **Step 3: Systematic Checklist Verification**:
   - Check Next.js 16 async conventions.
   - Check TanStack Query server/client split and query keys.
   - Check React Hook Form schemas and defaultValues.
   - Check Supabase SSR client usage.
   - Check error handling and Logtape logging.
4. **Step 4: Formulate Actionable Feedback**:
   - Assign P0–P3 or Praise tags.
   - Cite exact file paths and line numbers with markdown file links: `[filename.ts#L10-L20](file:///absolute/path/to/filename.ts#L10-L20)`.
   - Provide copy-pasteable diff blocks showing both the problem and the recommended fix.
5. **Step 5: Output Review**:
   - Format the response using the Structured Review Output Template below.
6. **Step 6: Publish to GitHub (if MCP or CLI available)**:
   - Check if GitHub MCP server is available or if GitHub CLI (`gh`) is authenticated.
   - If a target PR or commit exists, publish the review or comment directly to GitHub following the protocol in Section 8.

---

## 7. Review Output Template (GitHub PR Style)

Format the final review using the following template:

```markdown
# 🔍 Code Review: <PR Title or Branch Name>

## 🎯 Verdict
**[ APPROVE | REQUEST CHANGES | COMMENT ]**

> **Summary Verdict**: *1-2 sentences summarizing whether the code is safe to merge, requires architectural/bug fixes, or needs minor clarification.*

---

## 📋 Executive Summary
*High-level summary of what this changeset accomplishes, key additions, and architectural impact.*

---

## 📐 Architecture & Conventions Checklist

| Area | Status | Notes |
|---|---|---|
| **Next.js 16 / React 19** | ✅ Pass / ⚠️ Issue | Async params/searchParams, server/client boundaries |
| **TanStack Query** | ✅ Pass / ⚠️ Issue | Server/client split, query keys `as const`, staleTime |
| **React Hook Form & Zod** | ✅ Pass / ⚠️ Issue | Dedicated schema, explicit defaultValues, Controller |
| **Supabase SSR** | ✅ Pass / ⚠️ Issue | Correct browser/server client, auth validation |
| **Logging & Hygiene** | ✅ Pass / ⚠️ Issue | Logtape usage, no raw console.log, clean imports |

---

## 🚨 Critical & Major Issues (P0 / P1)
*(Omit this section if there are no P0 or P1 issues)*

### [P0/P1] <Concise Title of the Issue>
- **File**: [`path/to/file.ts#L25-L35`](file:///e:/Codes/loomette/path/to/file.ts#L25-L35)
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
- **File**: [`path/to/file.ts#L50`](file:///e:/Codes/loomette/path/to/file.ts#L50)
- **Details**: Explanation of the improvement.
- **Suggested Fix**:
```tsx
// Suggested adjustment
```

### [P3 / Nitpick] <Styling or Naming Polish>
- **File**: [`path/to/file.ts#L72`](file:///e:/Codes/loomette/path/to/file.ts#L72)
- **Details**: Optional polish suggestion.

---

## 👏 Highlights & Praise
- **[Praise]**: Commendation for well-structured pattern, clean refactor, or solid type definitions.

---

## 🏁 Next Steps
- Bulleted list of concrete actions needed to unblock merge or finalize the PR.
```

---

## 8. Publishing Review Comments to GitHub (MCP & CLI Integration)

When a GitHub PR or commit target is identified, the review can be published directly to GitHub using either the **GitHub MCP Server** or the **GitHub CLI (`gh`)**.

### A. Target Repository & Context Detection
1. **Repository Identity**:
   - Extract repository owner and name from git remote:
     ```powershell
     git remote get-url origin
     ```
     Example: `https://github.com/loometteid/loomette` -> `owner = "loometteid"`, `repo = "loomette"`.
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
  - Verdict `APPROVE` -> `"event": "APPROVE"`
  - Verdict `REQUEST CHANGES` -> `"event": "REQUEST_CHANGES"`
  - Verdict `COMMENT` -> `"event": "COMMENT"`

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

