# FundrHub — UX Flow

**Product:** FundrHub — Founder ↔ Investor Discovery, Matching & Connection Platform  
**Founder & Product Owner:** Ashutosh Singh  
**Version:** 1.0  
**Status:** Initial baseline  
**Source:** Derived from `FundrHub_Design_Document_v1.0.docx`

---

## 1. UX Design Principles

- **Trust first:** clear verification and privacy controls.
- **Mobile first, responsive web.**
- **Simple discovery before complex workflows.**
- **Explainable matching** rather than opaque recommendations.
- **Structured profiles** over long unformatted text.
- **Clear actions** at every step of the journey.

## 2. Navigation Structure

### 2.1 Public Navigation

```
Home → How it works → Explore startups → Explore investors → Login / Register
```

### 2.2 Founder Navigation

```
Dashboard → Profile → My Startups → Create/Edit Startup → Matches → Investors → Requests → Messages → Settings
```

### 2.3 Investor Navigation

```
Dashboard → Profile → Preferences → Discover Startups → Matches → Shortlist → Requests → Messages → Settings
```

### 2.4 Admin Navigation

```
Dashboard → Users → Startups → Verification → Reports → Categories → Audit/Analytics
```

## 3. User Flows

### 3.1 Registration & Onboarding Flow

```
┌─────────────┐
│ Landing Page│
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│  Register   │────▶│  Verify     │
│  (email/    │     │  Email/     │
│   password) │     │  Phone      │
└──────┬──────┘     └──────┬──────┘
       │                   │
       ▼                   ▼
┌─────────────────────────────────┐
│        Role Selection           │
│  ┌──────────┐  ┌──────────┐    │
│  │ Founder  │  │ Investor │    │
│  └──────────┘  └──────────┘    │
└──────┬──────────────┬──────────┘
       │              │
       ▼              ▼
┌─────────────┐  ┌─────────────┐
│ Founder     │  │ Investor    │
│ Onboarding  │  │ Onboarding  │
└──────┬──────┘  └──────┬──────┘
       │                │
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│ Founder     │  │ Investor    │
│ Dashboard   │  │ Dashboard   │
└─────────────┘  └─────────────┘
```

**Steps:**
1. User lands on the landing page.
2. Clicks "Register" or "Get Started".
3. Enters email and password.
4. Verifies email/phone via OTP or link.
5. Selects role: Founder or Investor.
6. Completes role-specific onboarding profile.
7. Lands on role-specific dashboard.

### 3.2 Founder Journey — Create Startup

```
┌─────────────┐
│ Founder     │
│ Dashboard   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Create      │
│ Startup     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ Startup Details             │
│ • Name, logo, description   │
│ • Problem, solution         │
│ • Sector, stage, location   │
│ • Business model            │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Fundraising Details         │
│ • Amount sought             │
│ • Valuation range           │
│ • Equity offered            │
│ • Use of funds              │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Team & Traction             │
│ • Team members              │
│ • Revenue/traction metrics  │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Pitch Deck Upload           │
│ • Upload PDF/PPT            │
│ • Preview                   │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Review & Submit             │
│ • Preview all sections      │
│ • Submit for review         │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Pending Review              │
│ (Admin approval required)   │
└─────────────────────────────┘
```

### 3.3 Investor Journey — Discover Startups

```
┌─────────────┐
│ Investor    │
│ Dashboard   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ Discover Startups           │
│ • Search bar                │
│ • Filters: sector, stage,   │
│   location, funding amount  │
│ • Sort options              │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Startup Card List           │
│ • Logo, name, sector, stage │
│ • Location, funding amount  │
│ • Match score (if available)│
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Startup Detail Page         │
│ • Full profile              │
│ • Problem/solution          │
│ • Team                      │
│ • Traction metrics          │
│ • Pitch deck (authorized)   │
└──────┬──────────────────────┘
       │
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Shortlist   │ │ Express     │ │ Send        │
│ Startup     │ │ Interest    │ │ Connection  │
│             │ │             │ │ Request     │
└─────────────┘ └─────────────┘ └─────────────┘
```

### 3.4 Matching Flow

```
┌─────────────┐
│ User        │
│ Dashboard   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Matches     │
│ Screen      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ Match Card                  │
│ • Match score (e.g., 85%)   │
│ • Reasons:                  │
│   ✓ Sector match            │
│   ✓ Stage preference        │
│   ✓ Ticket size fits        │
│   ✗ Geography differs       │
│ • Profile summary           │
│ • Action buttons            │
└──────┬──────────────────────┘
       │
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ View        │ │ Shortlist   │ │ Send        │
│ Profile     │ │             │ │ Connection  │
│             │ │             │ │ Request     │
└─────────────┘ └─────────────┘ └─────────────┘
```

### 3.5 Connection Request Flow

```
┌─────────────┐
│ Sender      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ Send Connection Request     │
│ • Select recipient          │
│ • Optional startup context  │
│ • Write short message       │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Request Sent (PENDING)      │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Recipient Notification      │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Recipient Decision          │
│  ┌──────────┐  ┌──────────┐ │
│  │ Accept   │  │ Reject   │ │
│  └──────────┘  └──────────┘ │
└──────┬──────────────────────┘
       │
       ├──────────────┐
       ▼              ▼
┌─────────────┐ ┌─────────────┐
│ ACCEPTED    │ │ REJECTED    │
│ → Create    │ │ → Notify    │
│   Conversation│ │   sender    │
└─────────────┘ └─────────────┘
```

### 3.6 Messaging Flow

```
┌─────────────┐
│ Accepted    │
│ Connection  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Conversation│
│ List        │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ Chat Screen                 │
│ • Message history           │
│ • Input field               │
│ • Send button               │
│ • Report/block actions      │
└─────────────────────────────┘
```

### 3.7 Admin Moderation Flow

```
┌─────────────┐
│ Admin       │
│ Dashboard   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ Moderation Queue            │
│ • Pending startups          │
│ • Pending verifications     │
│ • Open reports              │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Review Item                 │
│ • View full details         │
│ • Check against guidelines  │
└──────┬──────────────────────┘
       │
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Approve     │ │ Reject      │ │ Request     │
│ / Publish   │ │ / Suspend   │ │ Changes     │
└─────────────┘ └─────────────┘ └─────────────┘
```

## 4. Screen Specifications

### 4.1 Landing Page

- **Purpose:** Explain the marketplace value.
- **Primary CTAs:** "Find Investors" and "Discover Startups".
- **Sections:**
  - Hero with value proposition.
  - How it works (3 steps).
  - Featured startups/investors (optional).
  - Testimonials (future).
  - Footer with links.

### 4.2 Startup Card

- Logo
- Name
- Sector
- Stage
- Location
- Funding requirement
- Match percentage (if applicable)

### 4.3 Investor Card

- Name
- Investor type
- Sectors
- Stage preferences
- Ticket range
- Location
- Verification state

### 4.4 Profile Pages

- **Structured sections** rather than long unformatted text.
- Founder: About, Experience, Links, Startups.
- Investor: About, Investment Preferences, Portfolio, Verification.

### 4.5 Match Screen

- Score + reasons.
- Relevant profile details.
- Action buttons (View, Shortlist, Connect).

### 4.6 Pitch Deck Viewer

- Explicit access state.
- Download/view controls.
- Auditability.

### 4.7 Connection Request

- Short context message.
- Clear accept/reject controls.

### 4.8 Messaging

- Show connection context.
- Reporting/blocking actions.

## 5. Empty States

| Screen          | Empty State Message                              | Action Offered                    |
|-----------------|--------------------------------------------------|-----------------------------------|
| My Startups     | "You haven't created any startups yet."          | "Create your first startup"       |
| Matches         | "No matches found yet. Complete your profile."   | "Complete profile"                |
| Shortlist       | "Your shortlist is empty."                       | "Discover startups"               |
| Connections     | "No connection requests yet."                    | "Find investors/startups"         |
| Messages        | "No conversations yet."                          | "Start a connection"              |
| Notifications   | "You're all caught up!"                          | —                                 |

## 6. Loading & Error States

### Loading States
- Skeleton loaders for cards and lists.
- Spinner for form submissions.
- Progress indicator for multi-step flows.

### Error States
- Inline validation errors on forms.
- Toast notifications for API errors.
- Retry buttons for failed loads.
- Friendly 404/500 pages.

## 7. Accessibility Requirements

- Keyboard navigation for all interactive elements.
- ARIA labels on form fields and icons.
- Readable contrast ratios (WCAG AA).
- Accessible form error messages.
- Focus indicators visible.
- Screen reader support for key flows.

## 8. Responsive Behavior

| Breakpoint | Behavior                                        |
|------------|-------------------------------------------------|
| Mobile     | Single column, bottom nav, simplified filters.  |
| Tablet     | Two-column layouts, side nav.                   |
| Desktop    | Full multi-column layouts, advanced filters.    |

## 9. Future UX Enhancements

- AI pitch-deck analysis feedback.
- AI investor-fit reports.
- Deal rooms with document workflows.
- Advanced analytics dashboards.
- Push notifications on mobile.
- Featured/verified badges.