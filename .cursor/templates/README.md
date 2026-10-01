# Feature documentation templates (frontend)

Three files — one set. Same workflow as [backend templates](../../../jobhound_core/.cursor/templates/): the model understands context and implements step by step without extra questions.

## How to use

1. Copy the folder or individual files into `docs/<feature_slug>/`.
2. Rename by feature slug, for example:
   - `concept.md` → `my-feature-concept.md`
   - `schemas-contracts.md` → `my-feature-schemas-contracts.md`
   - `tasks.md` → `my-feature-tasks.md`
3. Replace all `{{...}}` placeholders and `[...]` blocks with concrete details.
4. Link the sibling backend spec if the feature consumes new endpoints (`jobhound_core/docs/<feature_slug>/`).
5. In `tasks.md`, keep checkboxes up to date as you implement.

## Writing order

| # | File | Purpose |
|---|------|---------|
| 1 | `concept.md` | **Why** and **how** at product and UX level. Screens, flows, UI rules, boundaries. No low-level handler signatures unless needed for clarity. |
| 2 | `schemas-contracts.md` | **Contracts**: routes, types, API handlers, store shape, component tree, stream events, analytics, error UX. Verifiable in code. Optional for pure UI/logic fixes. |
| 3 | `tasks.md` | **Implementation plan**: atomic tasks with IDs, checkboxes, dependencies, milestones. |

## Reference

- Project standards: [`.cursor/rules/project-standards.mdc`](../rules/project-standards.mdc)

## Tips

- **Concept** — user journeys and UI state rules (what the user sees when loading / error / empty).
- **Contracts** — one interface per entity; map layers used by this app.
- **Tasks** — prefixes adapted to the feature (e.g. `T*` types, `A*` API, `S*` store, `W*` UI, `Q*` unit tests). Every checkbox must be agent-implementable in code; put manual QA / DoD / E2E outside this file.
