# FundrHub — Git Strategy

**Product:** FundrHub — Founder ↔ Investor Discovery, Matching & Connection Platform  
**Founder & Product Owner:** Ashutosh Singh  
**Version:** 1.0  
**Status:** Initial baseline  

---

## 1. Purpose

This document defines the branching model, commit conventions, pull request workflow, and release process for the FundrHub monorepo. It ensures a predictable, reviewable, and recoverable development history for both human and AI-assisted contributors.

## 2. Branching Model

FundrHub uses a **trunk-based development** model with short-lived feature branches and a protected `main` branch.

### 2.1 Branches

| Branch      | Purpose                                                       | Protection                          |
|-------------|---------------------------------------------------------------|-------------------------------------|
| `main`      | Production-ready code; always deployable.                     | Protected; requires PR + CI + review |
| `develop`   | Integration branch for ongoing work (optional pre-release).   | Protected; requires PR + CI          |
| `feature/*` | Short-lived branches for a single feature or fix.             | None (deleted after merge)           |
| `fix/*`     | Short-lived branches for bug fixes.                           | None (deleted after merge)           |
| `release/*` | Release preparation branches (optional).                      | None (deleted after merge)           |
| `docs/*`    | Documentation-only changes.                                   | None (deleted after merge)           |

### 2.2 Branch Naming

```
feature/<short-description>
fix/<short-description>
docs/<short-description>
release/<version>
```

Examples:
- `feature/startup-creation`
- `fix/connection-request-email`
- `docs/api-design-update`
- `release/v0.1.0`

**Rules:**
- Use `kebab-case` for branch names.
- Keep branch names short and descriptive (≤ 50 chars).
- One branch = one logical unit of work.
- Branch from `main` (or `develop` if used) — never from another feature branch.

## 3. Commit Conventions

FundrHub follows **Conventional Commits** for all commit messages.

### 3.1 Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### 3.2 Types

| Type       | Description                                          |
|------------|------------------------------------------------------|
| `feat`     | New feature                                         |
| `fix`      | Bug fix                                             |
| `docs`     | Documentation only changes                          |
| `style`    | Formatting, whitespace, no code change              |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf`     | Performance improvement                            |
| `test`     | Adding or updating tests                            |
| `build`    | Build system or external dependencies               |
| `ci`       | CI configuration and scripts                        |
| `chore`    | Other changes that don't modify src or test         |
| `revert`   | Reverts a previous commit                           |

### 3.3 Scopes

| Scope      | Area                                        |
|------------|---------------------------------------------|
| `web`      | `apps/web`                                  |
| `mobile`   | `apps/mobile`                               |
| `api`      | `apps/api`                                  |
| `ui`       | `packages/ui`                               |
| `types`    | `packages/types`                            |
| `config`   | `packages/config`                           |
| `db`       | Prisma schema / migrations                  |
| `infra`    | `infrastructure/`                           |
| `e2e`      | `tests/e2e`                                 |
| `docs`     | `docs/`                                     |

### 3.4 Examples

```
feat(api): add connection request endpoints

fix(web): correct investor filter reset behavior

docs: add UI guidelines

test(api): add integration tests for startup search

chore: update ESLint config to v9

feat(db): add pitch_decks table and migration
```

### 3.5 Commit Rules

- **One logical change per commit.**
- Imperative mood: "add", "fix", "update" — not "added", "fixed".
- Description ≤ 72 characters; wrap body at 72.
- Reference issues in footer: `Closes #42`.
- Never commit generated files, secrets, or local config.
- Use `git add` with specific paths — avoid `git add .` unless intentional.

## 4. Pull Request Workflow

### 4.1 Creating a PR

1. Create a branch from `main` (or `develop`).
2. Make focused commits following Conventional Commits.
3. Push branch and open a PR against `main` (or `develop`).
4. PR title follows the same convention as commits:

```
feat(api): add connection request endpoints
```

5. PR description template:

```markdown
## Summary
<!-- What and why -->

## Changes
- [ ] List of changes

## Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Manual verification

## Related
Closes #<issue>
```

### 4.2 PR Requirements

- [ ] CI passes (lint, typecheck, tests, build).
- [ ] At least one review approval (human or documented AI review).
- [ ] No merge conflicts with target branch.
- [ ] Branch is up to date with target before merge.
- [ ] Docs updated if API/architecture/UX changed.

### 4.3 PR Size

- Keep PRs small and reviewable (< 400 lines of code change preferred).
- Split large features into multiple PRs.
- If a PR exceeds 800 lines, it must be split or explicitly justified.

### 4.4 Review Process

1. Author requests review.
2. Reviewer checks against `docs/development/coding-standards.md` checklist.
3. Reviewer leaves comments; author addresses or responds.
4. Re-request review after changes.
5. Approve when all concerns resolved.

### 4.5 Merge Strategy

- **Squash and merge** for feature branches into `main`/`develop`.
- Squash commit message = PR title (Conventional Commit).
- Delete branch after merge.
- Never merge with failing CI.

## 5. Release Process

### 5.1 Versioning

FundrHub uses **Semantic Versioning** (SemVer):

```
MAJOR.MINOR.PATCH
```

- `MAJOR` — breaking changes.
- `MINOR` — backward-compatible new features.
- `PATCH` — backward-compatible bug fixes.

### 5.2 Release Flow

1. Create `release/vX.Y.Z` branch from `main`.
2. Update version numbers in package manifests.
3. Update `CHANGELOG.md` (generated from Conventional Commits).
4. Run full test suite + E2E.
5. Tag release: `git tag vX.Y.Z`.
6. Merge release branch to `main`.
7. Deploy to production.
8. Hotfixes: `fix/*` branch from `main`, PR, squash merge, tag patch.

### 5.3 Tags

- Tags follow `vX.Y.Z` format (e.g., `v0.1.0`).
- Annotated tags only: `git tag -a v0.1.0 -m "Release v0.1.0"`.
- Tags created only from `main`.

## 6. CI/CD Pipeline

### 6.1 CI Checks (on every PR)

| Step            | Command                          |
|-----------------|----------------------------------|
| Install         | `npm ci`                         |
| Lint            | `npm run lint`                   |
| Format check    | `npm run format:check`           |
| Typecheck       | `npm run typecheck`              |
| Unit/Integration| `npm test`                       |
| Build           | `npm run build`                  |
| E2E (web)       | `npm run test:e2e`               |

### 6.2 CD (on merge to `main`)

- Build and deploy API.
- Build and deploy web.
- Run database migrations (with backup).
- Smoke tests against deployed environment.

## 7. Git Hygiene Rules

- **Never** force-push to shared branches (`main`, `develop`).
- **Never** commit directly to `main` or `develop`.
- **Never** commit `.env` files or secrets.
- **Never** commit `node_modules`, build output, or coverage reports.
- Keep `.gitignore` updated for all generated artifacts.
- Use `git pull --rebase` to sync feature branches with target.
- Resolve conflicts locally before pushing; never merge `main` into a feature branch repeatedly — rebase instead.

## 8. Monorepo Considerations

- Use **npm workspaces** (or equivalent) for the monorepo.
- Changes to `packages/*` affect all consumers — run full test suite.
- Shared package changes require a PR that updates all affected apps.
- Version shared packages together with apps in a release.

## 9. AI-Assisted Contribution Workflow

- AI-generated changes follow the same branch/PR/commit rules.
- AI should create focused commits, not one giant commit.
- AI PRs must pass the same CI checks.
- AI should not push directly to `main`/`develop`.
- AI-generated code must be reviewed by a human before merge.
- Use `docs/development/coding-standards.md` as the review baseline.

## 10. Emergency Hotfix Flow

1. Branch `fix/<critical-bug>` from `main`.
2. Fix + tests.
3. PR with `fix` type; expedited review.
4. Squash merge to `main`.
5. Tag patch release `vX.Y.Z+1`.
6. Deploy immediately.
7. Cherry-pick fix to `develop` if applicable.

## 11. Repository Setup Checklist

- [ ] `main` branch protected (require PR, CI, review).
- [ ] Branch protection: no direct pushes.
- [ ] Conventional Commits enforced (commitlint).
- [ ] CI configured for all checks.
- [ ] `.gitignore` covers all generated artifacts.
- [ ] `CHANGELOG.md` initialized.
- [ ] `CODEOWNERS` defined (if multiple owners).
- [ ] Issue templates and PR templates added.