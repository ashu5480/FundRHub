# FundrHub — API Design

**Product:** FundrHub — Founder ↔ Investor Discovery, Matching & Connection Platform  
**Founder & Product Owner:** Ashutosh Singh  
**Version:** 1.0  
**Status:** Initial baseline  
**Source:** Derived from `FundrHub_Design_Document_v1.0.docx`

---

## 1. Overview

FundrHub uses a **REST API** initially, shared by both web and mobile clients. The API is versioned under `/api/v1`. All endpoints require authentication unless explicitly marked as public. The API is **stateless** and uses secure tokens/sessions for authentication.

## 2. API Conventions

- **Base URL:** `/api/v1`
- **Format:** JSON request/response
- **Authentication:** Bearer token or secure session cookie
- **Versioning:** URL-based (`/api/v1/...`)
- **Errors:** Consistent error response structure
- **Pagination:** `page` and `limit` query parameters for list endpoints
- **Sorting:** `sort` query parameter (e.g., `sort=created_at:desc`)
- **Filtering:** Query parameters for structured filters

## 3. Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "A human-readable error message",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### Common Error Codes

| Code                  | HTTP Status | Description                          |
|-----------------------|-------------|--------------------------------------|
| `VALIDATION_ERROR`    | 400         | Request validation failed.           |
| `UNAUTHORIZED`        | 401         | Missing or invalid authentication.   |
| `FORBIDDEN`           | 403         | Authenticated but not authorized.    |
| `NOT_FOUND`           | 404         | Resource not found.                  |
| `CONFLICT`            | 409         | Resource state conflict.             |
| `RATE_LIMITED`        | 429         | Too many requests.                   |
| `INTERNAL_ERROR`      | 500         | Unexpected server error.             |

## 4. Authentication Endpoints

### POST `/api/v1/auth/register`

Create a new account.

**Request:**
```json
{
  "email": "founder@example.com",
  "password": "secure-password",
  "role": "FOUNDER"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "founder@example.com",
    "role": "FOUNDER",
    "status": "PENDING_VERIFICATION"
  }
}
```

### POST `/api/v1/auth/login`

Authenticate a user.

**Request:**
```json
{
  "email": "founder@example.com",
  "password": "secure-password"
}
```

**Response (200):**
```json
{
  "token": "jwt-or-session-token",
  "user": {
    "id": "uuid",
    "email": "founder@example.com",
    "role": "FOUNDER",
    "status": "ACTIVE"
  }
}
```

### POST `/api/v1/auth/logout`

End the current session.

**Response (204):** No content.

### POST `/api/v1/auth/verify-email`

Verify email address with a token.

**Request:**
```json
{
  "token": "verification-token"
}
```

**Response (200):**
```json
{
  "message": "Email verified successfully"
}
```

### POST `/api/v1/auth/forgot-password`

Request a password reset email.

**Request:**
```json
{
  "email": "founder@example.com"
}
```

**Response (200):**
```json
{
  "message": "If the email exists, a reset link has been sent"
}
```

### POST `/api/v1/auth/reset-password`

Reset password with a token.

**Request:**
```json
{
  "token": "reset-token",
  "password": "new-secure-password"
}
```

**Response (200):**
```json
{
  "message": "Password reset successfully"
}
```

## 5. User Endpoints

### GET `/api/v1/me`

Get the current authenticated user.

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "founder@example.com",
    "role": "FOUNDER",
    "status": "ACTIVE",
    "founderProfile": { "...": "..." },
    "investorProfile": { "...": "..." }
  }
}
```

## 6. Founder Profile Endpoints

### PUT `/api/v1/founder/profile`

Create or update the founder profile.

**Request:**
```json
{
  "name": "Ashutosh Singh",
  "bio": "Serial entrepreneur building FundrHub",
  "location": "Bengaluru, India",
  "experience": "10+ years in SaaS and marketplaces",
  "links": {
    "linkedin": "https://linkedin.com/in/ashutosh",
    "twitter": "https://twitter.com/ashutosh"
  }
}
```

**Response (200):**
```json
{
  "founderProfile": {
    "id": "uuid",
    "name": "Ashutosh Singh",
    "bio": "Serial entrepreneur building FundrHub",
    "location": "Bengaluru, India",
    "experience": "10+ years in SaaS and marketplaces",
    "links": {
      "linkedin": "https://linkedin.com/in/ashutosh",
      "twitter": "https://twitter.com/ashutosh"
    },
    "completeness": 80
  }
}
```

### GET `/api/v1/founder/profile`

Get the current user's founder profile.

**Response (200):** Same structure as above.

## 7. Investor Profile Endpoints

### PUT `/api/v1/investor/profile`

Create or update the investor profile.

**Request:**
```json
{
  "investorType": "ANGEL",
  "bio": "Angel investor focused on early-stage SaaS",
  "location": "Mumbai, India",
  "portfolioSummary": "Invested in 5 startups across fintech and SaaS"
}
```

**Response (200):**
```json
{
  "investorProfile": {
    "id": "uuid",
    "investorType": "ANGEL",
    "bio": "Angel investor focused on early-stage SaaS",
    "location": "Mumbai, India",
    "portfolioSummary": "Invested in 5 startups across fintech and SaaS",
    "completeness": 75
  }
}
```

### GET `/api/v1/investor/profile`

Get the current user's investor profile.

**Response (200):** Same structure as above.

## 8. Investment Preference Endpoints

### PUT `/api/v1/investor/preferences`

Create or update investment preferences.

**Request:**
```json
{
  "sectors": ["SAAS", "FINTECH", "HEALTHTECH"],
  "stages": ["SEED", "EARLY"],
  "geographies": ["INDIA", "SOUTHEAST_ASIA"],
  "minTicket": 100000,
  "maxTicket": 1000000
}
```

**Response (200):**
```json
{
  "preferences": {
    "id": "uuid",
    "sectors": ["SAAS", "FINTECH", "HEALTHTECH"],
    "stages": ["SEED", "EARLY"],
    "geographies": ["INDIA", "SOUTHEAST_ASIA"],
    "minTicket": 100000,
    "maxTicket": 1000000
  }
}
```

### GET `/api/v1/investor/preferences`

Get the current user's investment preferences.

**Response (200):** Same structure as above.

## 9. Startup Endpoints

### POST `/api/v1/startups`

Create a new startup.

**Request:**
```json
{
  "name": "FundrHub",
  "description": "Founder-investor discovery platform",
  "problem": "Fundraising discovery is unstructured and inefficient",
  "solution": "Structured profiles, matching and connections",
  "sector": "FINTECH",
  "stage": "SEED",
  "location": "Bengaluru, India",
  "businessModel": "Subscription + featured listings",
  "fundingRound": {
    "amountSought": 500000,
    "valuation": 5000000,
    "equityOffered": 10,
    "useOfFunds": "Product development and team expansion"
  },
  "teamMembers": [
    {
      "name": "Ashutosh Singh",
      "role": "Founder & CEO",
      "bio": "10+ years in SaaS",
      "profileLink": "https://linkedin.com/in/ashutosh"
    }
  ]
}
```

**Response (201):**
```json
{
  "startup": {
    "id": "uuid",
    "name": "FundrHub",
    "slug": "fundrhub",
    "status": "DRAFT",
    "sector": "FINTECH",
    "stage": "SEED",
    "location": "Bengaluru, India"
  }
}
```

### GET `/api/v1/startups/{id}`

Get a startup by ID.

**Response (200):**
```json
{
  "startup": {
    "id": "uuid",
    "name": "FundrHub",
    "slug": "fundrhub",
    "description": "Founder-investor discovery platform",
    "problem": "Fundraising discovery is unstructured and inefficient",
    "solution": "Structured profiles, matching and connections",
    "sector": "FINTECH",
    "stage": "SEED",
    "location": "Bengaluru, India",
    "businessModel": "Subscription + featured listings",
    "status": "PUBLISHED",
    "owner": {
      "id": "uuid",
      "name": "Ashutosh Singh"
    },
    "fundingRound": {
      "amountSought": 500000,
      "valuation": 5000000,
      "equityOffered": 10,
      "useOfFunds": "Product development and team expansion"
    },
    "teamMembers": [
      {
        "name": "Ashutosh Singh",
        "role": "Founder & CEO"
      }
    ],
    "metrics": [
      {
        "metricType": "REVENUE",
        "value": 25000,
        "period": "2024-Q4",
        "visibility": "RESTRICTED"
      }
    ]
  }
}
```

### PUT `/api/v1/startups/{id}`

Update a startup.

**Request:** Partial update of startup fields.

**Response (200):** Updated startup object.

### POST `/api/v1/startups/{id}/submit`

Submit a startup for review/publication.

**Response (200):**
```json
{
  "startup": {
    "id": "uuid",
    "status": "PENDING_REVIEW"
  }
}
```

### GET `/api/v1/startups`

Search and filter startups.

**Query Parameters:**
- `q` — text search
- `sector` — filter by sector
- `stage` — filter by stage
- `location` — filter by location
- `minAmount` — minimum funding amount
- `maxAmount` — maximum funding amount
- `sort` — sort field and direction
- `page` — page number (default 1)
- `limit` — items per page (default 20, max 100)

**Response (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "FundrHub",
      "slug": "fundrhub",
      "sector": "FINTECH",
      "stage": "SEED",
      "location": "Bengaluru, India",
      "amountSought": 500000,
      "matchScore": 85
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

### GET `/api/v1/investors`

Search and filter investors.

**Query Parameters:**
- `q` — text search
- `sector` — filter by preferred sector
- `stage` — filter by preferred stage
- `location` — filter by location
- `investorType` — filter by investor type
- `minTicket` — minimum ticket size
- `maxTicket` — maximum ticket size
- `sort` — sort field and direction
- `page` — page number (default 1)
- `limit` — items per page (default 20, max 100)

**Response (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Investor Name",
      "investorType": "ANGEL",
      "location": "Mumbai, India",
      "sectors": ["SAAS", "FINTECH"],
      "stages": ["SEED", "EARLY"],
      "minTicket": 100000,
      "maxTicket": 1000000,
      "verificationStatus": "APPROVED"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

## 10. Pitch Deck Endpoints

### POST `/api/v1/startups/{id}/pitch-decks`

Upload a pitch deck (multipart/form-data).

**Request:**
- `file` — the deck file (PDF, PPT, PPTX)
- `version` — optional version number

**Response (201):**
```json
{
  "pitchDeck": {
    "id": "uuid",
    "startupId": "uuid",
    "fileName": "fundrhub-pitch-v1.pdf",
    "version": 1,
    "status": "ACTIVE"
  }
}
```

### GET `/api/v1/startups/{id}/pitch-decks`

List pitch decks for a startup (authorized users only).

**Response (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "fileName": "fundrhub-pitch-v1.pdf",
      "version": 1,
      "status": "ACTIVE",
      "uploadedAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### GET `/api/v1/pitch-decks/{id}/download`

Download a pitch deck (authorized users only).

**Response (200):** File stream with appropriate content-type.

## 11. Matching Endpoints

### POST `/api/v1/matches`

Get matches for the current user.

**Request:**
```json
{
  "targetType": "STARTUP",  // or "INVESTOR"
  "filters": {
    "sector": "FINTECH",
    "stage": "SEED"
  },
  "page": 1,
  "limit": 20
}
```

**Response (200):**
```json
{
  "items": [
    {
      "target": {
        "id": "uuid",
        "name": "FundrHub",
        "sector": "FINTECH",
        "stage": "SEED",
        "location": "Bengaluru, India"
      },
      "score": 85,
      "reasons": [
        {
          "factor": "SECTOR",
          "weight": 30,
          "matched": true,
          "label": "Sector match"
        },
        {
          "factor": "STAGE",
          "weight": 20,
          "matched": true,
          "label": "Stage preference matches"
        },
        {
          "factor": "TICKET_SIZE",
          "weight": 20,
          "matched": true,
          "label": "Ticket size fits"
        },
        {
          "factor": "GEOGRAPHY",
          "weight": 10,
          "matched": false,
          "label": "Geography differs"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 8,
    "totalPages": 1
  }
}
```

### Matching Weights (Configurable)

| Factor                    | Default Weight |
|---------------------------|----------------|
| Sector compatibility      | 30%            |
| Startup stage / investor stage | 20%       |
| Ticket size compatibility | 20%            |
| Geography compatibility   | 10%            |
| Business model/interest   | 10%            |
| Other preferences         | 10%            |

## 12. Shortlist Endpoints

### POST `/api/v1/shortlists`

Add an item to the user's shortlist.

**Request:**
```json
{
  "startupId": "uuid"  // or "investorId": "uuid"
}
```

**Response (201):**
```json
{
  "shortlist": {
    "id": "uuid",
    "startupId": "uuid",
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

### GET `/api/v1/shortlists`

List the user's shortlist.

**Response (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "startup": { "...": "..." },
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### DELETE `/api/v1/shortlists/{id}`

Remove an item from the shortlist.

**Response (204):** No content.

## 13. Connection Request Endpoints

### POST `/api/v1/connections`

Create a connection request.

**Request:**
```json
{
  "recipientId": "uuid",
  "startupId": "uuid",
  "message": "I'd love to discuss your investment thesis for fintech startups."
}
```

**Response (201):**
```json
{
  "connection": {
    "id": "uuid",
    "senderId": "uuid",
    "recipientId": "uuid",
    "startupId": "uuid",
    "status": "PENDING",
    "message": "I'd love to discuss your investment thesis for fintech startups.",
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

### PATCH `/api/v1/connections/{id}`

Update connection request status.

**Request:**
```json
{
  "status": "ACCEPTED"  // or "REJECTED", "WITHDRAWN"
}
```

**Response (200):**
```json
{
  "connection": {
    "id": "uuid",
    "status": "ACCEPTED",
    "updatedAt": "2025-01-16T10:00:00Z"
  }
}
```

### GET `/api/v1/connections`

List connection requests for the current user.

**Query Parameters:**
- `status` — filter by status
- `direction` — `sent` or `received`
- `page`, `limit`

**Response (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "sender": { "id": "uuid", "name": "Sender Name" },
      "recipient": { "id": "uuid", "name": "Recipient Name" },
      "startup": { "id": "uuid", "name": "FundrHub" },
      "status": "PENDING",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

## 14. Messaging Endpoints

### GET `/api/v1/conversations`

List conversations for the current user.

**Response (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "connectionRequestId": "uuid",
      "otherUser": {
        "id": "uuid",
        "name": "Other User"
      },
      "lastMessage": {
        "body": "Thanks for connecting!",
        "createdAt": "2025-01-16T10:00:00Z"
      },
      "unreadCount": 2
    }
  ]
}
```

### GET `/api/v1/conversations/{id}/messages`

List messages in a conversation.

**Query Parameters:**
- `before` — message ID for cursor pagination
- `limit` — items per page (default 50)

**Response (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "senderId": "uuid",
      "body": "Thanks for connecting!",
      "createdAt": "2025-01-16T10:00:00Z",
      "readAt": "2025-01-16T10:05:00Z"
    }
  ],
  "pagination": {
    "nextCursor": "uuid",
    "hasMore": true
  }
}
```

### POST `/api/v1/conversations/{id}/messages`

Send a message in a conversation.

**Request:**
```json
{
  "body": "Thanks for connecting!"
}
```

**Response (201):**
```json
{
  "message": {
    "id": "uuid",
    "senderId": "uuid",
    "body": "Thanks for connecting!",
    "createdAt": "2025-01-16T10:00:00Z"
  }
}
```

## 15. Notification Endpoints

### GET `/api/v1/notifications`

List notifications for the current user.

**Query Parameters:**
- `unreadOnly` — filter to unread only
- `page`, `limit`

**Response (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "type": "CONNECTION_REQUEST",
      "payload": {
        "connectionId": "uuid",
        "senderName": "Investor Name"
      },
      "readAt": null,
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  }
}
```

### PATCH `/api/v1/notifications/{id}/read`

Mark a notification as read.

**Response (200):**
```json
{
  "notification": {
    "id": "uuid",
    "readAt": "2025-01-16T10:00:00Z"
  }
}
```

### POST `/api/v1/notifications/read-all`

Mark all notifications as read.

**Response (200):**
```json
{
  "message": "All notifications marked as read"
}
```

## 16. Report Endpoints

### POST `/api/v1/reports`

Create a report.

**Request:**
```json
{
  "targetType": "USER",
  "targetId": "uuid",
  "reason": "Suspicious activity"
}
```

**Response (201):**
```json
{
  "report": {
    "id": "uuid",
    "targetType": "USER",
    "targetId": "uuid",
    "reason": "Suspicious activity",
    "status": "OPEN",
    "createdAt": "2025-01-16T10:00:00Z"
  }
}
```

## 17. Admin Endpoints

### GET `/api/v1/admin/users`

List users for moderation.

**Query Parameters:**
- `status` — filter by user status
- `role` — filter by role
- `page`, `limit`

### PATCH `/api/v1/admin/users/{id}/status`

Update user status (suspend, activate).

**Request:**
```json
{
  "status": "SUSPENDED",
  "reason": "Violation of terms"
}
```

### GET `/api/v1/admin/startups`

List startups for moderation.

**Query Parameters:**
- `status` — filter by startup status
- `page`, `limit`

### PATCH `/api/v1/admin/startups/{id}/status`

Update startup status (approve, reject, suspend).

**Request:**
```json
{
  "status": "PUBLISHED",
  "note": "Approved after review"
}
```

### GET `/api/v1/admin/reports`

List reports for review.

**Query Parameters:**
- `status` — filter by report status
- `page`, `limit`

### PATCH `/api/v1/admin/reports/{id}`

Update report status and resolution.

**Request:**
```json
{
  "status": "RESOLVED",
  "resolution": "User suspended after investigation"
}
```

### GET `/api/v1/admin/verifications`

List verification requests.

**Query Parameters:**
- `status` — filter by verification status
- `level` — filter by verification level
- `page`, `limit`

### PATCH `/api/v1/admin/verifications/{id}`

Approve or reject a verification request.

**Request:**
```json
{
  "status": "APPROVED"
}
```

### GET `/api/v1/admin/categories`

List categories.

### POST `/api/v1/admin/categories`

Create a category.

**Request:**
```json
{
  "type": "SECTOR",
  "name": "CLIMATETECH"
}
```

### GET `/api/v1/admin/audit-events`

List audit events.

**Query Parameters:**
- `actorId` — filter by actor
- `entityType` — filter by entity type
- `page`, `limit`

## 18. Rate Limiting

| Endpoint Group          | Limit                          |
|-------------------------|--------------------------------|
| Auth endpoints          | 10 requests per minute per IP  |
| Connection requests     | 20 requests per hour per user  |
| Messaging               | 60 messages per hour per user |
| General API             | 120 requests per minute per user |

## 19. Security Requirements

- **TLS** on all endpoints in production.
- **Authorization** checked on every protected endpoint.
- **Ownership checks** for profile, startup, and message resources.
- **Input validation** on all request bodies and query parameters.
- **Rate limiting** on auth, connection, and messaging endpoints.
- **No sensitive data** (passwords, tokens, PII) in logs or error responses.
- **Pitch deck access** requires explicit authorization.

## 20. Future API Extensions

- `POST /api/v1/ai/pitch-analysis` — AI pitch deck analysis.
- `POST /api/v1/ai/investor-fit` — AI investor fit report.
- `GET /api/v1/analytics/founder` — founder profile analytics.
- `GET /api/v1/analytics/startup` — startup page analytics.
- `POST /api/v1/deal-rooms` — deal room creation.
- `POST /api/v1/subscriptions` — premium plan management.
- `POST /api/v1/featured-listings` — featured startup placement.