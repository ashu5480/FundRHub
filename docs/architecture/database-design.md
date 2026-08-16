# FundrHub — Database Design

**Product:** FundrHub — Founder ↔ Investor Discovery, Matching & Connection Platform  
**Founder & Product Owner:** Ashutosh Singh  
**Version:** 1.0  
**Status:** Initial baseline  
**Source:** Derived from `FundrHub_Design_Document_v1.0.docx`

---

## 1. Overview

FundrHub uses **PostgreSQL** as the primary relational database with **Prisma** as the ORM. The schema is designed to support marketplace relationships, structured discovery, matching, connections, messaging and moderation. Object storage (S3-compatible) holds pitch decks and media files; the database stores only metadata and access references.

## 2. Design Principles

- **Relational integrity** for marketplace relationships.
- **Indexed search** for discovery performance.
- **Type-safe access** via Prisma.
- **Auditable** security-sensitive actions.
- **Least-privilege** data access.
- **Extensible** for future features (deal rooms, analytics, monetization).

## 3. Entity Relationship Overview

```
User
 ├── FounderProfile (1:1)
 ├── InvestorProfile (1:1)
 ├── Startup (1:N, as owner)
 ├── Shortlist (1:N)
 ├── ConnectionRequest (1:N, as sender/recipient)
 ├── Message (1:N, as sender)
 ├── Notification (1:N)
 ├── Report (1:N, as reporter)
 ├── Verification (1:N)
 └── AuditEvent (1:N, as actor)

Startup
 ├── StartupTeamMember (1:N)
 ├── FundingRound (1:N)
 ├── PitchDeck (1:N)
 ├── StartupMetric (1:N)
 └── ConnectionRequest (1:N, via startup_id)

InvestorProfile
 └── InvestmentPreference (1:1)

ConnectionRequest
 └── Conversation (1:1)

Conversation
 └── Message (1:N)

Category (reference data)
```

## 4. Table Definitions

### 4.1 `users`

| Column          | Type        | Constraints            | Description                          |
|-----------------|-------------|------------------------|--------------------------------------|
| `id`            | UUID        | PK, default gen_random_uuid() | Unique user identifier.       |
| `email`         | TEXT        | UNIQUE, NOT NULL       | User email address.                  |
| `password_hash` | TEXT        | NOT NULL               | Securely hashed password.            |
| `role`          | ENUM        | NOT NULL               | `FOUNDER`, `INVESTOR`, `ADMIN`.      |
| `status`        | ENUM        | NOT NULL, default `ACTIVE` | `ACTIVE`, `SUSPENDED`, `PENDING_VERIFICATION`. |
| `created_at`    | TIMESTAMPTZ | NOT NULL, default now() | Creation timestamp.                  |
| `updated_at`    | TIMESTAMPTZ | NOT NULL, default now() | Last update timestamp.               |

**Indexes:** `email` (unique), `role`, `status`.

### 4.2 `founder_profiles`

| Column          | Type        | Constraints            | Description                          |
|-----------------|-------------|------------------------|--------------------------------------|
| `id`            | UUID        | PK                     | Unique profile identifier.           |
| `user_id`       | UUID        | FK → users.id, UNIQUE  | Owning user.                         |
| `name`          | TEXT        | NOT NULL               | Founder's full name.                 |
| `bio`           | TEXT        |                        | Short biography.                     |
| `location`      | TEXT        |                        | Geographic location.                 |
| `experience`    | TEXT        |                        | Professional experience summary.     |
| `links`         | JSONB       |                        | Social/professional links.           |
| `created_at`    | TIMESTAMPTZ | NOT NULL, default now() | Creation timestamp.                 |
| `updated_at`    | TIMESTAMPTZ | NOT NULL, default now() | Last update timestamp.              |

**Indexes:** `user_id` (unique).

### 4.3 `investor_profiles`

| Column             | Type        | Constraints            | Description                          |
|--------------------|-------------|------------------------|--------------------------------------|
| `id`               | UUID        | PK                     | Unique profile identifier.           |
| `user_id`          | UUID        | FK → users.id, UNIQUE  | Owning user.                         |
| `investor_type`    | ENUM        | NOT NULL               | `ANGEL`, `VC`, `ACCELERATOR`, `FAMILY_OFFICE`, `OTHER`. |
| `bio`              | TEXT        |                        | Short biography.                     |
| `location`         | TEXT        |                        | Geographic location.                 |
| `portfolio_summary`| TEXT        |                        | Summary of portfolio companies.      |
| `created_at`       | TIMESTAMPTZ | NOT NULL, default now() | Creation timestamp.                 |
| `updated_at`       | TIMESTAMPTZ | NOT NULL, default now() | Last update timestamp.              |

**Indexes:** `user_id` (unique), `investor_type`.

### 4.4 `startups`

| Column          | Type        | Constraints            | Description                          |
|-----------------|-------------|------------------------|--------------------------------------|
| `id`            | UUID        | PK                     | Unique startup identifier.           |
| `owner_user_id` | UUID        | FK → users.id, NOT NULL| Owning founder user.                 |
| `name`          | TEXT        | NOT NULL               | Startup name.                        |
| `slug`          | TEXT        | UNIQUE, NOT NULL       | URL-friendly identifier.             |
| `description`   | TEXT        | NOT NULL               | Startup description.                 |
| `problem`       | TEXT        |                        | Problem being solved.                |
| `solution`      | TEXT        |                        | Proposed solution.                   |
| `sector`        | TEXT        | NOT NULL               | Industry sector.                     |
| `stage`         | ENUM        | NOT NULL               | `IDEA`, `SEED`, `EARLY`, `GROWTH`, `LATER`. |
| `location`      | TEXT        |                        | Geographic location.                 |
| `business_model`| TEXT        |                        | Business model description.          |
| `status`        | ENUM        | NOT NULL, default `DRAFT` | `DRAFT`, `PENDING_REVIEW`, `PUBLISHED`, `REJECTED`, `SUSPENDED`. |
| `created_at`    | TIMESTAMPTZ | NOT NULL, default now() | Creation timestamp.                 |
| `updated_at`    | TIMESTAMPTZ | NOT NULL, default now() | Last update timestamp.              |

**Indexes:** `owner_user_id`, `sector`, `stage`, `status`, `slug` (unique).

### 4.5 `funding_rounds`

| Column          | Type        | Constraints            | Description                          |
|-----------------|-------------|------------------------|--------------------------------------|
| `id`            | UUID        | PK                     | Unique round identifier.             |
| `startup_id`    | UUID        | FK → startups.id, NOT NULL | Owning startup.                  |
| `amount_sought` | NUMERIC     | NOT NULL               | Funding amount sought.               |
| `valuation`     | NUMERIC     |                        | Valuation range.                     |
| `equity_offered`| NUMERIC     |                        | Equity percentage offered.           |
| `use_of_funds`  | TEXT        |                        | Description of fund usage.           |
| `created_at`    | TIMESTAMPTZ | NOT NULL, default now() | Creation timestamp.                 |
| `updated_at`    | TIMESTAMPTZ | NOT NULL, default now() | Last update timestamp.              |

**Indexes:** `startup_id`.

### 4.6 `investment_preferences`

| Column          | Type        | Constraints            | Description                          |
|-----------------|-------------|------------------------|--------------------------------------|
| `id`            | UUID        | PK                     | Unique preference identifier.        |
| `investor_id`   | UUID        | FK → investor_profiles.id, UNIQUE | Owning investor profile. |
| `sectors`       | TEXT[]      | NOT NULL               | Preferred sectors.                   |
| `stages`        | ENUM[]      | NOT NULL               | Preferred startup stages.            |
| `geographies`   | TEXT[]      |                        | Preferred geographies.               |
| `min_ticket`    | NUMERIC     |                        | Minimum ticket size.                 |
| `max_ticket`    | NUMERIC     |                        | Maximum ticket size.                 |
| `created_at`    | TIMESTAMPTZ | NOT NULL, default now() | Creation timestamp.                 |
| `updated_at`    | TIMESTAMPTZ | NOT NULL, default now() | Last update timestamp.              |

**Indexes:** `investor_id` (unique), `sectors` (GIN), `stages` (GIN).

### 4.7 `startup_team_members`

| Column          | Type        | Constraints            | Description                          |
|-----------------|-------------|------------------------|--------------------------------------|
| `id`            | UUID        | PK                     | Unique member identifier.            |
| `startup_id`    | UUID        | FK → startups.id, NOT NULL | Owning startup.                 |
| `name`          | TEXT        | NOT NULL               | Member name.                         |
| `role`          | TEXT        | NOT NULL               | Role in the startup.                 |
| `bio`           | TEXT        |                        | Short biography.                     |
| `profile_link`  | TEXT        |                        | External profile link.               |
| `created_at`    | TIMESTAMPTZ | NOT NULL, default now() | Creation timestamp.                 |

**Indexes:** `startup_id`.

### 4.8 `pitch_decks`

| Column          | Type        | Constraints            | Description                          |
|-----------------|-------------|------------------------|--------------------------------------|
| `id`            | UUID        | PK                     | Unique deck identifier.              |
| `startup_id`    | UUID        | FK → startups.id, NOT NULL | Owning startup.                 |
| `object_key`    | TEXT        | NOT NULL               | Object storage key.                  |
| `file_name`     | TEXT        | NOT NULL               | Original file name.                  |
| `version`       | INTEGER     | NOT NULL, default 1    | Deck version.                        |
| `status`        | ENUM        | NOT NULL, default `ACTIVE` | `ACTIVE`, `ARCHIVED`.           |
| `uploaded_at`   | TIMESTAMPTZ | NOT NULL, default now() | Upload timestamp.                   |

**Indexes:** `startup_id`, `status`.

### 4.9 `startup_metrics`

| Column          | Type        | Constraints            | Description                          |
|-----------------|-------------|------------------------|--------------------------------------|
| `id`            | UUID        | PK                     | Unique metric identifier.            |
| `startup_id`    | UUID        | FK → startups.id, NOT NULL | Owning startup.                 |
| `metric_type`   | ENUM        | NOT NULL               | `REVENUE`, `USERS`, `GROWTH`, `OTHER`. |
| `value`         | NUMERIC     | NOT NULL               | Metric value.                        |
| `period`        | TEXT        |                        | Reporting period.                    |
| `visibility`    | ENUM        | NOT NULL, default `PRIVATE` | `PUBLIC`, `RESTRICTED`, `PRIVATE`. |
| `created_at`    | TIMESTAMPTZ | NOT NULL, default now() | Creation timestamp.                 |

**Indexes:** `startup_id`, `metric_type`.

### 4.10 `shortlists`

| Column          | Type        | Constraints            | Description                          |
|-----------------|-------------|------------------------|--------------------------------------|
| `id`            | UUID        | PK                     | Unique shortlist entry.              |
| `owner_user_id` | UUID        | FK → users.id, NOT NULL | Owning user.                       |
| `startup_id`    | UUID        | FK → startups.id        | Shortlisted startup (nullable).      |
| `investor_id`   | UUID        | FK → investor_profiles.id | Shortlisted investor (nullable).  |
| `created_at`    | TIMESTAMPTZ | NOT NULL, default now() | Creation timestamp.                 |

**Constraints:** At least one of `startup_id` or `investor_id` must be set.  
**Indexes:** `owner_user_id`, `startup_id`, `investor_id`.

### 4.11 `connection_requests`

| Column          | Type        | Constraints            | Description                          |
|-----------------|-------------|------------------------|--------------------------------------|
| `id`            | UUID        | PK                     | Unique request identifier.           |
| `sender_id`     | UUID        | FK → users.id, NOT NULL | Request sender.                    |
| `recipient_id`  | UUID        | FK → users.id, NOT NULL | Request recipient.                 |
| `startup_id`    | UUID        | FK → startups.id        | Related startup (optional).          |
| `status`        | ENUM        | NOT NULL, default `PENDING` | `PENDING`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`, `BLOCKED`. |
| `message`       | TEXT        |                        | Optional context message.            |
| `created_at`    | TIMESTAMPTZ | NOT NULL, default now() | Creation timestamp.                 |
| `updated_at`    | TIMESTAMPTZ | NOT NULL, default now() | Last update timestamp.              |

**Indexes:** `sender_id`, `recipient_id`, `status`, `startup_id`.

### 4.12 `conversations`

| Column                | Type        | Constraints            | Description                          |
|-----------------------|-------------|------------------------|--------------------------------------|
| `id`                  | UUID        | PK                     | Unique conversation identifier.      |
| `connection_request_id` | UUID      | FK → connection_requests.id, UNIQUE | Associated connection. |
| `created_at`          | TIMESTAMPTZ | NOT NULL, default now() | Creation timestamp.                 |

**Indexes:** `connection_request_id` (unique).

### 4.13 `messages`

| Column          | Type        | Constraints            | Description                          |
|-----------------|-------------|------------------------|--------------------------------------|
| `id`            | UUID        | PK                     | Unique message identifier.           |
| `conversation_id`| UUID       | FK → conversations.id, NOT NULL | Owning conversation.        |
| `sender_id`     | UUID        | FK → users.id, NOT NULL | Message sender.                    |
| `body`          | TEXT        | NOT NULL               | Message content.                     |
| `created_at`    | TIMESTAMPTZ | NOT NULL, default now() | Creation timestamp.                 |
| `read_at`       | TIMESTAMPTZ |                        | When message was read.               |
| `status`        | ENUM        | NOT NULL, default `ACTIVE` | `ACTIVE`, `REPORTED`, `REMOVED`. |

**Indexes:** `conversation_id`, `sender_id`, `created_at`.

### 4.14 `notifications`

| Column          | Type        | Constraints            | Description                          |
|-----------------|-------------|------------------------|--------------------------------------|
| `id`            | UUID        | PK                     | Unique notification identifier.      |
| `user_id`       | UUID        | FK → users.id, NOT NULL | Recipient user.                    |
| `type`          | ENUM        | NOT NULL               | `CONNECTION_REQUEST`, `CONNECTION_ACCEPTED`, `CONNECTION_REJECTED`, `NEW_MESSAGE`, `SYSTEM`. |
| `payload`       | JSONB       |                        | Notification data.                   |
| `read_at`       | TIMESTAMPTZ |                        | When notification was read.          |
| `created_at`    | TIMESTAMPTZ | NOT NULL, default now() | Creation timestamp.                 |

**Indexes:** `user_id`, `read_at`, `created_at`.

### 4.15 `reports`

| Column          | Type        | Constraints            | Description                          |
|-----------------|-------------|------------------------|--------------------------------------|
| `id`            | UUID        | PK                     | Unique report identifier.            |
| `reporter_id`   | UUID        | FK → users.id, NOT NULL | Reporting user.                    |
| `target_type`   | ENUM        | NOT NULL               | `USER`, `STARTUP`, `MESSAGE`.        |
| `target_id`     | UUID        | NOT NULL               | Target entity ID.                    |
| `reason`        | TEXT        | NOT NULL               | Report reason.                       |
| `status`        | ENUM        | NOT NULL, default `OPEN` | `OPEN`, `IN_REVIEW`, `RESOLVED`, `DISMISSED`. |
| `resolution`    | TEXT        |                        | Resolution notes.                    |
| `created_at`    | TIMESTAMPTZ | NOT NULL, default now() | Creation timestamp.                 |
| `updated_at`    | TIMESTAMPTZ | NOT NULL, default now() | Last update timestamp.              |

**Indexes:** `reporter_id`, `target_type`, `target_id`, `status`.

### 4.16 `verifications`

| Column          | Type        | Constraints            | Description                          |
|-----------------|-------------|------------------------|--------------------------------------|
| `id`            | UUID        | PK                     | Unique verification identifier.      |
| `user_id`       | UUID        | FK → users.id, NOT NULL | User being verified.              |
| `level`         | ENUM        | NOT NULL               | `EMAIL`, `PHONE`, `IDENTITY`, `BUSINESS`. |
| `status`        | ENUM        | NOT NULL, default `PENDING` | `PENDING`, `APPROVED`, `REJECTED`, `EXPIRED`. |
| `reviewed_by`   | UUID        | FK → users.id          | Admin who reviewed.                  |
| `reviewed_at`   | TIMESTAMPTZ |                        | Review timestamp.                    |
| `created_at`    | TIMESTAMPTZ | NOT NULL, default now() | Creation timestamp.                 |

**Indexes:** `user_id`, `level`, `status`.

### 4.17 `audit_events`

| Column          | Type        | Constraints            | Description                          |
|-----------------|-------------|------------------------|--------------------------------------|
| `id`            | UUID        | PK                     | Unique audit event identifier.       |
| `actor_id`      | UUID        | FK → users.id          | Acting user (nullable for system).   |
| `action`        | TEXT        | NOT NULL               | Action performed.                    |
| `entity_type`   | TEXT        | NOT NULL               | Entity type affected.                |
| `entity_id`     | UUID        | NOT NULL               | Entity ID affected.                  |
| `metadata`      | JSONB       |                        | Additional context.                  |
| `created_at`    | TIMESTAMPTZ | NOT NULL, default now() | Creation timestamp.                 |

**Indexes:** `actor_id`, `entity_type`, `entity_id`, `created_at`.

### 4.18 `categories`

| Column          | Type        | Constraints            | Description                          |
|-----------------|-------------|------------------------|--------------------------------------|
| `id`            | UUID        | PK                     | Unique category identifier.          |
| `type`          | ENUM        | NOT NULL               | `SECTOR`, `STAGE`, `INVESTOR_TYPE`.  |
| `name`          | TEXT        | NOT NULL               | Category name.                       |
| `active`        | BOOLEAN     | NOT NULL, default true | Whether category is active.          |
| `created_at`    | TIMESTAMPTZ | NOT NULL, default now() | Creation timestamp.                 |

**Indexes:** `type`, `active`.

## 5. Enums Summary

| Enum              | Values                                                              |
|-------------------|---------------------------------------------------------------------|
| `UserRole`        | `FOUNDER`, `INVESTOR`, `ADMIN`                                      |
| `UserStatus`      | `ACTIVE`, `SUSPENDED`, `PENDING_VERIFICATION`                       |
| `InvestorType`    | `ANGEL`, `VC`, `ACCELERATOR`, `FAMILY_OFFICE`, `OTHER`              |
| `StartupStage`    | `IDEA`, `SEED`, `EARLY`, `GROWTH`, `LATER`                          |
| `StartupStatus`   | `DRAFT`, `PENDING_REVIEW`, `PUBLISHED`, `REJECTED`, `SUSPENDED`     |
| `DeckStatus`      | `ACTIVE`, `ARCHIVED`                                                |
| `MetricType`      | `REVENUE`, `USERS`, `GROWTH`, `OTHER`                               |
| `MetricVisibility`| `PUBLIC`, `RESTRICTED`, `PRIVATE`                                   |
| `ConnectionStatus`| `PENDING`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`, `BLOCKED`           |
| `MessageStatus`   | `ACTIVE`, `REPORTED`, `REMOVED`                                     |
| `NotificationType`| `CONNECTION_REQUEST`, `CONNECTION_ACCEPTED`, `CONNECTION_REJECTED`, `NEW_MESSAGE`, `SYSTEM` |
| `ReportStatus`    | `OPEN`, `IN_REVIEW`, `RESOLVED`, `DISMISSED`                        |
| `ReportTargetType`| `USER`, `STARTUP`, `MESSAGE`                                        |
| `VerificationLevel`| `EMAIL`, `PHONE`, `IDENTITY`, `BUSINESS`                           |
| `VerificationStatus`| `PENDING`, `APPROVED`, `REJECTED`, `EXPIRED`                      |
| `CategoryType`    | `SECTOR`, `STAGE`, `INVESTOR_TYPE`                                  |

## 6. Indexing Strategy

- **Unique indexes** on natural keys: `users.email`, `startups.slug`.
- **Foreign key indexes** on all FK columns for join performance.
- **GIN indexes** on array columns: `investment_preferences.sectors`, `investment_preferences.stages`.
- **Composite indexes** for common search patterns:
  - `startups (sector, stage, status)`
  - `startups (status, created_at)`
  - `connection_requests (recipient_id, status)`
  - `messages (conversation_id, created_at)`
  - `notifications (user_id, read_at)`

## 7. Data Access & Privacy

- **Pitch decks:** stored in object storage; DB stores only metadata. Access controlled via authorization layer.
- **Startup metrics:** visibility field controls public/restricted/private access.
- **Messages:** only accessible to conversation participants and admins (for moderation).
- **Audit events:** append-only; accessible to admins.
- **PII:** email, phone and contact data must not appear in search indexes or logs.

## 8. Migration Strategy

- Use **Prisma Migrate** for schema versioning.
- Every schema change requires a reviewed migration.
- Migrations must be backward-compatible where possible.
- Seed data for `categories` (sectors, stages, investor types) in initial migration.

## 9. Future Extensions

- `deal_rooms` — private deal workspaces.
- `subscriptions` / `plans` — monetization.
- `featured_listings` — paid visibility.
- `ai_analyses` — AI pitch/deck analysis results.
- `push_tokens` — mobile push notifications.
- `blocked_users` — explicit block relationships.