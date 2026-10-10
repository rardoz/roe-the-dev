# Immersive homepage — implementation and review

The homepage follows the user's new attached composition and final cinematic noir override. Earlier discarded designs are not included. The world is authored as independent real-time objects and shared scroll state, rather than a flattened image or background video.

## Architecture

Next.js App Router preserves the site's current routing, metadata, Contentful data source, en-US/es-US localization, and secondary feature pages. The homepage uses a semantic React shell, native document scrolling, and one lazy-loaded Three.js 0.186.1 WebGL scene. Existing-page noir changes retain each page's layout and behavior.

`motion.ts` defines the reversible scroll state and section landmarks. `world.ts` authors the faceted asteroid, spherical planet, unified industrial city, debris, cracked terrain, sign, scorpion, and tumbleweed. `cloud-shader.ts` defines the billowing cloud volume and monochrome planetary geography. `spatial-content.ts` creates real CMS image planes, framed text artifacts, color focus, and matching projected link targets in the same camera space. `scene.ts` coordinates these objects, the camera, input, resizing, visibility, and resource lifecycle. The React shell retains semantic content, menu focus handling, navigation, and the independent Transmissions carousel.

The final override governs the color system: near-black, charcoal, ivory, one directional white source, severe geometric framing, restrained grain, and selective full-color content. Cormorant Garamond and Barlow Condensed supply the editorial/elongated typography. The real existing logo is preserved and shown monochrome.

## Real content and destinations

- Featured Posts uses the site's existing `linkBank` editorial content; destinations honor CMS hard routes.
- Transmissions uses the current ordered `featuredContent` entries and preserves their destination slugs exactly, including the sketchbook and game.
- Portfolio uses actual `portfolio` entries and existing project screenshots; no fictional titles or projects are introduced.
- About uses `/roe-profile-pic.png` and the existing localized professional biography.
- GitHub, LinkedIn, X/Twitter, Twitch, and email use the existing destinations.
- Existing article/project details, drawing and locking/saving flow, code playground, game, APIs, docs, and comments retain their implementation.

## Scroll review landmarks

| Fraction                | Moment                                                          |
| ----------------------- | --------------------------------------------------------------- |
| 0                       | Intro above the asteroid and curved planetary horizon           |
| .19 / .225 / .275       | Opposing editorial trajectories with depth and color focus      |
| .36 / .405              | Real portrait/bio above the single monumental city              |
| .475 / .49 / .515 / .54 | Final descent, bounded flash, shockwave/debris, cloud formation |
| .565                    | Transmissions carousel, circular arrows, touch/mouse dragging   |
| .67 through .885        | Portfolio helix moves from the cloud head down the same shaft   |
| .945 / .99              | Camera retreats into the final wasteland and integrated contact |

Inspect `[data-renderer]` for renderer/mode/progress, and the canvas for camera, asteroid, impact, flash, frame count, and cloud-axis diagnostics. Semantic links carry `data-spatial-card`, projected bounds, actual world position, and image-load diagnostics.

## Accessibility and rendering

Native page scroll remains available. Reduced-motion and initial WebGL-unavailable modes present readable semantic content without the scroll film. A menu option and skip link expose the same reading experience. Buttons retain touch targets, links keep real hrefs, the menu traps keyboard focus and restores it with Escape, and carousel state is announced. The same content is available in both locales.

Contentful preview images use the official [Images API](https://www.contentful.com/developers/docs/references/images-api/images/) at 800px, WebP, quality 85; actual source imagery remains intact. The renderer caps device pixel ratio, renders on input rather than continuously at rest, pauses while hidden/offscreen, handles resize and WebGL loss/restoration, and disposes GPU resources. The environment does not use automatic strobing or decorative particle emitters.

## Visual review — user rejected checkpoint

The user rejected checkpoint 3 as visually far from the supplied mock. The running world and prior passing checks establish functioning interaction systems only; they do not establish the requested artistic quality. The task remains pending. A substantial rebuild is underway: fractured black rock with pale carved planes, tightly connected Earth/intro composition, severe stepped and slender Deco architecture, stronger silhouette/backlight, and deliberate geometric frames. The palette remains black-and-white noir at the user’s explicit direction. Captures from the rejected checkpoint are not final acceptance evidence.

## Technical verification status

Automated tests cover reversible/bounded impact state, opposing post motion, all project focus positions, real CMS route preservation, semantic fallback, keyboard menu behavior, and the distinction between the independent carousel and scroll portfolio. The integrated checkpoint passes all 39 tests across 19 suites, all 26 snapshots, full ESLint/global Stylelint, explicit module Stylelint, TypeScript, the production build, and diff checks under nvm Node 24.21.0.

The first native desktop/mobile review exposed oversized desktop asteroid framing, blank globe shading, a top-down city, visible ellipse haze, primitive-looking cloud spheres, wrong depth ordering between cards and cloud, and weak final pull-away. These findings informed substantial geometry, shader, camera, and spatial-content revisions. The second native Chrome review confirmed actual WebGL shader compilation and all CMS textures, pointer-driven camera movement, reversible wheel motion, keyboard menu wrapping and Escape focus return, carousel arrows and real touch swipe, actual desktop/mobile project navigation, resting rendering pause, hidden-tab pause, and WebGL loss/restoration without GL errors. Final responsive evidence for the latest geometry/readability/resource refinements will be added after root's next review.

Physical touch hardware and Safari have not been verified at this stage. Browser emulation will be reported separately from physical device testing.
