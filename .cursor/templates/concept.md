# {{FEATURE_TITLE}} — concept

> Template: product and UX spec. No routes, handlers, or component file paths — flows, screens, UI rules, boundaries only.
> Pair with backend spec if applicable: `jobhound_core/docs/{{feature_slug}}/`

## Why

**Problem today:** [what is wrong with the current UI / flow / why this feature is needed]

**New experience:**

1. [key user journey, step 1]
2. [key user journey, step 2]
3. [what changes in the live session — loading, progress, outcomes]

Product context: [who, in which product area]. Primary UI surface: **{{PRIMARY_SCREEN}}**.

## Stack (frontend)

| Layer | Tool | Location |
| ----- | ---- | -------- |
| UI framework | **Vue 3** (Composition API), **Nuxt 4** | `app/pages/`, `app/components/` |
| State | **Pinia** (setup stores) | `app/store/` |
| API | **`fetch`** via `apiFetch` + `readApiJson` | `app/api/` |
| Styling | **Tailwind 4** (+ SCSS if needed) | `app/assets/css/tailwind.css`, `app/assets/scss/` |
| Routing | **Nuxt file routes** | `app/pages/` |

[What stays on the current UI — existing route, do not refactor unrelated pages.]

## Screens and navigation

| Screen | Route | Entry point |
| ------ | ----- | ----------- |
| [screen name] | `/{{route}}` | [nav link / redirect / CTA] |
| [screen name] | `/{{route}}` | [from list / query] |

**Auth / guards:** [middleware requirements — or none].

**Back navigation:** [expected behavior].

## {{PRIMARY_ENTITY}} (user-facing)

**What the user provides:**

- **[input 1]** — [control type, validation at UX level].
- **[input 2]** — [control type].

**Creation flow:** [wizard steps / single form / modal].

**Review / edit before save:** [what can change; disabled states after lock].

**After save / activate:** [read-only UI; next CTA].

## Main user flow

**Entry:** [how user lands on the feature — header, list card, etc.].

**Happy path:**

1. [step]
2. [step]
3. [step]

**Loading states:** [skeleton / spinner / disable actions while X].

**Empty states:** [no items yet — copy and CTA].

## Session / live UI (if applicable)

**Start:** [explicit action; what appears first].

**During run:**

- [what progress UI shows]
- [what is driven by backend state vs displayed-only fields]

**Outcomes** (terminal UI):

| Outcome | User sees | Next action |
| ------- | --------- | ----------- |
| **{{OUTCOME_1}}** | [copy / tone] | [e.g. open review] |
| **{{OUTCOME_2}}** | [copy / tone] | [e.g. return to list] |
| **{{OUTCOME_3}}** | [error message] | [retry] |

**Adjacent surfaces:** [other pages linked from this flow].

## UI rules (business logic reflected in UI)

| Situation | UI behavior |
| --------- | ----------- |
| [situation 1] | [button state, message, navigation] |
| [situation 2] | [disable edit, show badge, etc.] |
| [conflict from API] | [inline error; slot cap reads `error.meta.limit`] |
| [request failure] | [inline `error.message` from `toApiError`] |

**Hard rules:**

- Handlers return `Promise<T>`. Pages and stores do not read `ok` or a raw JSON `error` object.
- Show `error.message` from `toApiError`. Branch on `error.code` only via generated `API_ERROR_CODES`.
- [feature-specific rule]

## Layout

| Layer | Responsibility |
| ----- | -------------- |
| **`app/pages/`** | Route UI. Calls `app/api`. Catches with `unknown`, then `toApiError` |
| **`app/components/`** | Presentational pieces. No fetch |
| **`app/api/`** | `apiFetch`, `readApiJson` / `throwIfNotOk`, named functions |
| **`app/store/`** | Pinia store for feature state. No envelope parsing |
| **`app/types/`** | `I*` interfaces shared across the app |
| **`app/utils/`** | Shared helpers (`toApiError`, `unwrapApiResult`) |

**Public API:** page imports named functions from `app/api` and components from `app/components`.

## State ownership

- **Server state** (source of truth): [what comes from API].
- **Client-only state**: [loading flags, inline error strings, form drafts].
- **Do not duplicate** the envelope on the client. Store the DTO or the `ApiError`.

## Analytics (if applicable)

| Event | When |
| ----- | ---- |
| `{{event_name}}` | [user action] |

Omit this section when the slice has no analytics.

## Implementation order

1. [types + API functions]
2. [Pinia store if the slice needs shared state]
3. [components — main flow]
4. [page route]
5. [polish — empty/error states, edge cases]

Early check: [minimal path — open route, see main layout].

## Out of scope (concept level)

- [backend behavior — link to `jobhound_core/docs/{{feature_slug}}/` instead]
- [unrelated page refactors]
- [auth, i18n, unless this slice owns them]
