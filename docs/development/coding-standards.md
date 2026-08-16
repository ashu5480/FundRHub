# FundrHub — Coding Standards

**Product:** FundrHub — Founder ↔ Investor Discovery, Matching & Connection Platform  
**Founder & Product Owner:** Ashutosh Singh  
**Version:** 1.0  
**Status:** Initial baseline  

---

## 1. Purpose

This document defines the coding conventions, language standards, file organization, and quality requirements for all FundrHub codebases — web, mobile, API, and shared packages. It ensures consistency, maintainability, and enables AI-assisted and multi-contributor development.

## 2. Technology Baseline

| Area         | Requirement                                      |
|--------------|--------------------------------------------------|
| Language     | TypeScript (strict mode)                         |
| Web          | Next.js (App Router) + React                     |
| Mobile       | React Native + Expo                              |
| API          | Node.js + TypeScript (REST)                      |
| Database     | PostgreSQL + Prisma ORM                          |
| Test runner  | Vitest / Jest for unit & integration             |
| E2E          | Playwright                                       |
| Linting      | ESLint + TypeScript ESLint                       |
| Formatting   | Prettier                                         |
| CI           | GitHub Actions                                   |

## 3. TypeScript Standards

### 3.1 Strict Mode

- `strict: true` is **required** in all `tsconfig.json` files.
- `noImplicitAny` is enabled via strict mode.
- `noUncheckedIndexedAccess: true` recommended.
- No use of `any` unless explicitly justified and documented with `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- reason`.
- Prefer `unknown` over `any` for values of unknown type.

### 3.2 Type Definitions

- Use **interfaces** for object shapes and API contracts; use **type aliases** for unions, tuples, and mapped types.
- All shared types live in `packages/types` and are consumed by web, mobile, and API.
- API request/response types must be defined once in `packages/types` and shared.
- Prefer domain-specific types over primitive types:

```ts
// Bad
function getStartup(id: string) { ... }

// Good
type StartupId = string & { readonly __brand: unique symbol };
function getStartup(id: StartupId) { ... }
```

- Avoid deep nesting (>3 levels); flatten DTOs where practical.

### 3.3 Generics

- Use generics for reusable collections and utilities.
- Keep generic names descriptive: `TData`, `TEntity`.
- Avoid overly complex generic types; split into smaller named types.

### 3.4 Nullability

- Use `T | null` for nullable values; avoid `undefined` in data models unless truly optional.
- Validate external input before trusting its type (schema validation required).
- Use `?? ` for defaulting, not `|| `, when falsy values (0, "", false) are valid.

## 4. File Naming Conventions

| Kind             | Convention                | Example                     |
|------------------|---------------------------|-----------------------------|
| React components | `PascalCase.tsx`          | `StartupCard.tsx`           |
| Hooks            | `useCamelCase.ts`         | `useStartups.ts`            |
| API routes       | `kebab-case`              | `startup-requests.ts`       |
| Services/utils   | `camelCase.ts`            | `matchService.ts`           |
| Types            | `camelCase.ts` or `types.ts` | `startup.types.ts`      |
| Constants        | `CONSTANT_NAME.ts`        | `MATCH_WEIGHTS.ts`          |
| Tests            | `name.test.ts(x)`         | `matchService.test.ts`      |
| Prisma schema    | `schema.prisma`           | (fixed name)                |
| Config files     | `-` plus kebab-case       | `eslint.config.mjs`         |

**Rules:**
- One main export per file (except barrel/index files).
- Barrel `index.ts` files re-export public API of a directory only.
- No file names over ~50 characters.

## 5. Folder Structure

### 5.1 Shared (`packages/`)

| Package            | Contents                                          |
|--------------------|---------------------------------------------------|
| `packages/types`   | Shared TypeScript types, enums, DTOs              |
| `packages/ui`      | Shared React components, design tokens            |
| `packages/config`  | Shared configs (ESLint, TS, Prettier, constants)  |

### 5.2 Web (`apps/web`)

```
src/
├── app/              # Next.js App Router pages
├── components/       # Feature components
├── hooks/            # Custom hooks
├── lib/              # Utilities, API clients, config
├── services/         # API calls / server actions
├── stores/           # Client state (if used)
├── styles/           # Global styles, tokens
└── types/            # App-specific types (rare; prefer shared)
```

### 5.3 Mobile (`apps/mobile`)

```
src/
├── app/              # Expo Router pages
├── components/       # Feature components
├── hooks/            # Custom hooks
├── lib/              # Utilities, API clients
├── services/         # API calls
├── stores/           # Client state (if used)
├── theme/            # Design tokens, theme
└── types/            # App-specific types (rare; prefer shared)
```

### 5.4 API (`apps/api`)

```
src/
├── app/              # Express/Fastify app setup
├── routes/           # Route handlers
├── controllers/      # Request handling / orchestration
├── services/         # Business logic
├── repositories/     # Data access (Prisma wrappers)
├── middlewares/      # Auth, validation, error handling, rate limiting
├── schemas/          # Zod/validation schemas
├── lib/              # Utilities, config
└── types/            # API-specific types (rare; prefer shared)
```

## 6. Naming Conventions

### 6.1 Variables & Functions

- `camelCase` for variables, functions and instance properties.
- `PascalCase` for classes, types, interfaces and components.
- Booleans: prefix with `is`, `has`, `can`, `should` — e.g., `isVerified`, `hasPitchDeck`.
- Avoid single-letter variable names except for throwaway loop indices (`i`, `j`).
- Descriptive names over abbreviations: `startupOwnerId` not `soId`.

### 6.2 Functions

- Prefer named function declarations for top-level utilities.
- Use arrow functions for inline callbacks.
- Function names should start with a verb: `getStartupById`, `createConnectionRequest`, `isEmailValid`.

### 6.3 React Components

- Component file name == component name (PascalCase).
- Props interface named `${ComponentName}Props`.
- Use function components only (no class components).
- Destructure props at the top of the function.
- Event handlers: `handle` prefix — `handleSubmit`, `handleChange`.

### 6.4 Types

- Interface: `Startup`, `ConnectionRequest`.
- Type alias: `ConnectionStatus`, `UserRole`, `Nullable<T>`.
- Enum values: `UPPER_SNAKE_CASE` (TS enum) or string literal union.

### 6.5 API

- REST resource names: plural `kebab-case` (`/startup-requests`).
- Route parameters: `camelCase` (`{startupId}`).
- Query parameters: `camelCase` (`minAmount`, `page`, `limit`).
- JSON body keys: `camelCase` (consistent across API).

## 7. Formatting (Prettier)

Shared `.prettierrc` recommended:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

- Run Prettier as part of pre-commit hook and CI check.
- Never commit unformatted code; use `prettier --check` in CI.

## 8. Linting (ESLint)

Recommended plugins:
- `@typescript-eslint`
- `eslint-plugin-react` / `eslint-plugin-react-hooks` (web/mobile)
- `eslint-plugin-import` (import order)
- `eslint-plugin-playwright` (test files)

Non-negotiable rules:
- `@typescript-eslint/no-explicit-any`: error (except documented)
- `@typescript-eslint/no-unused-vars`: error (allow `_` prefix)
- `@typescript-eslint/consistent-type-imports`: error (use `import type`)
- `react-hooks/rules-of-hooks`: error
- `react-hooks/exhaustive-deps`: warn
- `import/order`: required grouped import order:

```
1. Node builtins / external packages
2. Internal packages (@fundrhub/*)
3. Relative imports
```

## 9. React & Component Standards

### 9.1 Component Patterns

- Functional components with hooks only.
- One component per file (except tiny sub-components tightly coupled, which may stay colocated).
- Keep components focused: extract logic into hooks and services.
- Default to Server Components in Next.js App Router unless interactivity requires client.

### 9.2 Hooks

- Custom hooks named `useXxx`.
- Hooks should return stable references (use `useCallback`, `useMemo` where needed).
- Never call hooks conditionally or in loops.
- Data fetching: prefer server-side/server actions on web; use a consistent query library (TanStack Query) on mobile and client-side.

### 9.3 Forms

- Use a validated form library (React Hook Form + Zod).
- Typed form values; Zod schema as single source of truth.
- Error messages from Zod schema.

### 9.4 Styling

- Use design tokens from `packages/ui` — no raw hex in feature code.
- Tailwind CSS for web with token-mapped utility classes.
- Mobile: Styled Components / NativeWind mapping to tokens.
- No inline `style=` for layout; allowed rarely for dynamic measurement.

## 10. API Coding Standards

### 10.1 Route Structure

- Each route file handles one resource group.
- Validation happens in middleware/schema before controller.
- Controllers are thin; business logic lives in services.

### 10.2 Validation

- Every request body, query, and params validated with Zod (or equivalent).
- Schemas colocated with routes or in `src/schemas`.
- Return `VALIDATION_ERROR` (400) with field details.

### 10.3 Errors

- Use a consistent error class / factory (see `api-design.md`).
- Never leak stack traces or internal details to clients.
- Log full error server-side; return sanitized error to client.

### 10.4 Authentication & Authorization

- All protected routes require authentication middleware.
- Authorization checked per-resource (ownership, role).
- Never trust client-supplied IDs for authorization (always look up ownership server-side).

### 10.5 Pagination

- List endpoints always paginated (`page`, `limit`, max 100).
- Return `{ items, pagination }` consistently.

### 10.6 Naming (API)

- Use `camelCase` in JSON.
- Resource IDs named `{entity}Id` (e.g., `startupId`).
- Consistency over brevity.

## 11. Database / Prisma Standards

### 11.1 Schema

- Enums defined in Prisma schema; shared to TS via generated types.
- Field naming: `camelCase` (Prisma default).
- Table names: plural `snake_case` in DB; Prisma model PascalCase.
- All models have `id` (UUID), `createdAt`, `updatedAt` where mutable.

### 11.2 Migrations

- One migration per logical change; commit separately with clear message.
- Backward-compatible where possible.
- Never edit applied migrations; create new ones.

### 11.3 Access

- All DB access through repositories/services — no raw queries in routes/controllers.
- Use Prisma transactions for multi-write operations.
- Avoid N+1: use `include` or `select` deliberately.

## 12. Testing Standards

### 12.1 Test Pyramid

- **Unit:** services, utilities, pure functions — fast, isolated.
- **Integration:** API routes with real/test DB and repositories.
- **E2E:** critical user journeys via Playwright (web).

### 12.2 Unit Tests

- File: `*.test.ts` colocated with source or in `__tests__`.
- One behavior per test; descriptive test names (`should return 404 when startup not found`).
- Use factories/fixtures; avoid heavy setup duplication.

### 12.3 API/Integration Tests

- Use a test database; seed minimal, known data.
- Test success and error paths, validation, and authorization.
- Clean up data between tests.

### 12.4 E2E Tests

- Located in `tests/e2e`.
- Cover critical journeys from PRD acceptance criteria.
- Use data-testid attributes (`data-testid="startup-card"`) — never rely on CSS/text only.
- Must run in CI.

### 12.5 Coverage

- Target ≥ 80% coverage for services and utilities.
- No requirement to hit coverage targets for pure UI if E2E covers critical flows.

## 13. Git Hygiene

- Commit messages follow Conventional Commits (see `git-strategy.md`).
- No generated files committed (`node_modules`, build output, `.env`).
- Large files (>10MB) go to storage, not git.
- Secrets never committed; use environment variables.

## 14. Code Review Standards

### 14.1 Author Checklist (Before Requesting Review)

- [ ] Passes `npm run lint` with zero errors.
- [ ] Passes `npm run format:check`.
- [ ] Tests added/updated; `npm test` green.
- [ ] TypeScript build passes (`npm run typecheck`).
- [ ] No dead code / commented-out code.
- [ ] No debug logs (temporary `console.log` removed).
- [ ] New features covered by unit and/or integration test.
- [ ] Migration included with the change, if schema changed.

### 14.2 Reviewer Checklist

- [ ] Code is readable and follows naming conventions.
- [ ] Logic verified — no missed edge cases.
- [ ] Errors handled consistently.
- [ ] Security: no injection, no IDOR, no exposed secrets.
- [ ] Performance: no N+1 queries, no blocking calls in render.
- [ ] Accessibility (for UI): semantics, keyboard, contrast.
- [ ] Tests genuinely assert the behavior.

## 15. Documentation Requirements

- Every public service/function has a JSDoc/TSDoc comment explaining *why*, not just *what*.
- Complex modules include a brief README or inline architecture note.
- API changes update `docs/architecture/api-design.md`.
- New entities update `docs/architecture/database-design.md`.
- New user flows update `docs/design/ux-flow.md`.
- New UI components are documented in Storybook.

## 16. AI-Assisted Development Guidelines

FundrHub uses AI-assisted development (Cline/Roo Code). To keep the codebase maintainable:

- AI-generated code must follow the same standards as human-written code.
- Always run lint/typecheck/tests after AI-generated changes.
- AI should generate code in small, reviewable increments.
- Keep `@fundrhub/*` package boundaries; no circular imports.
- Do not commit code you (the developer) have not reviewed and understood.
- Prefer readable, well-named code over clever/anonymous logic.
- Update docs when AI changes architecture or API contracts.

## 17. Definition of Done Reference

This document complements `docs/development/definition-of-done.md`. Coding-level requirements above are the minimum bar for *any* code merged to `develop` or `main`.