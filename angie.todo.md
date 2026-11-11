# Angie — Homepage

## Previous task ANG-001 — paused for ANG-002

- [ ] **awaiting_visual_approval / testing** — Refine city grounding, ocean direction, and horizon clouds.
  - Source: Roe's current landscape feedback. City should rest on rocks rather than appear buried; add about 30 small drifting clouds fading toward the horizon; waves travel toward the city.
  - Preserve black-and-white noir, approved city framing, atmospheric passage and static cloud assets, About layout and meteor choreography.
  - Scope: island/ocean rendering and small landscape clouds only.
  - Validation: built-in browser desktop/mobile and nvm Node 24 lint. No tests/benchmarks or commits/deployment. Visual approval required for done.

## Context

- Repository: /Users/slayanne/Projects/roe-the-dev.
- Shared history: todo.md; prior engineering history: andy.todo.md.
- Design: design-specs/home and inspiration.md; current user-approved noir palette supersedes old amber reference.
- Current ocean/island revision remains awaiting approval; this task addresses feedback on that revision.

## ANG-001 implementation and review

- Reopened 2026-11-10: Roe reverted the previous cloud pass. Redistribute city-area PNG clouds naturally, with larger clouds toward the foreground, smaller clouds fading toward the horizon, and a clear city/explosion area. Preserve the earlier cloud passage, city framing, ocean, and layouts; inspect desktop and phone in the built-in browser.
- Current pass: replaced the 64-cloud scatter with 21 individually placed PNG clouds at varied depths and sizes. Near clouds can extend beyond the viewport; distant clouds are smaller and fainter. Skyline-anchored clouds fade away after the atmospheric passage as About arrives, clearing the city for the explosion. Camera, ocean, city, and earlier passage retained.
- Review: built-in browser at 1440×900, 713×781, and 390×844, including reverse scrolling; no captured console errors. Screenshots: `/tmp/roe-city-clouds-desktop.png`, `/tmp/roe-city-clouds-phone.png`. nvm Node v24.21.0 `npm run lint` and `git diff --check` pass. No tests, benchmarks, commits, or deployment. Awaiting Roe's visual approval.

- Files: city-island.ts, landscape-clouds.ts, world.ts, scene.ts in app/_components/cinematic-home/.
- Rock support: narrower upper plateau, lowered cliff shoulders and smaller outcrops kept below city foundations.
- Clouds: 30 seeded small billboards share existing 20 PNG maps; slow varied drift, distance fade, reduced-motion support and About clearance. Existing atmospheric descent remains intact.
- Water: inward radial swell phases and inward texture/foam motion toward city; existing speed and wave amplitude retained.
- Built-in browser reviewed at 2035×1344, 1440×900, 390×844, including forward/reverse approach. Temporary viewport reset. No console errors observed.
- Evidence: /tmp/roe-landscape-revision-desktop.png and /tmp/roe-landscape-revision-phone.png. Phone captured before final minor cliff-profile and About-clearance refinement; final desktop reviewed after both.
- Validation: source "$HOME/.nvm/nvm.sh", nvm use 24 (v24.21.0), npm run lint — pass; git diff --check — pass. No tests/benchmarks, staging, commits or deployment.
- Approval: pending Roe visual review of this revision.

- Current refinement: Roe requests vertical wave streaks near the city (browser comment); preserve inward motion and the rest of the landscape.

- Vertical-wave refinement ready for review: near-city texture projections rotated 90 degrees with corresponding tangent-normal correction and a smooth distance transition; inward motion retained. Desktop 2035×1344 and phone 390×844 inspected in built-in browser. Node v24.21.0 npm run lint and git diff --check pass. Evidence: /tmp/roe-vertical-waves-desktop.png. No tests or benchmarks. Roe approval pending.

- Reopened: Roe rejected the spatially rotated overlapping wave pattern. Current scope is a single coherent wave field, toward the city on approach and south on departure. Preserve landscape/clouds/framing.

- Current wave revision: single normal-map sample/projection, single planar swell, no radial distortion or second rotated texture. Ripples/swell/foam share their travel speed. Fixed north–south axis, with signed velocity smoothly reversing over progress 0.50–0.60. This supersedes the earlier spatial-rotation approach.
- Reviewed desktop 2035×1344 and phone 390×844 in built-in browser. Approach pattern visible; departure city camera hides most water, limiting visual confirmation of southbound motion. Departure sign/timing checked in source. No console errors observed. Viewport reset. Node v24.21.0 npm run lint and git diff --check pass. No tests/benchmarks or commits. Evidence: /tmp/roe-waves-single-approach.png and /tmp/roe-waves-single-phone.png. Approval remains pending.

- Current clarification: waves follow a C-shaped spatial path (approach city, bend near shore, sweep south/away). The earlier linear field and scroll-based reversal were rejected and will be replaced; no camera/layout/island/cloud changes.

- C-shaped revision ready: one smooth coastal coordinate mapping bows streaks toward the island, directs them down along the shore, and curves away into the foreground. Texture normals, swell contours and foam follow that spatial shape. Removed fixed-heading and scroll-reversal logic. This supersedes earlier wave-direction implementations.
- Browser review: native 1301×1314, desktop 1440×900, phone 390×844; forward/reverse approach; no console errors observed. Viewport reset. nvm Node v24.21.0 npm run lint and git diff --check pass. No tests/benchmarks or commits. Evidence: /tmp/roe-c-shaped-waves-desktop.png and /tmp/roe-c-shaped-waves-phone.png. Pending Roe approval.

- Current refinement: Roe likes the emerging C shape, requests a stronger overall bend and left-side wavelets pointing directly toward the city, with short straight individual ripples. Preserve everything outside ocean rendering.

- Stronger C-shaped revision ready: straight approach/exit runs with a stronger smooth bend toward the foreground, aiming left-side ripples into the city. Travel-coordinate spacing shortens wavelets through the bend; local shading uses normalized tangent directions. Only city-island.ts changed in this pass.
- Browser review: desktop 1301×1314 and phone 390×844; no console errors observed, viewport reset. Node v24.21.0 npm run lint and git diff --check pass. No tests/benchmarks, commits or deployment. Evidence: /tmp/roe-c-wave-refinement-desktop.png and /tmp/roe-c-wave-refinement-phone.png. Pending Roe approval.

- Current scope: ocean lighting only. Roe likes the upper-left tonal variation and requests it throughout the water, reducing the bright lower-left/dark lower-right imbalance. Retain C-shaped flow, city, clouds, framing and layouts.

- Ocean lighting ready for review: removed left-position spotlight mask; balanced reflected sky from both sides, added gentle smooth light/shadow variation, and compressed strong highlights. Only water illumination in city-island.ts changed; wave geometry and flow retained.
- Browser review: 1301×1314 desktop, 390×844 phone, no console errors observed, viewport reset. Node v24.21.0 npm run lint and git diff --check pass. No tests/benchmarks, commits or deployment. User staged changes preserved. Evidence: /tmp/roe-ocean-lighting-desktop.png and /tmp/roe-ocean-lighting-phone.png. Approval pending.

- Current refinement: Roe sees a repeating light/shadow pattern; replace uniform lighting patches with irregular shapes and scales. Ocean shading only; retain C-shaped flow and balanced brightness.

- Irregular reflection revision ready: three differently scaled/rotated warped lighting fields, smaller irregular wave packets controlling highlight width/intensity and swell shading, plus bounded normal-map coordinate breakup. C-shaped geometry and flow retained; no other scene/layout changes.
- Browser review: desktop 1301×1314 and phone 390×844, no console errors observed; viewport reset. nvm Node v24.21.0 npm run lint and git diff --check pass. No tests/benchmarks, staging, commits or deployment. User staged changes preserved. Evidence: /tmp/roe-ocean-irregular-light-desktop.png and /tmp/roe-ocean-irregular-light-phone.png. Pending Roe approval.

- Current feedback: repeated light/shadow shapes remain, and water is too bright at 1024×768. Address source repetition and darken water reflections, preserving C-shaped flow. Reopened same task.

- Dark-water revision ready: randomized normal-map patch offsets and scales with continuous, variance-preserving blends; removed regularly spaced swell reflection bands while keeping geometry/current. Lowered base, fresnel and shore foam; bounded peak reflections with a restrained soft sheen.
- Built-in browser: reported 1024×768 at progress 0.456 and phone 390×844, no console errors observed; viewport reset. Node v24.21.0 npm run lint and git diff --check pass. No tests/benchmarks or commits. User staged changes preserved. Evidence: /tmp/roe-dark-water-1024.png and /tmp/roe-dark-water-phone.png. Pending Roe approval.

- 2026-10-19: Reopened for three landscape refinements: readable waves across the ocean, darker dusk rocks, and clearer city-on-rock grounding. Reported viewport 667×780. Preserve current C-shaped flow, anti-repetition sampling, camera, city scale, About layout and meteor landing.

- Dusk landscape refinement ready for review: strengthened wave-normal detail, slightly enlarged ripple spacing and restrained reflections to show waves across the dark ocean. Rock material darkened; the island now has a flat upper terrace, a narrow bevel and a steep collar below the city foundation instead of a continuous sloping shoulder. City transform, camera, meteor and section timing preserved.
- Built-in browser reviewed at 667×780, 1440×900 and 390×844, including forward/reverse approach; no console errors observed. nvm Node v24.21.0 npm run lint and git diff --check pass. No tests/benchmarks, staging, commits or deployment. Existing staged changes preserved. Evidence: /tmp/roe-dusk-landscape-667.png and /tmp/roe-dusk-landscape-phone.png. Awaiting Roe visual approval.

- Reopened: Roe requests lifting the city relative to the rocks so the building bases clear the rock surface (667×780 browser comment). This pass may adjust city grounding and dependent meteor alignment; preserve ocean appearance, content/layouts, camera intent and timing.

- City lift ready: actual city asset elevated 0.12 model units (about 10% of asset height), with the upper rock terrace supporting it above the unchanged outer shoulders. Framing points, rooftop cloud anchors, plaza landing, shockwave and blast origin track the raised foundation. Files: city.ts, city-island.ts and scene.ts. No ocean shader or About layout changes in this pass.
- Built-in browser reviewed 667×780, desktop 1440×900 and phone 390×844, including the landing angle; no console errors observed. Viewport reset. nvm Node v24.21.0 npm run lint and git diff --check pass. No tests/benchmarks, staging, commits or deployment. Existing user changes preserved. Evidence: /tmp/roe-raised-city-667.png, /tmp/roe-raised-city-desktop.png and /tmp/roe-raised-city-phone.png. Awaiting Roe visual approval.

- Reopened for island asset replacement: Roe supplied public/assets/island/island.glb. Remove generated rock geometry, fit the asset beneath the city, and keep foundations resting directly on its surface. Preserve current ocean/clouds, camera and layout intent; browser review at desktop/phone plus 667×780. No tests/benchmarks or commits.

- Supplied island ready: island-asset.ts loads /assets/island/island.glb, preserves texture/normal detail with monochrome dusk shading, uniformly fits around the city core, and levels the supporting deck beneath the foundation. Existing outer cliffs remain from the asset. city-island.ts removes generated cliffs/outcrops/rock noise and derives shoreline foam from the fitted mesh at water level. City elevation/landing, camera, ocean shader, clouds and About layout unchanged in this pass. Loaded resources use the existing disposal path, including late-load cleanup.
- Built-in browser reviewed at 667×780, desktop 1440×900 and phone 390×844, approach and lower landing views, then reverse return. No console errors observed; viewport restored. nvm Node v24.21.0 npm run lint and git diff --check pass. No tests/benchmarks, staging, commits or deployment. Existing staged changes preserved. Evidence: /tmp/roe-island-asset-667.png, /tmp/roe-island-asset-desktop.png, /tmp/roe-island-asset-phone.png and /tmp/roe-island-asset-landing.png. Awaiting Roe approval.

- Reopened: Roe requests submerging the island base in the ocean (667×780 landing view). Lower the shared city/island foundation; retain direct contact, shoreline foam and meteor alignment. Water shading, content and timing unchanged.

- Immersion ready: CITY_ISLAND_IMMERSION lowers both the city and supporting island by 0.28 model units. City fitting retains its original reference height/scale; actual foundation, rooftop cloud anchors and impact follow the lower ground. City-view camera translates with the foundation and fades the offset out before the later gallery. Shoreline is rebuilt from the lowered island at the existing sea level. Files: city.ts, island-asset.ts, scene.ts. Ocean shader and layouts untouched.
- Built-in browser: 667×780 landing, desktop 1440×900 approach, phone 390×844 approach/landing and reverse return; no console errors observed. Viewport restored. nvm Node v24.21.0 npm run lint and git diff --check pass. No tests/benchmarks, staging, commits or deployment. Existing staged changes preserved. Evidence: /tmp/roe-island-submerged-667.png, /tmp/roe-island-submerged-desktop.png and /tmp/roe-island-submerged-phone.png. Awaiting Roe approval.

- Reopened: island-only 180° rotation and 30% enlargement, anchored at its current rear/top boundary and foundation height. Extend mass forward/down to crop at the viewport bottom. City direction/size/position, camera and meteor stay unchanged. Keep the fitted supporting deck and shoreline correct; review 667×780, desktop and phone.

- Orientation revision ready: island-local X/Z reversed for 180° yaw; fitted scale multiplied by 1.3. Forward offset equals half the added depth to retain the prior rear extent. Support plane stays fixed while the asset extends down and toward the foreground. Existing deck fitting/mesh shoreline run after the transform. Only island-asset.ts changed; city, scene camera, ocean and layouts unchanged in this pass.
- Built-in browser: 667×780 at progress 0.45849, desktop 1440×900 About approach and phone 390×844 approach/descent. Foreground crops at the bottom; city remains seated. No console errors observed; viewport reset. Node v24.21.0 npm run lint and git diff --check pass. No tests/benchmarks, staging, commits or deployment; existing staged changes preserved. Evidence: /tmp/roe-island-rotated-667.png, /tmp/roe-island-rotated-desktop.png and /tmp/roe-island-rotated-phone.png. Awaiting Roe visual approval.

- Reopened: restore prior island orientation (-180° from the current revision), enlarge again, and lower the outer terrain further into the ocean. Preserve city size/direction, contact plane and rear extent. This pass uses about 20% additional island scale and deeper coastal grading; validate the exposed shoreline in the built-in browser.

- Low-coast revision ready: restored original X/Z orientation, changed island fit multiplier from 1.3 to 1.55 (~19% additional scale), retained rear/support anchors, and lowered outer terrain 0.14 model units with a wider transition from the supporting deck into the sea. Initial narrow grading was widened after preview so the land reads as a broad island rather than a small platform. Only island-asset.ts changed; city/camera/meteor/ocean shader unchanged.
- Built-in browser reviewed 667×780 at progress 0.45296, 1440×900 About approach and 390×844 approach/descent. City remains seated; fewer exposed outer rock features. No console errors observed; viewport reset. Node v24.21.0 npm run lint and git diff --check pass. No tests/benchmarks, staging, commits or deployment; user staged changes preserved. Evidence: /tmp/roe-island-lower-coast-667.png, /tmp/roe-island-lower-coast-desktop.png and /tmp/roe-island-lower-coast-phone.png. Awaiting Roe visual approval.

- Reopened: Roe wants a larger island with more rocky features above the water in its current restored orientation. Increase extent again and reduce coastal submersion; retain the city support height, rear extent, city size/direction and camera.

- Expanded-coast revision ready: island fit 1.55 → 1.85 (~19% enlargement), coastal submersion 0.14 → 0.035 model units. The outer rock rises while the city-contact plane stays fixed. Original orientation/rear anchor, city, camera, ocean and meteor unchanged. Only two island-asset.ts parameters changed in this pass.
- Built-in browser reviewed 667×780 annotated approach, desktop 1440×900 About approach and phone 390×844 approach/descent; no console errors observed. Viewport reset. Node v24.21.0 npm run lint and git diff --check pass. No tests/benchmarks, staging, commits or deployment; user staged changes preserved. Evidence: /tmp/roe-island-expanded-667.png, /tmp/roe-island-expanded-desktop.png and /tmp/roe-island-expanded-phone.png. Awaiting Roe visual approval.

- Reopened: Roe wants visible island edges and rocky cliff sides during landing, with more terrain emerging from the sea. Previous foreground extent filled the frame. Fit width/depth independently, shorten the foreground, retain original rock relief beyond the city support, and review the actual landing angle at 667×780 plus desktop/phone. City, camera and meteor remain unchanged.

- Cliff-edge revision ready: island width/depth/height fit multipliers are 1.45/1.10/1.30; narrower foundation leveling (0.18 model-unit transition) preserves more original perimeter relief. Removed the extra 0.035 coastal sink. Shortened depth brings the front edge into the landing frame while the city contact plane stays fixed. Only island-asset.ts changed in this pass.
- Built-in browser reviewed actual landing states at 667×780 (p 0.50003), desktop 1440×900 (p 0.50979) and phone 390×844 (p 0.49602). Cliff walls visible and bases meet the ocean; city remains seated. No console errors observed; viewport reset. Node v24.21.0 npm run lint and git diff --check pass. No tests/benchmarks, staging, commits or deployment; staged user changes preserved. Evidence: /tmp/roe-island-cliffs-667.png, /tmp/roe-island-cliffs-desktop.png and /tmp/roe-island-cliffs-phone.png. Awaiting Roe visual approval.

- 2026-10-21: Reopened to load public/assets/island/iron-island.glb instead of island.glb. Preserve existing fit, noir rendering, city size/direction, camera and timing. Inspect the new asset at approach/landing and desktop/phone; no tests/benchmarks or commits.

- Iron island ready: changed only the asset URL in island-asset.ts to /assets/island/iron-island.glb. Existing fitting/support and noir materials apply to the new model; city, camera, ocean and timing unchanged. Built-in browser reviewed 693×780 approach, 1440×900 approach/landing and 390×844 impact. New island loaded, city seated and rim in the ocean; no console errors observed. Viewport reset.
- Node v24.21.0 npm run lint and git diff --check pass. No tests/benchmarks, staging, commits or deployment. Evidence: /tmp/roe-iron-island-preview.png, /tmp/roe-iron-island-desktop.png and /tmp/roe-iron-island-phone.png. Awaiting Roe visual approval. New supplied asset remains untracked; no Git staging requested or performed.

- Reopened: Roe requests raising the iron island to meet building bases (693×780 landing annotation). Asset inspection shows the broad upward-facing deck at source Y≈0.053 and the rim at Y≈0.098. Align to the deck, retain the city support plane and keep city/camera fixed. Review contact and shoreline at landing on desktop/phone; no tests/benchmarks or commits.

- Raised-deck revision ready: source IRON_ISLAND_DECK_HEIGHT=0.053 now drives vertical fit instead of bounds.max.y; support clearance reduced from 0.003 to 0.0005 model units. Outer island/rim rises, main deck meets the foundation and the mesh shoreline recalculates. City and camera unchanged. Only island-asset.ts changed in this pass.
- Built-in browser reviewed 693×780 annotated landing at p 0.53028, desktop 1440×900 impact and phone 390×844 city/aftermath transition. No console errors observed; viewport reset. Node v24.21.0 npm run lint and git diff --check pass. No tests/benchmarks, staging, commits or deployment. New iron-island-2.glb and iron-island-3.glb uploads left untouched. Evidence: /tmp/roe-iron-island-raised-693.png, /tmp/roe-iron-island-raised-desktop.png and /tmp/roe-iron-island-raised-phone.png. Awaiting Roe visual approval.

- Reopened: Roe wants the bridges to terminate at the island perimeter (693×780 closing/contact annotation). Fit the island foreground to both bridge terminal positions, retaining city/bridge proportions, camera, deck height and the rear island anchor. Review closing and landing on desktop/phone; no tests/benchmarks or commits.

- Bridge-perimeter revision ready: measured both bridge terminals against the iron-island outline and increased only island depth from 1.10 to 1.336 of base fit. Foreground perimeter now reaches the bridge ends; rear anchor, deck height, island width/height, city geometry and camera remain unchanged. Shoreline foam refits to the resized mesh.
- Reviewed built-in browser closing and landing at 693×780, desktop 1440×900 and phone 390×844. Bridge contact is clearest in the desktop closing view; close landing framing crops the outer ends. No console errors observed; viewport restored. Node v24.21.0 npm run lint and git diff --check pass. No tests/benchmarks, staging, commits or deployment. Evidence: /tmp/roe-bridge-perimeter-desktop.png and /tmp/roe-bridge-perimeter-phone.png. Awaiting Roe visual approval.

- **pending** — 2026-10-23: Switch homepage city to `/assets/city/city.glb`; preserve existing framing and island fitting, then review in built-in browser.
- **pending / browser review blocked** — City URL switched to `/assets/city/city.glb`; existing fitting and scene choreography retained. Asset exists (524 KB). Node v24.21.0 via nvm: `npm run lint` passes; `git diff --check` passes. Built-in browser rejected localhost access under its URL security policy, so placement has not been visually verified. No tests, commits or deployment. Awaiting browser access/user preview.

- **testing / awaiting_visual_approval** — 2026-10-23: Built-in browser access restored. Confirmed replacement city renders at 1440×900 (About approach and impact) and 390×844 (About approach). No captured console errors. New model has a different footprint and taller central tower; close impact view crops the tower at desktop. Existing fit retained; no further source edits. Viewport restored. Evidence: `/tmp/roe-new-city-desktop.png`, `/tmp/roe-new-city-phone.png`. Prior Node 24 lint passed. Await Roe visual approval.

- **pending** — 2026-10-24: Investigate ocean disappearing after replacement city; restore visibility without changing approved wave styling.
- **testing / awaiting_visual_approval** — Normalized replacement city source depth to two scene units before computing framing/support, retaining that normalization during viewport fitting. This restores landscape water scale and elevation relative to the city; ocean shader unchanged. Built-in browser reviewed at 1440×900 and 390×844, water visible around island; no captured console errors, viewport restored. Node v24.21.0 `npm run lint` and diff check pass. No tests/benchmarks or commits. Evidence: `/tmp/roe-ocean-restored-desktop.png`, `/tmp/roe-ocean-restored-phone.png`.

- **pending** — 2026-11-02: Replace separate city/island with `/assets/city/city-island.glb`; seat its coastline in the ocean with visible sides. About view: bird’s-eye island approximately half viewport width, dispersed local clouds, continuous closer approach keeping tallest roof visible. Preserve clouds before About, ocean styling, content/layout and later scenes.

- **testing / awaiting_visual_approval** — 2026-11-02: Combined `/assets/city/city-island.glb` now replaces both prior models. Geometry stays intact and is normalized once; no second iron-island request or separate terrain deformation. Source deck Y=0, core lower lip Y=-2.5; waterline at source Y=-2.35 immerses the lower lip and exposes sidewalls. Shore foam uses triangle intersections with the actual combined island geometry.
- About approach uses a 76° bird’s-eye view at approximately half viewport width, positioned beneath About content. Scroll blends into fitted 42° and 25° city views; actual mesh extents provide full-model framing and tower headroom. Existing later gallery/contact keyframes, content, navigation and ocean shader retained.
- Landscape clouds: 64 smaller seeded PNG billboards distributed around the ocean/city at varied altitudes and sizes, with drift and distance/content clearance. Existing atmospheric placements and passage motion retained; rooftop-anchored clouds become smaller only once About has appeared (progress 0.335–0.35), so the earlier cloud passage retains its scale.
- Browser review: built-in browser 1440×900 and 390×844, About, mid-approach, closer city/sidewalls and reverse scrolling. Highest tower stays visible in reviewed approach/city states; desktop initially crops the island’s foreground below the viewport until scrolling into the full view. No captured console errors; viewport restored. Evidence: `/tmp/roe-combined-city-about-desktop.png`, `/tmp/roe-combined-city-close-desktop.png`, `/tmp/roe-combined-city-about-phone.png`, `/tmp/roe-combined-city-close-phone.png`.
- Validation: nvm Node v24.21.0, `npm run lint` and `git diff --check` pass. No tests/benchmarks, staging, commits or deployment. Prior user changes and uploaded assets preserved. Awaiting Roe’s visual approval; not done.

- **pending** — 2026-11-10: Center the combined island horizontally on the main tower. Preserve the current vertical screen position, scale, water level, camera angle and scroll choreography. Review desktop and phone in the built-in browser; Node 24 lint only, no tests/benchmarks or commits.

- **testing / awaiting_visual_approval** — 2026-11-10: Main tower now anchors horizontal camera framing through the island sequence. A horizontal view offset (vertical offset fixed at zero, viewport size unchanged) centers the landmark while preserving every vertical projection, camera pose, scale and model/water transform. Earlier scenes retain their original projection. Only scene.ts changed; cloud assets, placements, content and timing untouched.
- Reviewed in the built-in browser at 1440×900 and 390×844, About and closer city views plus reverse approach. Compared original desktop framing at approximately p=0.441 with the revised view; vertical placement retained. No captured console errors; viewport restored. Node v24.21.0 through nvm: `npm run lint` and `git diff --check` pass. No tests/benchmarks, staging, commits or deployment. Evidence: `/tmp/roe-island-centered-desktop.png`, `/tmp/roe-island-centered-phone.png`. Awaiting Roe visual approval.

- **pending** — Remove the visible IMPACT label from the city scene; preserve all scene positioning and animation.
- **testing** — Removed the caption-only film-impact section. Built-in browser confirms label absent at city progress 0.48614 (713×781). Scene animation and exposure remain unchanged. nvm Node v24.21.0 `npm run lint` and diff check pass. No tests or commits. Evidence: `/tmp/roe-city-no-impact-label.png`.

## Active task ANG-002 — Orbital Fragments Featurettes

- [ ] **in_progress** — 2026-11-11. Implement the user’s complete task brief and supplied middle “Orbital Fragments” reference in this dedicated Featurettes task chat. ANG-001 remains pending prior visual approval; its landscape work is outside this task.
- Approved direction: three actual featured images fused into genuine shallow 3D stone fragments; first upper left, second lower center, third upper right. Monochrome handmade silent-film miniatures, restrained Art Deco numbered HTML titles and fine leaders, generous negative space, foreground clouds. Source: current user message and attached middle preview.
- Scope: Featurettes geometry, image material, composition, HTML links, motion and mobile/fallback presentation. Preserve asteroid, camera, atmospheric passage, navigation, post destinations and other sections.
- Acceptance: visible closed sides/back and chipped rims, aspect-correct photos without rectangular edges, gentle independent drift/scroll parallax, hover/focus turn and brightness, accessible native links, mobile stagger, reduced motion, offscreen pause and resource disposal.
- Validation planned: built-in browser 1440×900 / 390×844, keyboard and links, fallback, Node 24 via nvm lint, TypeScript and diff check. No tests, benchmarks, commits or deployment.
- Handoff: user supplied one specific implementation task with full scope and approved reference directly in this chat; no additional task chat needed.
- Approval: pending review of implemented revision.

- 2026-11-11 refinement: user requests removing the clouds added around the fragments. Removed the three fragment-specific cloud meshes and their animation; original atmospheric and landscape clouds remain unchanged. This supersedes the foreground-cloud part of the original brief.
- Current revision verified at 1440×900 and 390×844 after removing added clouds. Earlier checks also covered 1024×768, keyboard focus, original external destinations from both rock and title, and HTML reading mode. Fragment clocks freeze offscreen. Reduced-motion preference uses the existing static reading path (reviewed in source; OS preference not changed).
- Validation: nvm Node v24.21.0, npm run lint, npm run tsc, git diff --check pass. No tests, benchmarks, commits or deployment. Files: index.tsx, scene.ts, orbital-featurettes.tsx, orbital-fragments.ts, style.module.css. Review images: design-specs/home/shots/orbital-fragments-desktop.png and orbital-fragments-mobile.png. Awaiting visual approval of current revision.

- New direction: orbit the actual asteroid in 3D, reveal numbered titles/leaders only on the centered front pass, use deeper rock geometry and the debris lighting/material. Supersedes static asymmetric arrangement; retain no added clouds, actual photos and native links.
- Orbit revision: genuine world-space orbit anchored to the animated asteroid bounds; scroll plus slow time progression, actual rear occlusion, projected HTML hit areas. Keyboard focus eases a chosen rock to the front and holds it. Titles/numbers/leaders only appear near the centered front pass. Mobile uses the same orbit; static reading/reduced-motion layout retains all titles.
- Rock geometry now uses the surrounding debris’s seeded sculpting function and its exact lighting shader, with solid irregular volume and a carved photographic facet. No added clouds. Previewed 1440×900 and 390×844, confirmed only centered caption visible and keyboard selection, no horizontal mobile overflow or new console errors. Node 24 lint, TypeScript and diff checks pass. No tests, commits or deployment. Current visual approval pending.

- Current feedback: eliminate triangle artifacts, cover all sides with photography, darken rocks, make scroll the primary orbit input with barely perceptible idle drift, prevent surrounding debris intersections. Implementing welded smooth normals, blended triplanar photographs, darker exposure, 0.006 rad/s idle motion and deterministic debris clearance.

- Five refinements implemented and reviewed: welded normals and continuous shading remove triangular patches; blended triplanar photographs cover the entire closed rock; darker exposure; idle orbit 0.006 rad/s with scroll factor 42; debris displacement enforces world-space and projected clearance, restoring authored placement outside Featurettes. Desktop/mobile and forward scroll inspected, centered keyboard selection verified, no new console errors. Node v24.21.0 lint, TypeScript, and diff checks pass. Current screenshots updated; visual approval pending. No tests, commits or deployment performed by the agent.

- New refinement: replace rock entrance opacity with staggered scroll-driven flights from upper left, bottom, and upper right. All rocks arrive fully opaque and settle into the orbit by progress 0.19; centered captions wait for arrival. Existing exit transition retained.
