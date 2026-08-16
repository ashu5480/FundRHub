# FundrHub — UI Guidelines

**Product:** FundrHub — Founder ↔ Investor Discovery, Matching & Connection Platform  
**Founder & Product Owner:** Ashutosh Singh  
**Version:** 1.0  
**Status:** Initial baseline  

---

## 1. Purpose

This document defines the visual language, design system, component guidelines and accessibility requirements for FundrHub across web and mobile clients. It ensures a consistent, professional and trustworthy experience for founders, investors and admins.

## 2. Design Principles

- **Trust first:** Visual cues (verification badges, secure indicators) reinforce credibility.
- **Clarity over decoration:** Content-first layouts with a clear hierarchy.
- **Consistency:** Shared components across web and mobile via the `packages/ui` library.
- **Mobile first, responsive web:** Every screen designed for small screens first and progressively enhanced.
- **Professional and neutral:** The platform serves professionals; avoid overly playful or loud styling.
- **Accessible:** WCAG 2.1 AA compliance as a baseline.

## 3. Brand & Visual Identity

### 3.1 Logo

- FundrHub wordmark with a clean, geometric sans-serif.
- Logo symbol (TBD) should communicate connection/growth (e.g., two nodes linking).
- Minimum clear-space: 1× height of the logo on all sides.
- Do not stretch, recolor or place on low-contrast backgrounds without an approved variant.

### 3.2 Tagline

> "Where founders meet their investors"

Used on landing page and marketing materials only.

## 4. Color Palette

### 4.1 Primary Colors

| Token        | Hex       | Usage                                   |
|--------------|-----------|------------------------------------------|
| `primary-500`| `#2563EB` | Primary buttons, links, active states   |
| `primary-600`| `#1D4ED8` | Hover states, focus rings               |
| `primary-700`| `#1E40AF` | Pressed/active states                   |
| `primary-50` | `#EFF6FF` | Subtle backgrounds, selected chips      |

### 4.2 Secondary Colors

| Token          | Hex       | Usage                                   |
|----------------|-----------|------------------------------------------|
| `secondary-500`| `#0F766E` | Secondary actions, success accents      |
| `success-500`  | `#16A34A` | Positive states, verification badges    |
| `warning-500`  | `#D97706` | Pending states, cautions                |
| `danger-500`   | `#DC2626` | Errors, destructive actions, blocks     |

### 4.3 Neutral Colors

| Token        | Hex       | Usage                                   |
|--------------|-----------|------------------------------------------|
| `neutral-0`  | `#FFFFFF` | Backgrounds, cards                      |
| `neutral-50` | `#F9FAFB` | Page backgrounds                        |
| `neutral-100`| `#F3F4F6` | Input backgrounds, disabled fills       |
| `neutral-200`| `#E5E7EB` | Borders, dividers                       |
| `neutral-300`| `#D1D5DB` | Disabled borders                        |
| `neutral-500`| `#6B7280` | Secondary text, icons                   |
| `neutral-700`| `#374151` | Body text                               |
| `neutral-900`| `#111827` | Headings, emphasis                      |

### 4.4 Semantic Tokens

| Token              | Value       | Usage                                   |
|--------------------|-------------|------------------------------------------|
| `text-primary`     | `neutral-900`| Default text color                     |
| `text-secondary`   | `neutral-500`| Supporting text                        |
| `text-disabled`    | `neutral-300`| Disabled content                       |
| `border-default`   | `neutral-200`| Standard borders                       |
| `background-page`  | `neutral-50` | Page background                        |
| `background-card`  | `neutral-0`  | Card background                        |
| `focus-ring`       | `primary-500` at 40% opacity | Focus states |

### 4.5 Color Usage Rules

- Use color as an enhancement, never as the only indicator (also use icons/labels).
- Verification badges: `success-500` for approved, `warning-500` for pending.
- Destructive actions must always use `danger-500` and confirm dialogs.
- Maintain minimum contrast ratios: text 4.5:1, large text 3:1.

## 5. Typography

### 5.1 Font Family

- **Web:** Inter (with system fallbacks: `-apple-system`, `Segoe UI`, `Roboto`, `sans-serif`).
- **Mobile:** Use system fonts to maximize performance and native feel (`SF Pro` on iOS, `Roboto` on Android), or Inter if bundled.

### 5.2 Type Scale

| Token          | Size   | Line Height | Weight  | Usage                        |
|----------------|--------|-------------|---------|------------------------------|
| `display-lg`   | 40px   | 48px        | 700     | Landing hero only            |
| `display-md`   | 32px   | 40px        | 700     | Page titles                  |
| `display-sm`   | 24px   | 32px        | 600     | Section headings             |
| `heading-lg`   | 20px   | 28px        | 600     | Card headings                |
| `heading-md`   | 16px   | 24px        | 600     | Sub-headings, list titles    |
| `heading-sm`   | 14px   | 20px        | 600     | Small group labels           |
| `body-lg`      | 16px   | 24px        | 400     | Default body                 |
| `body-md`      | 14px   | 20px        | 400     | Dense content, tables        |
| `body-sm`      | 12px   | 16px        | 400     | Metadata, captions           |
| `label-lg`     | 14px   | 20px        | 500     | Form labels, buttons         |
| `label-md`     | 12px   | 16px        | 500     | Small labels, tabs           |
| `code`         | 13px   | 20px        | 400     | Code, API responses          |

### 5.3 Type Rules

- Maximum readable line length: **~72 characters** for body text.
- Use `font-weight: 600` max for UI text; reserve 700 for headings only.
- Numbers and financial figures: use tabular numerals for alignment.
- Avoid all-caps for body text; use for small labels sparingly.

## 6. Spacing & Layout

### 6.1 Spacing Scale

| Token  | Value  |
|--------|--------|
| `space-1` | 4px  |
| `space-2` | 8px  |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 24px |
| `space-6` | 32px |
| `space-7` | 48px |
| `space-8` | 64px |
| `space-9` | 96px |

### 6.2 Layout Rules

- **Base grid:** 4px system on both web and mobile.
- **Content max-width:** 1200px for web; gutters 24px on desktop, 16px on mobile.
- **Card padding:** `space-5` (24px) standard; `space-4` (16px) for dense lists.
- **Vertical rhythm:** minimum `space-4` between adjacent blocks; `space-6` between major sections.
- **Touch targets:** minimum 44×44px on mobile, 40×40px on desktop.
- **Form fields:** stack vertically on mobile; inline on desktop where appropriate.

## 7. Components

### 7.1 Buttons

| Variant      | Style                                    | Usage                                  |
|--------------|------------------------------------------|----------------------------------------|
| Primary      | `primary-500` bg, white text             | Main action on screen                  |
| Secondary    | White bg, `neutral-200` border           | Alternative action                     |
| Tertiary     | Transparent, `primary-500` text          | Low-emphasis action                    |
| Danger       | `danger-500` bg, white text              | Destructive action                     |
| Ghost        | Transparent, neutral text                | Inline/menu actions                    |

**Rules:**
- One primary button per view.
- Disabled state: 50% opacity, no shadow, `not-allowed` cursor.
- Loading state: spinner replaces label or appends inline.
- Icon buttons need `aria-label`.

### 7.2 Inputs

- Label always visible (no placeholder-as-label).
- Required fields marked with `*` and programmatically announced.
- Helper text under input (`body-sm`, `neutral-500`).
- Error: `danger-500` border + inline error message.
- Focus state: `primary-500` 2px ring with 40% opacity halo.

### 7.3 Cards

- White background, `neutral-200` 1px border, 12px radius.
- Elevation for hover states: subtle shadow (`0 4px 12px rgba(0,0,0,0.06)`).
- Cards are not links by default; interactive cards contain explicit CTA.

### 7.4 Tags & Badges

| Category         | Style                       | Example                    |
|------------------|-----------------------------|----------------------------|
| Sector tag       | `neutral-100` bg, `neutral-700` text | "Fintech"          |
| Stage tag        | `primary-50` bg, `primary-700` text  | "Seed"             |
| Verified badge   | `success-50` bg, `success-700` text  | ✓ "Verified"      |
| Pending badge    | `warning-50` bg, `warning-700` text  | "Pending review"  |
| Suspended badge  | `danger-50` bg, `danger-700` text    | "Suspended"       |

### 7.5 Modals & Dialogs

- Overlay: black at 60% opacity.
- Centered dialog with 24px padding, 12px radius.
- Title (`heading-lg`) + body (`body-md`).
- Footer: secondary (cancel) left, primary (confirm) right.
- Close on `Esc`, overlay click (with confirmation if destructive).
- Focus trapped inside modal; restore focus on close.

### 7.6 Notifications & Toasts

- Top-right on web; top of screen on mobile.
- Auto-dismiss informational toasts after 5 seconds.
- Errors persist until dismissed.
- Include icon + message + optional action.

### 7.7 Tabs

- Underline style: `neutral-200` line, active tab `primary-500` underline 2px.
- `aria-selected`, `role="tab"` semantics required.

### 7.8 Tables

- Headers: `label-md`, `neutral-500` on `neutral-50` bg.
- Row hover: `neutral-50`.
- Zebra striping optional; not needed if hover feedback exists.

### 7.9 Empty States

- Illustration/icon + title (`heading-md`) + description (`body-md`) + CTA.
- Never show a bare empty table/list without guidance.

### 7.10 Skeletons

- Use for initial loading of cards, lists and profile details.
- Animated shimmer at `neutral-100` → `neutral-200` (1.5s ease-in-out loop).

## 8. Screen-Specific Guidelines

### 8.1 Forms

- One logical step per section; use steps/progress for multi-stage forms (e.g., startup creation).
- Save buttons prominent; "Save as draft" secondary.
- Indicative progress: "Step 2 of 4".

### 8.2 Dashboards

- KPI cards at top: metric value, label, trend indicator, optional sparkline.
- Secondary content in cards below: recent activity, pending requests, quick actions.

### 8.3 Search & Filter Results

- Sort control top-right of results toolbar.
- Filter chips represent active filters; removable with ×.
- Result count in `body-sm`, `neutral-500`.
- Pagination or infinite scroll consistent within a screen type.

### 8.4 Profile Pages

- Header: avatar/logo, name, verification badge, location, key tags.
- Body: structured sections with clear `heading-md` dividers.
- Contact/CTA: sticky bottom bar on mobile; right rail on desktop.

### 8.5 Messaging

- Message bubbles: aligned right for self, left for others.
- Timestamps inside bubbles (`body-sm`).
- Unread conversation rows: bolded name + unread count badge.
- Input bar fixed at bottom with send button.

## 9. Iconography

- Use a single consistent icon set (e.g., Lucide or similar stroke-based set).
- Sizes: 16px inline, 20px controls, 24px standalone, 32px feature/dashboard.
- Stroke width 2 by default.
- Always pair icons with text labels in navigation and critical actions.

## 10. Imagery & Media

- Startup logos/avatars: circular crops, 96px standard.
- Pitch deck viewer: full-width with zoom controls, download for authorized users.
- Use optimization pipelines (WebP/AVIF) for photographs; never block UI on media load.

## 11. Motion & Interaction

- Durations: 150ms micro-interactions, 250ms panel/dialog transitions, 300ms page-level transitions.
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` (standard).
- Respect `prefers-reduced-motion`: replace animations with cross-fades, or disable.
- Meaningful transitions only; no decorative bounce.

## 12. Accessibility (WCAG 2.1 AA)

### 12.1 General

- Color contrast: 4.5:1 text, 3:1 large text and UI components.
- All functionality available via keyboard.
- Visible focus indicators (2px `primary-500` outline).
- Form errors: identify field, describe error, suggest fix.

### 12.2 ARIA & Semantics

- Use native HTML elements where possible.
- Landmark regions: header, nav, main, footer.
- Modals: `role="dialog"`, `aria-modal="true"`, label via `aria-labelledby`.
- Tabs: `role="tablist"`, `role="tab"`, `role="tabpanel"` with `aria-selected`.
- Toast alerts: `role="status"` for non-blocking, `role="alert"` for errors.

### 12.3 Testing

- Run automated axe-core checks in CI.
- Manual keyboard-only walkthrough of critical journeys before release.

## 13. Responsive Breakpoints

| Breakpoint | Width        | Behavior                                    |
|------------|--------------|---------------------------------------------|
| `sm`       | ≥ 640px      | Small phones landscape, larger phones       |
| `md`       | ≥ 768px      | Tablets; two-column layouts begin          |
| `lg`       | ≥ 1024px     | Small desktops/landscape tablets           |
| `xl`       | ≥ 1280px     | Standard desktop; full layouts             |

**Rules:**
- Design mobile-first: build at `sm` width, enhance upward.
- Never hide critical actions on mobile; use stacked layouts and bottom CTAs.
- Tables collapse to cards or horizontally scrollable regions on mobile.

## 14. Theming & Dark Mode (Future)

- Dark mode is post-MVP; design tokens must support it cleanly.
- Use semantic tokens only (no raw hex in components) to enable future theming.
- Each color token should have a documented dark-mode counterpart when introduced.

## 15. Implementation Notes

- All UI components live in `packages/ui` and are shared between web and mobile.
- Use design tokens as TypeScript/JSON constants, not hard-coded values in components.
- Component documentation via Storybook (or similar) is the source of truth for UI.
- New components require: props API, playroom story, accessibility pass, and responsive check.

## 16. Component Checklist (Before Merge)

- [ ] Uses design tokens, no hard-coded colors/spacing.
- [ ] Responsive across breakpoints.
- [ ] Keyboard operable and focus states visible.
- [ ] Passes color contrast (axe-core automated).
- [ ] Labeled interactive elements (`aria-label`, `aria-labelledby`).
- [ ] Loading, empty and error states defined.
- [ ] Documented in Storybook with variants.