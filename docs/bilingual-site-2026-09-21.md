# Chinese and English versions — 2026-09-21

Implemented in `apps/site-original` only. No deployment or push.

- Header language control stays visible on mobile. Chinese is the default; the `edu-language` preference cookie selects English and persists for a year.
- Switching reloads the exact URL, preserving course/lesson and Atlas concept/tab parameters. Saved learning records keep their existing identifiers and storage keys. Unsaved form state is not transferred across the reload.
- Both languages share page structure, route IDs and learning data. English dictionaries cover authored navigation, homepage demos, Atlas introductions, resources, changelog and all 7 courses / 74 lessons. Original external repository descriptions and research source documents retain their source language.
- Server-rendered text uses a server localization boundary; interactive components use a React context boundary. No React DOM is rewritten. Course body translations are selected on the server and only the requested course is sent to its reader.
- Lesson figure keys are explicit, so translating a title cannot silently change its interactive example.
- Standalone HTML tools embed their own translations. An explicit `?lang=` works in sandboxed previews where cookies cannot be read. Standalone opening can use the cookie; downloaded files without a language query default to Chinese. Their source originals remain unchanged.
- Tool translation sources and an idempotent generator live in `public/tools/localization/`. Run `node public/tools/localization/generate.mjs` after changing its catalog/runtime; this also refreshes output hashes.

Maintenance checks:

```sh
node scripts/check-translations.mjs
node --experimental-strip-types --test tests/*.test.mjs
npm run lint
npm run build
```

The translation checker fails for missing authored UI/course strings. Localization tests check all course IDs, concepts, answer correctness and interactive figure identities across languages, as well as template substitution and standalone sandbox/cookie behavior.

Browser verification: desktop and 390px mobile layouts, Chinese ↔ English switching on an active lesson, English Atlas labels, resource/gallery/changelog pages, and sandboxed angle-tool interaction in both languages. English map labels are truncated after translation, with full labels available on focus/hover and in the detail panel.
