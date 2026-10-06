# Supabase Management Guide

This directory contains database migrations, schema configuration, and Edge Functions for Loomette.

---

## 1. Prerequisites & Linking

Make sure you are logged in to Supabase CLI and linked to your remote Supabase project:

```bash
# Log in to your Supabase account
npx supabase login

# Link your local repo to your remote project (found in Dashboard URL: /project/<project-ref>)
npx supabase link --project-ref <your-project-ref>
```

---

## 2. Database Migrations

All schema changes live under [`supabase/migrations/`](./migrations).

### Push Migrations to Remote Database

Applies all pending local `.sql` migration files to the linked remote database:

```bash
npx supabase db push
```

### Handling Migration History Mismatch

If `npx supabase db push` returns:
```text
Remote migration versions not found in local migrations directory.
```
This indicates the remote database has migration version records not present in your local branch. You have two options:

1. **Pull remote schema into local**:
   ```bash
   npx supabase db pull
   ```

2. **Repair migration history (if the missing version was deleted or reverted)**:
   ```bash
   npx supabase migration repair --status reverted <migration_version>
   npx supabase db push
   ```

3. **Alternative (Web Dashboard SQL Editor)**:
   You can also copy the contents of the latest migration file (e.g. [`supabase/migrations/20261004150000_add_upload_jobs_and_duplicate_flag.sql`](./migrations/20261004150000_add_upload_jobs_and_duplicate_flag.sql)) and run it directly in the **Supabase Dashboard $\rightarrow$ SQL Editor**.

### Create a New Migration

```bash
npx supabase migration new <migration_name>
```

### Local Development (Optional)

```bash
# Start local Supabase Docker stack
npx supabase start

# Reset local database and run all migrations from scratch
npx supabase db reset
```

---

## 3. Deploying Edge Functions

Edge Functions live under [`supabase/functions/`](./functions).

### Set Required Secrets

Before deploying `extract-garments`, configure your Gemini API key:

```bash
# Set Gemini API key secret in remote project
npx supabase secrets set GEMINI_API_KEY=<your-google-gemini-api-key>

# List configured secrets to verify
npx supabase secrets list
```

*(Note: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically by the Supabase runtime).*

### Deploy Functions

To deploy the **`extract-garments`** Edge Function:

```bash
# Deploy extract-garments function
npx supabase functions deploy extract-garments --no-verify-jwt
```

> **Note:** `--no-verify-jwt` is recommended when the function is invoked via client SDK with custom authorization or handles CORS preflight cleanly.

To deploy **all** functions in the repository:

```bash
npx supabase functions deploy
```

### View Live Function Logs

To tail live logs in real time from the terminal:

```bash
npx supabase functions logs extract-garments --tail
```

Logs are formatted in structured JSON and queryable in **Supabase Dashboard $\rightarrow$ Edge Functions $\rightarrow$ Logs**.

### Local Edge Function Testing

To test the function locally before deploying:

```bash
npx supabase functions serve extract-garments --env-file ./supabase/.temp.env
```

---

## 4. Generating Database TypeScript Types

To regenerate TypeScript definitions from your remote Supabase database:

```bash
# Generate types from linked remote database
npx supabase gen types typescript --linked > types/database.types.ts
```

Or for a local development database:

```bash
npx supabase gen types typescript --local > types/database.types.ts
```

---

## 5. Automated CI/CD (GitHub Actions)

Continuous Deployment is configured in [`.github/workflows/deploy-supabase.yml`](../.github/workflows/deploy-supabase.yml).

### Trigger Conditions
- Automatically triggers on `push` to `main` whenever changes occur in `supabase/**`.
- Can be manually dispatched via GitHub Actions **Run workflow** button (`workflow_dispatch`).

### What It Does
1. Authenticates non-interactively using your Supabase Access Token.
2. Links to the remote Supabase project.
3. Automatically runs pending migrations (`supabase db push`).
4. Keeps the `GEMINI_API_KEY` secret synced on the remote project.
5. Deploys the `extract-garments` Edge Function (`supabase functions deploy extract-garments --no-verify-jwt`).

### Required GitHub Secrets
In your GitHub repository (**Settings $\rightarrow$ Secrets and variables $\rightarrow$ Actions**), add:

| Secret | Description | Where to find |
|---|---|---|
| `SUPABASE_ACCESS_TOKEN` | Personal Access Token | [Supabase Account Tokens](https://supabase.com/dashboard/account/tokens) |
| `SUPABASE_PROJECT_ID` | Remote project reference | Found in Dashboard URL: `/project/<project-ref>` |
| `SUPABASE_DB_PASSWORD` | PostgreSQL Database password | Set during project creation (or reset in Project Settings > Database) |
| `GEMINI_API_KEY` | Google Gemini API Key | [Google AI Studio](https://aistudio.google.com/) |

