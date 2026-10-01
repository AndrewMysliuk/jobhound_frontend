# {{FEATURE_TITLE}} — tasks

> Agent implementation plan. Every checkbox must be finishable in code (types, API, store, UI, unit tests).
> Do **not** list manual QA, DoD, E2E scripts, or “run the product”.
> Backend tasks (if any): `jobhound_core/docs/{{feature_slug}}/{{feature_slug}}-tasks.md`

---

## Scope

**In this slice**

1. [required behavior]

**Paused (do not implement here)**

- [explicit non-goals]

---

## 0. Types

- [ ] **T1** — `app/types/I{{Entity}}.ts`: enums + `I{{Entity}}Response`
- [ ] **T2** — export from `app/types/index.ts`

---

## 1. API

- [ ] **A1** — `app/api/{{feature}}.ts`: named fetch + `readApiJson` / `throwIfNotOk`; return `Promise<T>`
- [ ] **A2** — export from `app/api/index.ts`

---

## 2. Pinia store

- [ ] **S1** — `app/store/{{feature}}.ts`: setup store; actions call `app/api`; store the unwrapped DTO
- [ ] **S2** — loading / error via `toApiError`; map forms from `error.fields`; no envelope parsing in the store
- [ ] **S3** — export from `app/store/index.ts`

---

## 3. UI `{{ComponentName}}`

- [ ] **W1** — `app/components/{{ComponentName}}.vue`
- [ ] **W2** — **{{SubFlowA}}**: [form / list / result]
- [ ] **W3** — loading, empty, error (`error.message`; fields as `` `${name}: ${message}` ``)
- [ ] **W4** — barrel export if the folder has `index.ts`

---

## 4. Page

- [ ] **P1** — `app/pages/{{path}}.vue` (Nuxt file route)
- [ ] **P2** — nav / entry in existing chrome if this slice needs it

---

## 5. Integration (omit section if none)

- [ ] **I1** — `{{AdjacentComponent}}`: [shared state / link / prefill]

---

## 6. Tests

- [ ] **Q1** — unit tests for [payload, field errors]

---

## Dependencies (brief)

```
T* → A* → S* → W* → P*
I* after W*
Q* after W* + A*
```

**M1:** T*, A*, S*, W2  
**M2:** W3, P*  
**M3:** I1, Q1
