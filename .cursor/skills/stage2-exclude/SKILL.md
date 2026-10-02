---
name: stage2-exclude
description: >-
  Add or remove stage-2 exclude phrases in the JobHound frontend default list.
  Use when the user pastes phrases, says to add or drop a word from exclude,
  or wants the exclude box text so stage 2 keeps senior Vue/TypeScript/Go/Node
  roles and drops junk.
---

# Stage 2 exclude list

Edit one array. Do not invent a second list.

**File:** `app/utils/defaultStage2Exclude.ts`  
**Export:** `DEFAULT_STAGE2_EXCLUDE`

The open search does not read this file. Its exclude box is the last saved stage-2 payload. After every edit, print the full list as plain lines in one fenced block so the user can paste it into that box.

## What the user is hiring for

Senior full-stack, frontend first. Vue 3, TypeScript, React, Go, Node. Fintech payments. Remote from Romania.

Keep roles that match that stack. Exclude is for junk that arrives with a broad query (sales, support, QA-as-a-job, native mobile, Java and Python web frameworks, ML research). A mention inside a normal senior frontend description must not kill the job.

## How a line matches

Exclude is one `listing` phrase rule (`app/utils/stagePayload.ts`). It searches title, company, description, tags, hiring raw, and salary. Match is lowercase, `-` becomes a space, whole words only. `java` does not match `javascript`. `spring` does match `this spring`.

Geo is not this list. A US country tag is allowed. US-only is a visa sentence already in the array (`must be located in the us`, citizenship, `green card`, `h-1b`). Do not add bare `usa`, `united states`, or `us`.

## Edit rules

1. Read the array first. Add or remove only the lines the user named.
2. One phrase per line, lowercase, double quotes. No duplicate after trim.
3. Insert a new line next to the same family (Java frameworks together, Python frameworks together, visa lines together). Do not resort the file.
4. If they name an exact string, store that string. If a bare token is on the collision list below and they did not insist on the bare form, store the role form (`flask` stays `flask`; bare `android` becomes `android developer` and `android engineer`) and say so in one sentence.
5. Do not edit `stagePayload.ts` unless they are changing countries, not phrases.

### Collision list

These fired on senior Vue, TypeScript, React, Go, or Node descriptions. Do not put them back unless the user explicitly wants that exact line:

`compensation`, `marketing`, `sales`, `recruiter`, `owner`, `director`, `head of`, `junior`, `analyst`, `advisor`, `coordinator`, `consultant`, `seo`, `partnerships`, `talent acquisition`, `fraud`, `wallet`, `devops`, `terraform`, `ansible`, `jenkins`, `php`, `java`, `django` as a passing mention is ok to keep when they ask for Python frameworks, `rust`, `android`, `react native`, `flutter`, `machine learning`, `data science`, `fine-tuning`, `cybersecurity`, `soc 2`, `iso 27001`, `product manager`, `project manager`, `ux designer`, `developer experience`, `healthtech`, `edtech`, `customer success`

Role forms that should stay when the bare word is removed: `java developer`, `java engineer`, `react native developer`, `react native engineer`, `android developer`, `android engineer`, `flutter developer`, `flutter engineer`, `data scientist`, `ml engineer`, `security engineer`, `sre`, `platform engineer`.

`react native` is mobile (iOS and Android), not web. Keep the developer/engineer lines, not the bare phrase.

## Reply

State the lines added and the lines removed. One sentence if a bare token was widened or if `spring` was added (it also matches the season). Then the full array as plain text, one phrase per line, no quotes, inside a single fence.
