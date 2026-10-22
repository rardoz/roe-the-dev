# Angie — Homepage

## Active task ANG-001

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
