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

### Featured Posts crossing pass

**Stacked-card styling parity:** the ornamental width is now `min(viewport − 40px, 421.96757px)` at every stacked width, including mobile. The DOM/SVG and Three.js share the exact existing chamfered outlines, stepped corner/fan lines, double diamonds, side marks and image/copy separator via `post-frame.ts`; the desktop geometry is unchanged. Stacked cards use the same 1×.61 image plane, 1×.55 copy plane, black backing, serif title/Arial description proportions, lower divider/arrow and 1px ornament strokes instead of the old rectangular CSS shadows/brackets. The SVG viewbox follows actual geometry bounds (1.178×1.35); the reference cap includes that full visible ornament.

Decorative SVGs are hidden globally and shown only by the ≤1000px stacked/reading rules; desktop WebGL and wider fallback/reading layouts do not show orphan overlays. The stacked and reading card reset is followed by an explicit 2px white `:focus-visible` outline with 5px offset. Native browser Tab at 974px verified actual `:focus-visible` matches and computed visible outlines in both cinema stack and reduced-motion reading modes; at 1440px WebGL all post SVGs computed `display: none`.

Separate-tab browser checks measured 350×401.094px ornaments at 390px and 421.953×483.563px at 700/974px. Images measured 1.639:1 (desktop plane ratio 1/.61), with Georgia titles at 20.798px/25.074px respectively and no rectangular box shadow. The supplied 974px reference therefore remains the cap, rather than stretching wider mobile cards. Parent visual review remains required.

**Current responsive/glyph-gap refinement:** Posts alone uses a document stack at widths ≤1000px. At ≤700px the existing viewport-minus-40px outer footprint remains; 701–1000px uses the shared 2411×816 desktop reference's 421.96757px ornamental width, centered, not stretched across the tablet. At ≥1001px the desktop row and direct left/bottom/right sequential entrances remain. Other scenes, navigation and Transmissions retain their original breakpoints. The main landmark/Posts-before-About order, native scrolling insertion, reading mode and resize mapping use the same Posts-only mode.

The banner anchor now measures the visible text baseline plus actual font glyph descent, not the 58.5px linebox bottom. Three uses the real frame's highest diamond at y=.675 rather than an assumed .685 proxy top. The serif cards and condensed banner styles remain unchanged. At the preserved 2411×816 reference, actual glyph bottom was 78.898px and ornament top 178.898px (100px). Live 1001×900, 1200×900 and 1440×900 checks also measured 100px; 701/999/1000px stacks measured 421.961px outer footprints. Browser checks ran in a separate tab rather than changing the user's reference viewport.

**Latest user clarification supersedes the X/alternating/lower-lane notes below:** the three CMS posts enter directly left→left slot, bottom→center slot, and right→right slot. Each follows only that straight axis at full size; no lower crossing lane, detour, two-stage rise, scale change, or depth travel remains on desktop. Windows stay `.14–.175`, `.175–.21`, `.21–.245`; waiting posts are hidden/inert/aria-hidden in DOM and absent in Three until their turn. Previously settled cards persist in original CMS order. The 100px title gap and mobile behavior remain. For other counts, first/last retain outer-edge entrances and interior cards rise in their own columns rather than crossing settled content.

Live refreshed 1440×900 validation covered `.139` through `.275`, including just before each turn, plus 61 slow traversal samples with ornamental bounds expanded 12px: no card overlaps. At `.139` all cards were CSS-hidden/aria-hidden; at `.174` cards 2/3 remained hidden; at `.209` card 3 remained hidden. At `.19` the center card was rising from y864px in its center column; at `.225` the last card approached from x1572px, then settled at x980px by `.245`. Screenshot at `.20` confirmed a directly rising full-size center card, with no crossing over Post 1. Title gap remained 100.5px.

The approved opposing-entry direction now accumulates rather than sending cards away. Desktop entries settle sequentially in CMS order into a persistent row with balanced 28px ornamental-footprint gaps, filling the available width (56px side reserves). Card `i` enters during `.14 + i / N * .105` through `.14 + (i + 1) / N * .105`; the previous card is fully settled before the next begins. Sides strictly alternate left/right by CMS index. Later entries traverse below the occupied row, then rise into their own slot without overlapping settled readable footprints. For three cards, entrance windows are `.14–.175`, `.175–.21`, and `.21–.245`; all remain until the existing section handoff. The desktop banner tracks the first card's projected ornamental top with a 100px clear gap measured from its text box bottom; DOM fallback uses the same offset helper. `data-ornamental-top` on the first projected link supports live gap checks. Settled cards gain color, as do hovered, focused, or activated cards. CMS links and content remain unchanged. Mobile entry timing and document-list behavior are unchanged.

Mobile uses actual DOM frames outside the sticky film stage, not transparent WebGL hit targets: a normal document-flowing list moves up with the page, with no nested scroll container or pinned list. The list remains inside the main landmark and precedes About in DOM order; the sticky stage is a div and the main uses `display: contents` to preserve its containing block. Its absolute document anchor starts at `.14` of the original film distance; frames slide diagonally from alternating edges as their untransformed top moves from 80% to 30% of the viewport, then retain their settled position in the list. Each ornamental footprint is viewport width minus 40px (350px at 390px), and footprints have 20px vertical gaps. The heading is centered; locally available condensed industrial sans-serif fonts are scoped to the Posts banner only. Card titles retain their approved serif typography in DOM and WebGL. There are no bundled font assets in this checkout; the condensed system-font stack falls back to sans-serif.

If the list needs more document distance than the original posts window, `data-posts-extra` adds it to the film length and pauses scene progress at `.285` while the list continues moving normally. Opening scroll distances remain unchanged; About and later landmarks add that extra distance using the shared inverse scroll map. Inspect `#film-posts[data-document="true"]` outside `#film-content`, card bounding rectangles, `data-active`, and `data-posts-extra`. Desktop still renders enlarged Three.js frames and matching DOM projections. Review desktop `.175`, `.2125`, `.245`, `.275`, and the `.315` handoff; on mobile scroll through the heading, all card bodies, and All articles before About. Automated choreography checks do not establish browser acceptance.

The city stays hidden until the posts backdrop clears at `.315`: its illuminated narrow ribs otherwise project as vertical shafts beneath the asteroid even with searchlight opacity and disc rays set to zero. The opening remains unchanged, and city geometry and later lighting resume for About.

Desktop staging includes the destination-slot offset, so every alternating start is wholly outside its requested viewport edge. Later entries use a compact 35%-scale lower crossing lane (0.98 card units below the row), then expand/rise only after reaching their slot. A live 1440×900 check measured the third card outside left at `.203` (right edge about −826px), crossing from x−227px at `.223` to x496px at `.227` and x1122px at `.232`, with top about 728px; its upper image and frame are visibly sliding laterally above the navigation before the rise. The lower part is temporarily below the viewport/navigation during that transit, rather than hiding the whole entry there. At `.24` it rises to y288px and settles by `.245`. The first-card heading gap remains about 100.5px.

## Accessibility and rendering

Native page scroll remains available. Reduced-motion and initial WebGL-unavailable modes present readable semantic content without the scroll film. A menu option and skip link expose the same reading experience. Buttons retain touch targets, links keep real hrefs, the menu traps keyboard focus and restores it with Escape, and carousel state is announced. The same content is available in both locales.

Contentful preview images use the official [Images API](https://www.contentful.com/developers/docs/references/images-api/images/) at 800px, WebP, quality 85; actual source imagery remains intact. The renderer caps device pixel ratio, renders on input rather than continuously at rest, pauses while hidden/offscreen, handles resize and WebGL loss/restoration, and disposes GPU resources. The environment does not use automatic strobing or decorative particle emitters.

## Visual review — user rejected checkpoint

The user rejected checkpoint 3 as visually far from the supplied mock. The running world and prior passing checks establish functioning interaction systems only; they do not establish the requested artistic quality. The task remains pending. A substantial rebuild is underway: fractured black rock with pale carved planes, tightly connected Earth/intro composition, severe stepped and slender Deco architecture, stronger silhouette/backlight, and deliberate geometric frames. The palette remains black-and-white noir at the user’s explicit direction. Captures from the rejected checkpoint are not final acceptance evidence.

## Technical verification status

Automated tests cover reversible/bounded impact state, opposing post motion, all project focus positions, real CMS route preservation, semantic fallback, keyboard menu behavior, and the distinction between the independent carousel and scroll portfolio. The integrated checkpoint passes all 39 tests across 19 suites, all 26 snapshots, full ESLint/global Stylelint, explicit module Stylelint, TypeScript, the production build, and diff checks under nvm Node 24.21.0.

The first native desktop/mobile review exposed oversized desktop asteroid framing, blank globe shading, a top-down city, visible ellipse haze, primitive-looking cloud spheres, wrong depth ordering between cards and cloud, and weak final pull-away. These findings informed substantial geometry, shader, camera, and spatial-content revisions. The second native Chrome review confirmed actual WebGL shader compilation and all CMS textures, pointer-driven camera movement, reversible wheel motion, keyboard menu wrapping and Escape focus return, carousel arrows and real touch swipe, actual desktop/mobile project navigation, resting rendering pause, hidden-tab pause, and WebGL loss/restoration without GL errors. Final responsive evidence for the latest geometry/readability/resource refinements will be added after root's next review.

Physical touch hardware and Safari have not been verified at this stage. Browser emulation will be reported separately from physical device testing.
