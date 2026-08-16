# FundrHub — Product Requirements Document (PRD)

**Product:** FundrHub — Founder ↔ Investor Discovery, Matching & Connection Platform  
**Founder & Product Owner:** Ashutosh Singh  
**Version:** 1.0  
**Status:** Initial baseline  
**Source:** Derived from `FundrHub_Requirements_Analysis_v1.0.docx`

---

## 1. Executive Summary

FundrHub is a web and mobile marketplace that helps startup founders present investment opportunities and discover relevant investors, while allowing investors to discover, evaluate, shortlist and connect with startups. The MVP focuses on trusted profiles, startup/investor discovery, structured investment criteria, interest requests, messaging, moderation and an initial rule-based/AI-assisted matching capability.

## 2. Product Vision

Make fundraising discovery more structured, searchable and relevant than informal networking.

## 3. Goals

- Create a trusted digital identity for founders, startups and investors.
- Make startup and investor discovery searchable using structured criteria.
- Reduce irrelevant outreach through compatibility-based matching.
- Provide a controlled path from discovery → interest → connection → conversation.
- Create a scalable foundation for future deal-management and monetization features.

## 4. Non-Goals for MVP

- FundrHub will **not** hold investor funds or execute securities transactions.
- FundrHub will **not** guarantee investment, returns, valuation, or funding.
- No automated legal agreement execution in MVP.
- No public claim that an investor is verified unless verification has actually been completed.
- Advanced AI investment recommendations are a later phase; MVP matching must remain explainable.

## 5. Target Users

| Persona  | Needs                                        | Primary actions                                                       |
|----------|----------------------------------------------|-----------------------------------------------------------------------|
| Founder  | Raise capital and find relevant investors    | Create startup, publish pitch, search investors, request connection   |
| Investor | Find suitable startups efficiently           | Create criteria, search startups, shortlist, express interest, connect|
| Admin    | Keep marketplace safe and useful             | Moderate users/content, verify profiles, manage reports/categories    |

## 6. Core User Journeys

### 6.1 Founder Journey

1. Register → verify email/phone → choose Founder role.
2. Complete founder profile.
3. Create startup profile.
4. Enter sector, stage, geography, funding requirement, valuation/equity and traction.
5. Upload pitch deck and supporting media.
6. Submit startup for review/publish.
7. Search/filter investors or review matches.
8. Send connection/investment request.
9. Track pending/accepted/rejected requests.
10. Chat after a connection is accepted.

### 6.2 Investor Journey

1. Register → verify identity/contact details → choose Investor role.
2. Complete investor profile and investment preferences.
3. Set sectors, stages, geography and ticket size.
4. Discover startups through search, filters and matches.
5. Review startup profile and pitch deck.
6. Shortlist or express interest.
7. Accept connection and start conversation.

### 6.3 Admin Journey

1. Sign in to admin console.
2. Review users/startups awaiting moderation or verification.
3. Approve, reject, suspend or request changes.
4. Review reports and suspicious activity.
5. Manage sectors, stages and configurable marketplace settings.
6. View operational metrics.

## 7. MVP Functional Requirements

| ID      | Area              | Requirement                                                                 |
|---------|-------------------|-----------------------------------------------------------------------------|
| FR-001  | Authentication    | Email/password registration, login, logout, password reset and verified contact flow. |
| FR-002  | Role selection    | Founder and Investor roles; Admin is controlled separately.                 |
| FR-003  | Founder profile   | Name, bio, experience, location, social/professional links and profile completeness. |
| FR-004  | Investor profile  | Bio, investor type, geography, sectors, stages, ticket size and portfolio.  |
| FR-005  | Startup profile   | Name, logo, description, problem, solution, sector, stage, location, business model and team. |
| FR-006  | Fundraising details | Amount sought, valuation range, equity offered and use of funds.           |
| FR-007  | Traction          | Revenue/traction fields with optional evidence and period.                  |
| FR-008  | Pitch deck        | Secure upload, metadata, access controlled to authorized users.             |
| FR-009  | Startup discovery | Search, sort and filters for sector, stage, location and funding requirement. |
| FR-010  | Investor discovery| Search, sort and filters for sector, stage, location and ticket size.       |
| FR-011  | Matching          | Score compatibility between startup requirements and investor preferences; show reasons. |
| FR-012  | Shortlist         | Investor can shortlist startups; founder can save investors.                |
| FR-013  | Connection request| Founder/investor can request connection; recipient can accept/reject.       |
| FR-014  | Messaging         | Private conversation only after a valid connection, with basic reporting/blocking. |
| FR-015  | Notifications     | In-app and email notifications for requests, responses and messages.        |
| FR-016  | Moderation        | Admin review, suspend, reject, report and content moderation controls.      |
| FR-017  | Verification status | Display verification state clearly; never imply verification without completed checks. |
| FR-018  | Audit trail       | Record security-sensitive/admin actions and important marketplace events.   |
| FR-019  | Responsive web    | Core functionality available on desktop/tablet/mobile web.                  |
| FR-020  | Mobile app        | MVP mobile client for the core founder/investor flows.                      |

## 8. Business Rules

- A user must have a verified account before publishing a startup or sending connection requests.
- A startup must pass required profile validation before publication.
- Pitch decks are private by default and accessible only according to platform permissions.
- A connection request can have one active state: `pending`, `accepted`, `rejected`, `withdrawn` or `blocked`.
- Messaging is enabled only for accepted connections.
- Users can report profiles, startups or messages; admins can investigate and act.
- Suspended users cannot create new requests or communicate.
- Matching must show understandable factors rather than an unexplained score.
- FundrHub is a discovery/connection platform and does not promise funding outcomes.

## 9. Non-Functional Requirements

| Category      | MVP expectation                                                                 |
|---------------|----------------------------------------------------------------------------------|
| Security      | HTTPS, secure password hashing, token/session protection, authorization on every protected API. |
| Privacy       | Least-privilege access to profiles, decks and messages; deletion/export policy to be defined. |
| Performance   | Typical API responses should target sub-second server processing for common reads under normal load. |
| Availability  | Design for graceful failure and recoverability; production SLA to be defined later. |
| Scalability   | Stateless API design, indexed relational data and object storage for documents.  |
| Accessibility | Keyboard navigation, labels, readable contrast and accessible form errors.       |
| Observability | Structured logs, error tracking, health checks and basic metrics.                |
| Testing       | Unit, API, integration and Playwright end-to-end coverage for critical journeys. |

## 10. MVP Screens

- Landing / marketing page
- Login / registration / verification
- Role onboarding
- Founder dashboard
- Investor dashboard
- Founder profile
- Investor profile
- Create/edit startup
- Startup details
- Pitch deck viewer/download with authorization
- Startup search/results
- Investor search/results
- Matches
- Shortlists
- Connection requests
- Messages
- Notifications
- Settings
- Admin dashboard
- Moderation / reports

## 11. Data Entities — Initial

- `User`
- `FounderProfile`
- `InvestorProfile`
- `Startup`
- `StartupTeamMember`
- `FundingRound`
- `InvestmentPreference`
- `PitchDeck`
- `StartupMetric`
- `Shortlist`
- `ConnectionRequest`
- `Conversation`
- `Message`
- `Notification`
- `Report`
- `Verification`
- `AuditEvent`
- `Category`

## 12. Acceptance Criteria for MVP

1. A new founder can register, complete a profile, create a startup and submit it for publication.
2. A new investor can register and define investment preferences.
3. An investor can find startups using multiple filters and open a startup profile.
4. A founder can find investors using multiple filters.
5. The system can generate an explainable match score for compatible users.
6. A user can send a connection request and the recipient can accept/reject it.
7. Accepted connections can exchange private messages.
8. Admin can moderate users/startups and handle reports.
9. Critical workflows have automated tests and can run in CI.
10. Unauthorized users cannot access protected profiles, decks, messages or admin functions.

## 13. Future Roadmap

- AI pitch-deck analysis and founder feedback.
- AI investor/startup matching with explainable recommendations.
- Deal rooms and document workflows.
- Term-sheet workflow with appropriate legal review.
- Investor syndicates.
- Startup verification integrations.
- Advanced analytics.
- Premium subscriptions and featured listings.
- Mobile push notifications.
- Fraud/risk detection and marketplace trust scoring.

## 14. Open Decisions

- India-first launch or global from day one.
- Whether phone verification is required in MVP.
- Exact verification levels for founders and investors.
- Whether startup financial data is public, restricted or private.
- Initial messaging attachment rules.
- Exact monetization model.
- Hosting/provider selection based on current free-tier limits.
- Legal/privacy/compliance requirements for the launch geography.

## 15. Project Ownership

FundrHub is founded and product-owned by **Ashutosh Singh**. Ashutosh Singh is the Founder & Product Owner responsible for the product vision, business direction, requirements, prioritization and overall development roadmap.