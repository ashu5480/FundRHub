# FundrHub — Definition of Done (DoD)

**Product:** FundrHub — Founder ↔ Investor Discovery, Matching & Connection Platform  
**Founder & Product Owner:** Ashutosh Singh  
**Version:** 1.0  
**Status:** Initial baseline  

---

## 1. Purpose

The Definition of Done (DoD) is the shared checklist that a work item (story, task, bug fix, or epic) must satisfy before it is considered **complete**. It ensures consistent quality, minimizes rework, and makes "done" mean the same thing for the product owner, developers, and AI contributors.

## 2. When DoD Applies

The DoD applies to:

- New features (stories)
- Bug fixes
- Refactoring tasks
- Database changes
- API changes
- UI/UX changes
- Documentation changes
- Infrastructure changes
- AI-assisted changes (same bar as human changes)

## 3. Definition of Done — MVP Level

A work item is **Done** only when **all** of the following are true.

### 3.1 Functional

- [ ] Meets the acceptance criteria defined in the PRD or ticket/issue.
- [ ] Works as expected in both web and mobile (where applicable).
- [ ] All user flows work end-to-end without manual configuration.
- [ ] No known critical or major bugs remain open.
- [ ] Error states, empty states, and loading states are handled.

### 3.2 Code Quality

- [ ] Code review completed and approved.
- [ ] Passes `npm run lint` with zero errors.
- [ ] Passes `npm run format:check`.
- [ ] Passes `npm run typecheck` (TypeScript strict).
- [ ] No `any` types without documented justification.
- [ ] No dead code, commented-out code, or debug logs.
- [ ] Follows `docs/development/coding-standards.md`.

### 3.3 Testing

- [ ] Unit tests added/updated for all new logic.
- [ ] Integration/API tests added/updated for new endpoints.
- [ ] E2E tests cover critical user journeys (PRD acceptance criteria).
- [ ] All tests pass locally and in CI.
- [ ] Edge cases covered (validation, authorization, empty states).

### 3.4 Documentation

- [ ] PRD updated if functional behavior changed.
- [ ] API design docs updated if endpoints changed (`docs/architecture/api-design.md`).
- [ ] Database design docs updated if schema changed (`docs/architecture/database-design.md`).
- [ ] UX flow / UI guidelines updated if user flows or UI changed (`docs/design/`).
- [ ] Code documented with TSDoc/JSDoc for public APIs.
- [ ] New UI components documented in Storybook (or equivalent).

### 3.5 Git & Workflow

- [ ] Branch follows naming convention (feature/*, fix/*, docs/*).
- [ ] Commits follow Conventional Commits.
- [ ] PR created with a clear title and description.
- [ ] PR is small and reviewable (ideally < 400 lines changed).
- [ ] CI passes on the PR.
- [ ] Branch merged via squash merge with a Conventional Commit message.
- [ ] Branch deleted after merge.

### 3.6 Security & Privacy

- [ ] No secrets, tokens, or credentials committed.
- [ ] No PII exposed in logs or responses.
- [ ] Authorization verified for all protected resources.
- [ ] Input validation on all user-supplied data.
- [ ] File uploads validated (type, size, sanitization).
- [ ] No SQL injection, XSS, or CSRF vulnerabilities introduced.
- [ ] Rate limiting considered for new endpoints.

### 3.7 Accessibility (UI Work)

- [ ] Keyboard operable.
- [ ] Visible focus states.
- [ ] Color contrast meets WCAG 2.1 AA.
- [ ] Form labels and error messages accessible.
- [ ] ARIA semantics correct (modals, tabs, alerts).
- [ ] Responsive across supported breakpoints.

### 3.8 Performance

- [ ] No N+1 queries introduced.
- [ ] List endpoints paginated.
- [ ] Assets optimized (images, bundles).
- [ ] Typical API responses sub-second for common reads.
- [ ] No blocking operations in render path.

### 3.9 Observability

- [ ] Structured logging for new API routes/services.
- [ ] Error tracking in place for new features.
- [ ] Health checks cover new critical dependencies (where applicable).

## 4. Definition of Done — Release Level

A release is **Done** when all MVP-level criteria are met for the included work items, **plus**:

- [ ] All MVP acceptance criteria from `docs/requirements/PRD.md` verified.
- [ ] Full test suite (unit + integration + E2E) passes in CI.
- [ ] Database migrations tested against production-like data.
- [ ] Rollback plan defined and tested (if applicable).
- [ ] Backup verified for database and object storage.
- [ ] Security review completed for the release scope.
- [ ] Performance/load smoke test passes (if applicable).
- [ ] Monitoring and alerting configured.
- [ ] Changelog updated.
- [ ] Version tag created (`vX.Y.Z`).
- [ ] Deployment to staging verified; production deploy planned/executed.
- [ ] Product owner (Ashutosh Singh) has reviewed and approved.

## 5. DoD Levels by Work Type

### 5.1 Bug Fix

- [ ] Bug reproduced and confirmed fixed.
- [ ] Regression test added (unit, integration, or E2E).
- [ ] Root cause documented in PR if non-obvious.
- [ ] No related bugs introduced.

### 5.2 Database Change

- [ ] Migration added with clear name and purpose.
- [ ] Migration backward-compatible (where possible).
- [ ] Seed data updated (categories, enums).
- [ ] Database design doc updated.
- [ ] Rollback considered.

### 5.3 API Change

- [ ] Request/response validated with Zod schema.
- [ ] Error responses follow `docs/architecture/api-design.md` conventions.
- [ ] Pagination applied to list endpoints.
- [ ] Authorization enforced per-resource.
- [ ] API design doc updated.

### 5.4 UI/UX Change

- [ ] Follows `docs/design/ui-guidelines.md`.
- [ ] Uses design tokens (no raw hex).
- [ ] Component added to `packages/ui` if reusable.
- [ ] Loading, empty, and error states included.
- [ ] Accessibility checklist passed.
- [ ] Responsive check passed.
- [ ] UX flow doc updated if flow changed.

### 5.5 Documentation Only

- [ ] Content is accurate and consistent with other docs.
- [ ] Internal links/anchors valid.
- [ ] Version/status header updated.
- [ ] Reviewed by a second person (or documented single-owner review for solo development).

### 5.6 Infrastructure Change

- [ ] Terraform/Infra-as-code files reviewed.
- [ ] `infrastructure/` docs updated.
- [ ] No secrets in config or scripts.
- [ ] Rollback plan defined.
- [ ] Deploy verified in staging first.

## 6. AI-Assisted Work Items

AI-assisted changes are held to the **same DoD** as human changes. Additionally:

- [ ] AI changes reviewed by a human before merge.
- [ ] Confidence verified — no unexplained or un-verifiable changes.
- [ ] Full CI run executed after AI changes.
- [ ] AI did not modify files outside the task scope without explicit approval.
- [ ] No generated boilerplate committed without review.

## 7. Not Done

A work item is **Not Done** if any of the following are true:

- CI is failing.
- Tests are missing for new critical logic.
- Authorization/security checks are incomplete.
- Docs are outdated for changed behavior.
- Review comments are unresolved.
- The feature is not usable by an end user in the expected environment.
- Known critical or major bugs remain.
- The acceptance criteria in the PRD/issue are not fully met.

## 8. DoD Workflow

1. **Developer/AI** implements the change.
2. **Author** runs the checklist (Sections 3.1–3.9).
3. **PR** created with the checklist in the description (see PR template in `git-strategy.md`).
4. **Reviewer** verifies the checklist during review.
5. **Product Owner** (Ashutosh Singh) confirms acceptance for user-facing features.
6. **Merge** happens only when all items are checked.
7. **Post-merge** verification: CI green on `main`, deploy smoke test passes.

## 9. Escalation & Exceptions

- Exceptions to the DoD require explicit approval from the **Product Owner**.
- Temporary deviations (e.g., skipped E2E in a hotfix) must be documented in the PR and tracked as a follow-up issue.
- If a DoD item is skipped, add a follow-up task in the issue tracker with a due date.

## 10. DoD Ownership

The **Product Owner** (Ashutosh Singh) owns the Definition of Done. The DoD is reviewed and updated as the project evolves — typically at each milestone (see `system-architecture.md` Delivery Milestones).

## 11. Milestone Release Checklist

For each milestone (M0–M10 from `docs/architecture/system-architecture.md`):

- [ ] All work items in the milestone meet the MVP DoD.
- [ ] PRD acceptance criteria for the milestone verified.
- [ ] E2E tests cover the milestone's critical journeys.
- [ ] Security & authorization verified for new surfaces.
- [ ] Performance verified for new search/filter/list endpoints.
- [ ] Monitoring/alerts configured for new services.
- [ ] Changelog updated.
- [ ] Milestone reviewed and signed off by the Product Owner.