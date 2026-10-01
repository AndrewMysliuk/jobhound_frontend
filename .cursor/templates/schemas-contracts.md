# {{FEATURE_TITLE}} — schemas and contracts

> Template: frontend implementation contracts. Routes, types, API functions, store, component tree, errors.
> Backend API reference: `jobhound_core/docs/{{feature_slug}}/{{feature_slug}}-schemas-contracts.md`

---

## Layout

| Layer | Path | Role |
| ----- | ---- | ---- |
| Page | `app/pages/{{path}}.vue` | Nuxt file route |
| Components | `app/components/{{ComponentName}}.vue` | Feature UI |
| API | `app/api/{{feature}}.ts` | Named functions, `apiFetch` + `readApiJson` |
| Store | `app/store/{{feature}}.ts` | Pinia setup store |
| Types | `app/types/I{{Entity}}.ts` | DTOs (`I*`) |
| Utils | `app/utils/` | `toApiError`, `unwrapApiResult` when shared |

`{{ADJACENT_PAGE}}` — **outside this page**. [how it connects: shared store / query / link].

---

## Routes

### `{{RouteName}}`

| Property | Value |
| -------- | ----- |
| Path | `/{{path}}` |
| File | `app/pages/{{path}}.vue` |
| Components | `{{ComponentName}}` |
| Middleware | [auth / none] |
| Query / params | [`?id` or path param — type and validation] |

---

## Types (`app/types`)

```ts
export enum {{Entity}}StatusEnum {
  {{STATUS_A}} = "{{STATUS_A}}",
  {{STATUS_B}} = "{{STATUS_B}}",
}

export interface I{{Entity}}Response {
  id: string
  // ... mirror backend response fields
}

export interface I{{Entity}}ListItem {
  id: string
  // ... list subset
}

export interface I{{Create}}Request {
  {{field}}: string
}
```

Export from `app/types/index.ts`.

---

## API (`app/api/{{feature}}.ts`)

Pattern: `apiFetch` + `readApiJson`. Named function, `Promise<T>` of the unwrapped `result`. Rethrow `unknown` only after `toApiError` at the page or store.

### `get{{Entity}}`

```ts
export async function get{{Entity}}(): Promise<I{{Entity}}Response> {
  const config = useRuntimeConfig()
  const base = String(config.public.apiBaseUrl).replace(/\/$/, "")
  const res = await apiFetch(`${base}/api/v1/{{route}}`)
  return readApiJson<I{{Entity}}Response>(res)
}
```

### `post{{Entity}}`

```ts
export async function post{{Entity}}(body: I{{Create}}Request): Promise<I{{Entity}}Response> {
  const config = useRuntimeConfig()
  const base = String(config.public.apiBaseUrl).replace(/\/$/, "")
  const res = await apiFetch(`${base}/api/v1/{{route}}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return readApiJson<I{{Entity}}Response>(res)
}
```

| Function | Method | Endpoint | Unwrapped `T` |
| -------- | ------ | -------- | ------------- |
| `get{{Entity}}` | GET | `/api/v1/{{route}}` | `I{{Entity}}Response` |
| `post{{Entity}}` | POST | `/api/v1/{{route}}` | `I{{Entity}}Response` |

Re-export from `app/api/index.ts`.

---

## Stream events (if applicable)

Omit this section when the slice has no stream. This app does not use conversation NDJSON.

```ts
export enum {{Stream}}EventEnum {
  {{NEW_EVENT}} = "{{NEW_EVENT}}",
}

export interface I{{NewEvent}}Payload {
  type: {{Stream}}EventEnum.{{NEW_EVENT}}
}
```

**Store handling:** [which events update state and loading flags].

---

## Pinia store (`app/store/{{feature}}.ts`)

```ts
export const use{{Feature}}Store = defineStore("{{feature}}Store", () => {
  const {{entities}} = ref<I{{Entity}}Response[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetch{{Entities}} = async () => {
    // call app/api; store the unwrapped DTO
    // catch (e: unknown) → toApiError(e).message
  }

  return { {{entities}}, isLoading, error, fetch{{Entities}} }
})
```

| State field | Source | UI usage |
| ----------- | ------ | -------- |
| `{{field}}` | [API] | [component binding] |
| `isLoading` | [action start/end] | [disable buttons] |

Export from `app/store/index.ts`. Omit the store when the page holds the data in local refs.

---

## Components

```
{{ComponentName}}.vue
├── [child component]
└── [child component]
```

| Component | Props | Emits | Store / API |
| --------- | ----- | ----- | ----------- |
| `{{ComponentName}}` | — | — | presentational, or orchestrates if it is the page |
| `{{SubComponent}}` | `I{{Props}}` | `{{event}}` | local |

Components do not call `fetch` or parse the envelope.

---

## Page

```vue
<!-- app/pages/{{path}}.vue -->
<script setup lang="ts">
// call app/api; catch (e: unknown) → toApiError(e).message
</script>
```

---

## Error UX

| `class` / situation | UI |
| ------------------- | -- |
| `validation` | `error.message`. If `fields` is non-empty, append `` `${field.name}: ${field.message}` `` |
| `not_found` | Inline `error.message` |
| `conflict` | Inline `error.message`. Cap number is `error.meta.limit` when present |
| `auth` / `forbidden` / `rate_limit` / `upstream` / `internal` | Inline `error.message` |
| Network, invalid JSON, non-envelope body | Fallback message from `toApiError` |

Branch on `error.code` only when behavior differs. Import `API_ERROR_CODES` from `~/types`.

---

## Analytics (if applicable)

Omit this section when the slice has no analytics.

```ts
window.dataLayer.push({
  event: "{{event_name}}",
  {{property}}: "{{value}}",
})
```

| Event | Trigger | Properties |
| ----- | ------- | ---------- |
| `{{event}}` | [click / completion] | [...] |

---

## Shared components (if reused)

| Component | Path | Used for |
| --------- | ---- | -------- |
| `{{Component}}` | `app/components/{{Component}}.vue` | [purpose] |

Do not duplicate a component that already exists under `app/components/`.
