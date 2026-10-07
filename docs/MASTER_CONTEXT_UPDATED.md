# ThesiSHS AI — Master Context

**Last reconciled:** 2026-10-05  
**Current branch:** `feature/development`  
**Current rollback checkpoint:** `73ca174` — `docs(progress): record Phase 4 audit commit`

> This file is the **current-state handoff document**. It must not treat historical pre-rollback implementation as current code.

---

## 1. Current Project State

The project was intentionally rolled back to commit `73ca174`. The rollback removed the later Phase 5–7 implementation work from the active codebase.

### Current phase status

| Phase | Feature | Status at current checkout |
|---|---|---|
| 0 | Project Foundation & Environment | ✅ Complete |
| 1 | Authentication & Access Control | ✅ Complete |
| 2 | Research/User Foundation | ✅ Complete |
| 3 | Submission & Version Management | ✅ Complete |
| 4 | Adviser Review & Feedback | ✅ Complete — latest milestone |
| 5 | Research Repository & Document Access | ⏭️ Next development target |
| 6 | Search, Filtering & Discovery | ⏳ Future; previous implementation reverted |
| 7 | Administration & Reporting | ⏳ Future; previous implementation reverted |

**Panel Evaluation:** excluded/deferred unless explicitly reopened.  
**AI-assisted evaluation/chat/summarization:** planned, not current implementation.

---

## 2. Git / Rollback Boundary

The authoritative current checkpoint is:

```text
branch: feature/development
HEAD:   73ca174
message: docs(progress): record Phase 4 audit commit
```

The later development state that contained Phase 5, Phase 6, and Phase 7 work was intentionally reverted.

Therefore, an agent must **not** assume that historical files, routes, services, repositories, tests, datasets, or migrations from those phases still exist.

Before changing code, verify the actual checkout:

```bash
git status
git branch --show-current
git log -1 --oneline
git log --oneline --decorate -10
```

Do not restore historical work blindly. Inspect the current source first and re-implement only what is actually required.

---

## 3. Latest Completed Milestone — Phase 4

Phase 4 Adviser Review & Feedback is the latest completed implementation milestone.

### Verified workflow

```text
Student submits
      ↓
Adviser notified
      ↓
Adviser starts review
      ↓
Under Review
      ↓
Revision Required ──→ Student resubmits a new version
      │
      └──────────────→ Approved
```

Established Phase 4 behavior:
- Adviser access is scoped to their own research groups.
- Advisers can start review.
- Advisers can provide feedback and select `Revision Required` or `Approved`.
- Submission/research status updates are coordinated.
- Submission versions are preserved.
- Student/adviser in-app notifications are triggered.
- Adviser decisions are activity-logged.
- Cross-adviser isolation was verified.
- The end-to-end review/resubmission/approval workflow was verified.

Relevant commits:
- `c425f1a` — `feat(submission): enforce unique paper versions`
- `cad078c` — `feat(notification): notify students of adviser decisions`
- `4499aea` — `feat(notification): notify adviser of new submissions`
- `bc87caf` — `fix(review): close Phase 4 regression audit`

Notification delivery failure handling remains explicitly deferred and non-blocking.

---

## 4. Phase 5 — Next Development Target

Phase 5 is the next feature to resume after the documentation pause.

The stable design in `SOURCE_OF_TRUTH.md` calls for:
- private Supabase Storage
- bucket `research-submissions`
- PDF-only documents
- maximum file size of 10 MB
- storage path pattern `research/{paperId}/{version}/{sanitizedFileName}`
- server-side authorization before document access
- server-generated signed URLs
- five-minute signed URL expiry
- database storage of the storage path rather than a public URL

### Historical Phase 5 work

A pre-rollback implementation attempted repository/document access and encountered browser-acceptance problems involving real Supabase Storage data and view/download counter mutations.

That implementation is **historical**. It is not proof that the current checkout contains Phase 5.

When Phase 5 resumes:

1. Inspect the current code/schema at `73ca174`.
2. Establish exactly what Phase 5 foundations, if any, remain.
3. Implement missing functionality incrementally.
4. Use isolated test data/environment and a non-sensitive PDF.
5. Keep production/student data out of acceptance testing.
6. Use Playwright for safe browser acceptance where appropriate.
7. If a test mutates counters, perform controlled manual verification rather than risking production-like data.
8. Inspect migrations before applying anything.

---

## 5. Historical Phase 6 and Phase 7 Work

Before the rollback, later development included:

### Phase 6 — Search, Filtering & Discovery
Historical work included repository search/filter/sort/pagination, empty-state handling, access-boundary testing, and synthetic acceptance data.

### Phase 7 — Administration & Reporting
Historical work included dashboard/reporting metrics and an Admin reports page.

These are **not current completed milestones** after the rollback. Their previous tests, routes, services, repositories, and datasets must not be assumed to exist.

Historical material may be consulted for design intent only.

---

## 6. Stable Project Rules

These rules remain applicable regardless of the rollback:

- Layered architecture: Pages/UI → Server Actions → Zod validation → Services → Repositories → Drizzle ORM → PostgreSQL.
- Business logic and authorization belong in services.
- Repositories remain focused on data access.
- Authorization must be enforced server-side.
- Verify ownership/group access before protected operations.
- Students do not self-join research groups; advisers assign/remove students.
- A student has one active group membership.
- Preserve submission versions rather than overwriting them.
- Submission versions use unique `(paper_id, version)`.
- Notifications are currently in-app only.
- Notification failure must not block the primary operation.
- Panel Evaluation is excluded/deferred.
- AI assistance must not replace final human academic/review decisions.
- Supabase secret credentials remain server-only.
- Store storage paths rather than public document URLs.
- Generate signed document URLs server-side.
- Keep test and production environments/data separate.
- Never commit secrets.

---

## 7. Database / Migration Safety

`DATABASE.md` is the database reference, while the actual `db/schema/`, `db/migrations/`, and target database are authoritative.

The documentation historically referred to 11 core tables while explicitly naming 10. **Do not invent an eleventh table.** Verify the actual schema before resolving that discrepancy.

The historical migration `0009_repository_paper_unique.sql` must not automatically be treated as current or applied after the rollback. Inspect the actual migration directory and database first.

Before applying schema changes:

```bash
npx drizzle-kit check
```

Then review the generated SQL and target data before migration.

---

## 8. Documentation Roles

The project documentation is intentionally separated:

- `SOURCE_OF_TRUTH.md` — stable product rules, architecture, constraints, and long-term design.
- `MASTER_CONTEXT.md` — current implementation state, rollback boundary, blockers, and next action.
- `README.md` — documentation navigation and AI-agent handoff entry point.
- `ARCHITECTURE.md` — technical architecture and data flow.
- `DATABASE.md` — database structure and migration safety.

A future agent should not need the historical chat to understand the current project state.

---

## 9. Agent Handoff Protocol

Before implementation:

1. Read `SOURCE_OF_TRUTH.md`.
2. Read `MASTER_CONTEXT.md`.
3. Read `README.md`.
4. Read `ARCHITECTURE.md`.
5. Read `DATABASE.md` for database work.
6. Inspect the actual repository at `73ca174`.
7. Check working-tree changes before modifying files.
8. Do not restore reverted Phase 5–7 code unless the task explicitly calls for reimplementation.
9. Do not commit without project-owner approval.

Every handoff should record:
- phase/feature
- implementation status
- files changed
- database/migration changes
- test evidence
- blockers/risks
- exact next action
- commit hash, if applicable

---

## 10. Immediate Next Action

Development is currently paused while the project documentation is being consolidated for lower-context, more efficient AI-assisted development.

When development resumes, the first technical task is:

> **Inspect the actual checkout at `73ca174` and establish the true Phase 5 starting point before writing or restoring Phase 5 code.**
