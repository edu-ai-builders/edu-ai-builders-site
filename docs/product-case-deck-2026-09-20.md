# Product case deck — September 20 follow-up

The user approved the previous layout and messaging but wanted fewer elementary math examples, a neutral rather than green background, and stacked cards that can swipe between fuller learning-product situations. The follow-up explicitly specifies PDF to learning content.

## Implemented

- Warm white/lilac homepage, with lavender, apricot, powder blue and rose case accents. Shared topline/footer/primary buttons no longer use green as the default brand surface.
- Four hero cards: language practice, exam revision (flashcards + reference sheet + review queue), PDF to learning content (concept illustration + micro-course + review cards + self-check), and adult workplace communication practice.
- Motion card transitions and horizontal drag; previous/next controls, direct selectors and keyboard arrows at the carousel region. Cases advance automatically while visible. Manual selection and focus in case controls pause autoplay. Reduced motion retains navigation but removes animated transitions/autoplay.
- Stable illustration space across cards, mobile overflow corrected. Illustrations are authored product-scenario demonstrations, not claims of a running PDF conversion/model backend. Links lead to existing courses or build resources.
- Homepage reading/relationship tool, English learning-card example and adult data-literacy feedback replace repeated fraction examples. The shelf now features existing teaching/presentation Skills and language-expression resources. Original math tools, research data and curricula remain intact.

## Verification

43 tests and full ESLint passed. Production build/type checking passed, with 25 generated pages. Desktop 1440px and mobile 390px reviewed. Direct selectors pause the carousel, next wraps from the fourth case to the first, and PDF/adult illustrations fit the mobile region without horizontal overflow. Browser console showed no errors/warnings during review. Original-site local preview runs at http://127.0.0.1:3100; no deployment or push.

The earlier dependency audit findings remain documented in ui-refinement-2026-09-20.md; this pass adds no packages.
