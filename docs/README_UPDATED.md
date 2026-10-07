# ThesiSHS AI --- Documentation & Agent Handoff Guide

**Purpose:** Navigation guide for the project's canonical documentation
and AI coding-agent handoff.

## Documentation Files

### `SOURCE_OF_TRUTH.md`

Canonical reference for stable architecture, product rules, scope,
roles, security rules, storage rules, and durable decisions.

### `MASTER_CONTEXT.md`

Living checkpoint for current development progress, completed
milestones, blockers, testing evidence, roadmap status, and immediate
next actions.

**Current repository checkpoint:** `feature/development` at `73ca174`
--- `docs(progress): record Phase 4 audit commit`.

The working tree has been intentionally reverted to this checkpoint.
Later Phase 5--7 implementation work from the retired development state
must **not** be assumed to exist in the current codebase.

### `ARCHITECTURE.md`

Technical reference for the application layers, module responsibilities,
authentication/authorization flow, storage flow, and implementation
patterns.

### `DATABASE.md`

Canonical database/schema reference. Use it for tables, relationships,
constraints, migrations, and database-specific rules. Verify the actual
repository/database state before applying migrations.

## Recommended Agent Reading Order

``` text
SOURCE_OF_TRUTH.md
        ↓
MASTER_CONTEXT.md
        ↓
git status / branch / HEAD
        ↓
ARCHITECTURE.md
        ↓
DATABASE.md (when database work is involved)
        ↓
actual source code
```

Before changing anything:

``` bash
git status --short
git branch --show-current
git log -1 --oneline
```

Do not assume documentation is newer than the actual checkout.

## Current Development Status

The active implementation checkpoint is **Phase 4 --- Adviser Review &
Feedback complete**.

Phase 4 was verified as an end-to-end workflow:

``` text
Student submission
      ↓
Adviser review
      ↓
Feedback / decision
      ↓
Revision Required or Approved
      ↓
Student notification
      ↓
Resubmission
      ↓
Final approval
```

The current checkout is intentionally before the later Phase 5--7 work.
Therefore:

-   Phase 5 repository/document-access implementation is **not a current
    completed milestone**.
-   Phase 5 verification is **not currently the next testing
    checkpoint**.
-   Phase 6 search/discovery is **not currently a completed phase in
    this checkout**.
-   Phase 7 admin reporting is **not currently implemented work to
    continue from this checkout**.
-   Do not recreate or continue reverted Phase 5--7 changes unless the
    roadmap explicitly directs the project back to those phases.

## Critical Rules

-   Authorization is enforced server-side; UI visibility is never the
    security boundary.
-   Always verify user/group/resource ownership.
-   Preserve all research submission versions.
-   Students do not self-join research groups; advisers assign students.
-   One active group membership per student.
-   Panel Evaluation is excluded unless explicitly reopened.
-   Notifications are currently in-app only; notification delivery
    failure handling is deferred and must not block the primary
    operation.
-   Research documents are stored in private Supabase Storage.
-   Store storage paths, not permanent public document URLs.
-   Signed document URLs are generated server-side.
-   Never commit secrets such as `JWT_SECRET` or `SUPABASE_SECRET_KEY`.
-   Do not apply a generated migration without checking its
    applicability to the target database.
-   Do not invent test evidence or mark a phase complete without
    verification.
-   Do not make reverted Phase 5--7 work appear current merely because
    it exists in historical documentation.

## Validation

Use the project's existing checks as appropriate:

``` bash
npm run lint
npx tsc --noEmit
npm run build
git diff --check
npx drizzle-kit check
```

Use Playwright for browser acceptance when the feature being verified is
browser-facing.

## Historical Chat Policy

The former large development chat is historical context only. The
documentation set plus the actual Git checkout should be sufficient for
normal agent handoff.

When historical context conflicts with the current checkout, the current
checkout and current project documentation take precedence unless the
owner explicitly asks to restore a reverted feature.

------------------------------------------------------------------------

**End of Documentation Guide**
