# Light surfaces and visual teaching scenes — September 20

This pass preserves Claude's latest curriculum, routes and resource data in the original website. The current curriculum has 7 courses / 74 lessons; no curriculum migration was part of this UI work. The GPT preview and hosting configuration remain unchanged. Local preview only.

## Visual changes

- Replace the black shared feature bands with warm paper, sage, lavender and peach surfaces; adjust their foregrounds together. Apply to learning, resources/build, Atlas, changelog, navigation and research diagrams.
- Replace the homepage's text-only problem list with a classroom situation: compare the same-sized wholes, split the half into quarters, and explain unchanged shaded area. Three.js renders the pieces and Motion transitions the short explanation. This is a conceptual illustration, not evidence of measured learning gains.
- Show the graphic before optional actions on mobile. Keep autoplay, pause and manual steps. Add concrete before/after feedback and learning-card illustrations to the audience cards and artifact previews to the course shelf.
- Use Motion for gentle section entrance; keep content present in server-rendered HTML. No scroll hijacking or pointer-following camera.

## Runtime boundaries

Three.js is dynamically imported for the homepage scene. An SVG conveys the same comparison while loading or without WebGL. Pixel ratio is capped at 1.6; animation stops when the shape settles, when paused, offscreen or in a hidden tab. Geometry, materials, renderer, observers and listeners are disposed on unmount. Context loss returns to the SVG.

A subscribed media-query hook uses a stable server snapshot to avoid reduced-motion hydration mismatches. Reduced motion disables autoplay/transitions, while retaining manual step controls and explicit canvas repaints.

## Validation

- All 43 repository tests passed; ESLint and production TypeScript/build passed (25 generated pages).
- Desktop 1440px and mobile 390px inspected. Homepage and course page had no horizontal overflow. Manual scene selection updates its explanation and pauses playback. Three.js canvas rendered, and navigation away produced no browser errors/warnings.
- Verified the production CSS includes the new shared pastel surface tokens after restarting port 3100. A development tab briefly retained stale shared CSS; final review uses the production build.
- Three.js 0.186.0, Motion 13.4.0 and Three.js types added in the lockfile. Dependency audit found no advisory for these new animation packages. It did report existing Next.js 16.2.6/transitive dependency advisories, including critical severity for Next.js, with 16.3.5 offered as the fix. Framework/security upgrades were not mixed into this UI pass and remain outstanding before publication.
