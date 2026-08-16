# FundrHub — System Architecture

**Product:** FundrHub — Founder ↔ Investor Discovery, Matching & Connection Platform  
**Founder & Product Owner:** Ashutosh Singh  
**Version:** 1.0  
**Status:** Initial baseline  
**Source:** Derived from `FundrHub_Design_Document_v1.0.docx`

---

## 1. Design Principles

- **Trust first:** clear verification and privacy controls.
- **Mobile first, responsive web.**
- **Simple discovery before complex workflows.**
- **Explainable matching** rather than opaque recommendations.
- **API-first architecture** so web and mobile share backend services.
- **Security and authorization designed from the beginning.**
- **Modular implementation** so AI agents can work on bounded tasks.

## 2. Technology Stack

| Layer            | Initial choice                    | Reason                                                              |
|------------------|-----------------------------------|---------------------------------------------------------------------|
| Web              | Next.js + TypeScript              | Modern full-stack React ecosystem and strong web performance.       |
| Mobile           | React Native + Expo               | Single TypeScript codebase for Android/iOS and fast MVP iteration.  |
| Backend          | Node.js + TypeScript              | Shared language with clients; strong API ecosystem.                 |
| API              | REST initially                    | Simple, debuggable and easy for web/mobile integration.             |
| Database         | PostgreSQL                        | Mature relational model for marketplace relationships and search.   |
| ORM              | Prisma                            | Type-safe database access and migration workflow.                   |
| Auth             | Application auth with secure sessions/tokens | Keeps roles and authorization explicit.                    |
| Object storage   | S3-compatible storage             | Suitable for pitch decks and media.                                 |
| Realtime         | WebSocket/SSE later               | Messaging can start simple and evolve.                              |
| Testing          | Playwright + API/unit framework   | Critical for end-to-end product confidence.                         |
| CI/CD            | GitHub Actions or equivalent      | Automated build, test and deployment pipeline.                      |
| AI development   | VS Code + Cline/Roo Code + free/local models | Agent-assisted implementation with minimal recurring cost. |

## 3. High-Level Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   Web Client    │     │  Mobile Client  │
│  (Next.js/TS)   │     │ (RN + Expo/TS)  │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │ HTTPS / REST
              ┌──────▼──────┐
              │  API Gateway│
              │   Backend   │
              │ (Node.js/TS)│
              └──────┬──────┘
                     │
      ┌──────────────┼──────────────┐
      │              │              │
┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
│ PostgreSQL│  │  Object   │  │  AI       │
│ (Prisma)  │  │  Storage  │  │  Service  │
│           │  │ (S3-compat)│  │ (isolated)│
└───────────┘  └───────────┘  └───────────┘
```

Web and mobile clients call a shared backend API. The backend owns authentication, authorization, business rules, search, matching, messaging and moderation. PostgreSQL stores structured data; object storage holds pitch decks and media. AI services are isolated behind an internal service boundary so the core marketplace remains functional if an AI provider is unavailable.

## 4. Logical Architecture

| Component             | Responsibilities                                                              |
|-----------------------|-------------------------------------------------------------------------------|
| Web Client            | Public pages, onboarding, dashboards, discovery, profiles, messaging UI.      |
| Mobile Client         | Core founder/investor workflows, discovery, requests, messages and notifications. |
| API Gateway/Backend   | Authentication, authorization, validation, business logic and API responses.  |
| Auth Module           | Registration, login, verification, sessions/tokens, password reset.           |
| Profile Module        | Founder/investor profile CRUD and completeness.                               |
| Startup Module        | Startup CRUD, fundraising data, team, pitch deck metadata.                    |
| Discovery Module      | Search, filters, sorting, pagination.                                         |
| Matching Module       | Compatibility calculation and match explanations.                             |
| Connection Module     | Requests, acceptance/rejection, blocking.                                     |
| Messaging Module      | Conversations, messages, read state and moderation hooks.                     |
| Notification Module   | In-app/email/push event notifications.                                        |
| Moderation Module     | Reports, verification, suspension and audit actions.                          |
| AI Module             | Optional pitch analysis, recommendation and matching assistance.              |
| Persistence           | PostgreSQL + object storage.                                                  |

## 5. Repository Structure (Monorepo)

```
FundrHub/
├── apps/
│   ├── web/          # Next.js web client
│   ├── mobile/       # React Native + Expo mobile client
│   └── api/          # Node.js + TypeScript backend API
├── packages/
│   ├── ui/           # Shared UI components
│   ├── types/        # Shared TypeScript types
│   └── config/       # Shared configuration
├── docs/
│   ├── requirements/ # PRD and requirements
│   ├── architecture/ # System, database, API design
│   ├── design/       # UX flow and UI guidelines
│   └── development/  # Coding standards, git strategy, DoD
├── infrastructure/   # Deployment and infrastructure as code
└── tests/
    └── e2e/          # Playwright end-to-end tests
```

## 6. Module Boundaries & Responsibilities

### 6.1 Auth Module
- Registration, login, logout, password reset.
- Email/phone verification flow.
- Session/token management.
- Role assignment (Founder, Investor; Admin controlled separately).

### 6.2 Profile Module
- Founder profile CRUD and completeness scoring.
- Investor profile CRUD and completeness scoring.
- Investment preferences management.

### 6.3 Startup Module
- Startup CRUD.
- Fundraising round details.
- Team members.
- Pitch deck metadata and access control.
- Traction/metrics.

### 6.4 Discovery Module
- Search across startups and investors.
- Filtering by sector, stage, geography, funding requirement, ticket size.
- Sorting and pagination.

### 6.5 Matching Module
- Weighted compatibility scoring.
- Explainable match reasons.
- Configurable weights.

### 6.6 Connection Module
- Connection request lifecycle (pending → accepted/rejected/withdrawn/blocked).
- Shortlisting.

### 6.7 Messaging Module
- Conversations tied to accepted connections.
- Message CRUD and read state.
- Reporting/blocking hooks.

### 6.8 Notification Module
- In-app notifications.
- Email notifications.
- (Future) Push notifications.

### 6.9 Moderation Module
- Report management.
- Verification workflow.
- User/startup suspension.
- Audit event recording.

### 6.10 AI Module (Isolated)
- Pitch analysis (future).
- Recommendation assistance (future).
- Matching assistance (future).
- Must not block core marketplace if unavailable.

## 7. Security Architecture

- TLS in all deployed environments.
- Modern password hashing (e.g., bcrypt/argon2); never store plaintext.
- Server-side authorization on every protected resource.
- Role-based access control and ownership checks.
- File upload validation and sanitization; restricted types and size.
- Pitch decks stored outside public web root; authorized access only.
- Rate limiting on auth, requests and messaging endpoints.
- Parameterized/ORM queries to prevent SQL injection.
- Secure headers, CSRF protection, safe cookie/session configuration.
- Audit logging for security-sensitive admin actions.
- No private financial/contact data in search indexes or logs.

## 8. Deployment & Infrastructure

- **CI/CD:** GitHub Actions or equivalent for automated build, test, deploy.
- **Hosting:** To be selected based on free-tier limits and scaling needs.
- **Database:** Managed PostgreSQL with automated backups.
- **Object Storage:** S3-compatible storage for pitch decks and media.
- **Environment:** Separate dev/staging/production environments.
- **Observability:** Structured logs, error tracking, health checks, basic metrics.

## 9. Delivery Milestones

| Milestone | Description                                        |
|-----------|----------------------------------------------------|
| M0        | Requirements and architecture baseline.            |
| M1        | Repository + CI + database + authentication.       |
| M2        | Founder/investor profiles and onboarding.          |
| M3        | Startup creation + pitch deck + moderation.        |
| M4        | Discovery/search/filtering.                        |
| M5        | Matching + shortlist + connection requests.        |
| M6        | Messaging + notifications.                         |
| M7        | Mobile core flows.                                 |
| M8        | Security hardening + automated regression.         |
| M9        | Beta deployment and feedback.                      |
| M10       | Monetization and advanced AI features.             |

## 10. Important Product/Legal Guardrails

- FundrHub is positioned initially as a **discovery and networking platform**.
- Before launch, legal counsel should review:
  - Securities/fundraising regulations.
  - Privacy/data protection.
  - KYC/verification claims.
  - Terms of service.
  - Investor/founder disclaimers.
  - Content rights.
  - Jurisdiction-specific requirements.
- The product must **not** represent AI matching as investment advice or guarantee funding.

## 11. Project Ownership

FundrHub is founded and product-owned by **Ashutosh Singh**. Ashutosh Singh is the Founder & Product Owner responsible for the product vision, business direction, requirements, prioritization and overall development roadmap.