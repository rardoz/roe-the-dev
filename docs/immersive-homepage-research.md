# Immersive homepage: audit and reference study

## Governing direction

The supplied homepage brief is the request. `design-specs/home/mock.png` establishes composition and sequence; its example article names and illustrated portrait are not content sources. The final experimental cinematic noir override governs lighting, palette, atmosphere, and ornamentation. The other design-spec folders are outside this task's requested layout changes.

Build a continuous journey through arrival, crossing posts, Roe and the industrial city, impact, Transmissions, the cloud portfolio, and the wasteland. Preserve the restored site's destinations and behavior. Earlier discarded designs are excluded.

## Restored application

- Next.js App Router, React, next-intl, TypeScript, Tailwind, Flowbite, and CSS modules. English and Spanish routes already exist.
- Contentful supplies featuredContent, blog, linkBank, portfolio, and experiment entries. Existing adapters carry titles, descriptions, images, slugs, and hardRoute destinations.
- The homepage previously composed an independent featured carousel, portrait/bio, a purple portfolio carousel, and three article cards. Their separate containers and unrelated transitions provide little spatial continuity.
- The existing logo, actual `/roe-profile-pic.png`, CMS article imagery and project screenshots remain authoritative. The mock's portrait and sample titles must not replace them.
- Blog and portfolio details, rich-text rendering and executable code examples, the sketchbook's page/lock/code/drawing flows, the game, API documentation, localization, and social destinations must remain available.

The [live homepage](https://www.roethedev.com/) corroborates the existing biography, featured destinations, eGro/Vivid Seats/Leafly/Avvo/Lottiewood/By Rojo projects, and the three external articles in linkBank. Implementation reads the CMS instead of copying these into invented fixtures.

## Browser study

Studied [Active Theory](https://activetheory.net/) in an isolated Chrome instance at 1440 × 960 using actual mouse-wheel input. Its text-only page response exposes almost none of the experience; the browser successfully rendered its canvas. Fresh captures show the opening object, the expanding foreground composition, and multiple portfolio positions. Native scrolling revealed the connecting structure and overlapping project planes. No source-code claim is made about the reference's renderer or shaders.

Five observed principles guide the implementation:

| Observed behavior | Adaptation here |
| --- | --- |
| A persistent object connects camera positions. | Keep the same asteroid through descent and impact; keep the resulting cloud through the portfolio. |
| Scale changes create a foreground encounter before the camera continues. | Begin with an asteroid spanning most of the viewport, then pull away into the city. |
| Projects overlap at distinct depths. | Crossing posts and the helix use perspective, front/back order, and readable focal content. |
| Scroll changes the environment alongside the content. | Drive camera, objects, city, shockwave, and cloud with a shared reversible timeline. |
| Navigation stays sparse against the environment. | Use restrained fixed navigation and clear semantic destinations. |

These are motion and spatial principles, not copied forms. The asteroid collision, industrial noir city, mushroom-cloud helix, desert relics, and severe geometric interface come from the supplied brief and newly authored geometry.

The opening and scroll compositions were verified visually. Clicking the focused project opened the real `/work/secret-sky` detail route, carrying the environment behind its readable project content. Reference audio, its mobile behavior, and internal implementation were not audited.

## Implementation and review criteria

One demand-rendered Three.js world supplies the environment. Semantic React links and controls preserve content accessibility; the native document scroll position directs the timeline. The X-shaped Featured Posts presentation and scroll-only portfolio orbit remain distinct from the button/swipe Transmissions carousel.

Direction is evaluated through actual rendered frames: tonal separation, foreground scale, the Earth's smooth spherical limb, monumental city geometry, billowing cloud mass, crossing/orbit movement, and a sparse desert composition. Interface text stays outside the environmental film treatment. Smaller viewports receive their own camera framing and touch controls.

The first implementation was rejected for its visual distance from the supplied mock. The user confirmed that the revision should retain black-and-white noir. The mock's contrast, density, silhouettes, spatial proportions, and framing remain the target; its amber color does not return.

The visual revision must address specific differences visible in the rendered frames:

- Replace smooth, uniformly gray boulders with fractured dark rock, pale angular faces, deep recesses, and a clear backlit silhouette. Keep the introduction, asteroid, and planetary limb closely composed.
- Replace repetitive rectangular city roofs with slender stepped towers, carved vertical ribs, narrow crowns, a monumental central cluster, and a perspective avenue. Separate the silhouette from atmospheric light behind it.
- Give the planetary horizon continuous white atmospheric light and shaped cloud banks, rather than isolated elliptical patches.
- Develop the frames into precise layered rules, clipped corners, restrained diamonds, and intentional link affordances. Match the typography between real 3D previews and semantic interface content.
- Give the cloud a dark sculpted head and continuous shaft with pronounced pale edges, and give the final terrain recognizable fractured planes and foreground objects. Avoid uniform gray surfaces.
- Reserve enough space for headings, focal previews, and all contact links at compact and landscape sizes. Make the full biography available in reading mode.

Automated checks cover timeline/content behavior and existing functionality. Browser review must additionally exercise native scroll reversal, touch and keyboard controls, genuine links, responsive framing, reduced motion, renderer fallback, resource idling, resize, and context recovery. Browser observations and remaining limits are recorded separately from test results.
