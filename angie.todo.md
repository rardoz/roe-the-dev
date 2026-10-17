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
