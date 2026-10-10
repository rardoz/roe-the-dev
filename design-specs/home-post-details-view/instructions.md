Codex Add-On Prompt — Post Open / Reading Experience
Extend the immersive homepage experience with a post-open interaction that allows a user to click a featured item and smoothly enter a reading mode without breaking the continuity of the homepage journey.
This should feel like the user is zooming into a story inside the world, not navigating to a disconnected blog page or opening a generic modal.
The design direction should stay fully aligned with the homepage redesign:

- Art Deco
- noir futurism
- David Lynch / Eraserhead atmosphere
- cinematic, surreal, slightly industrial
- elegant typography
- premium, polished interaction design
  Use the attached visual concept / graphic as the creative reference for this interaction.
  Goal
  When a user clicks a post from:
- Featured Posts
- Transmissions
- or any similar featured content card on the homepage
  …the experience should transition into a full article presentation.
  The transition should:

1. Zoom into the clicked featured image
2. Expand it into the article view
3. Present the article content in a beautiful editorial layout
4. Automatically exit when the user scrolls past the bottom of the article
5. Seamlessly return the user to the homepage scroll journey at the appropriate continuation point
6. Also allow reverse exit behavior when scrolling upward back past the top of the article
   This must feel like one continuous interactive experience.
   Core Behavior
7. Entry Interaction
   When a user clicks a post card:

- The clicked card becomes the active source element
- Its featured image should visually expand / zoom forward
- The frame and image should become the anchor for the transition
- The homepage world should recede into the background
- The article view should emerge from the clicked image
  This should feel elegant, cinematic, and spatial.
  Avoid:
- abrupt page reloads
- generic route switches with no visual continuity
- default modal behavior
- instant full-screen swaps
  The transition should preserve a sense of place between the card and the article.

2. Article View Concept
   The article should open as a reading layer inside the same universe.
   It should not feel like a completely different site.
   Background Treatment
   When the article opens:

- The background should shift to a solid gray field
- Behind that gray field there should be a very faint haze or ghosted impression of the homepage world behind it
- This haze should be subtle and heavily reduced in contrast so it does not compete with readability
- The article content must remain the primary focus
  Think of the background like:
- soft gray
- slightly atmospheric
- cinematic
- muted
- with only a whisper of the world behind it
  VHS / Old TV Overlay
  In front of the gray background, but behind the article content, add intermittent visual texture inspired by:
- VHS tracking noise
- analog scan lines
- old TV static
- subtle distortion bands
- occasional horizontal tracking lines
- soft film interference
  Important:
- these effects must be subtle
- they must never make the article hard to read
- they should appear intermittently, not constantly overwhelm the screen
- the effect should feel atmospheric and intentional, not gimmicky
  The visual order should be:

1. faint homepage haze in the far background
2. solid gray reading field
3. subtle intermittent VHS/static/tracking effects
4. article content on top
   The content must remain crisp and readable.
5. Article Layout
   Design a premium reading experience.
   The article layout should feel editorial, elegant, and immersive.
   Required structure
   Include space for:

- Back / return affordance
- Post category
- Large headline
- Optional subtitle / deck
- Publish date
- Reading time
- Author / identity if appropriate
- Large featured image
- Body content
- Inline media / section imagery
- Section headings
- Footer / article end state
  Visual Language
  Use:
- refined typography
- Art Deco dividers / ornaments
- strong spacing rhythm
- cinematic framing
- premium editorial hierarchy
  Keep it readable first, but highly designed.
  The article layout should feel like a story panel inside the larger universe.

4. Scroll Continuity — Critical Requirement
   This interaction must preserve the feeling that the homepage and article are part of the same scroll world.
   At the Bottom of the Article
   When the user reaches the end of the article and continues scrolling downward:

- the article should automatically exit
- the reading layer should close smoothly
- the user should be returned to the homepage
- the homepage should resume at the next logical point in the scroll journey
  This should feel like the user is continuing forward through the universe after finishing the post.
  Do not dump them back to the top.
  Do not force them to click a close button.
  Do not make the exit feel abrupt.
  The exit should feel natural and scroll-driven.
  At the Top of the Article
  When the user scrolls upward to the very top of the article and continues scrolling upward:
- the article should reverse out
- the experience should transition back into the homepage
- the user should re-enter the homepage at the point they came from
- the page should continue scrolling upward through the homepage if they keep going
  This reverse transition is just as important as the forward exit.
  The user should feel that the article is nested inside the homepage journey and can be entered/exited in either scroll direction.

5. Relationship to Homepage Content
   The article-open experience should work for content opened from homepage sections, especially:

- Featured Posts
- Transmissions
  The clicked item should clearly influence the opened post state.
  That means:
- the clicked card’s image should be the source of the zoom transition
- the article should open to the matching content
- the visual continuity between card and article should feel direct
  If useful, preserve some of the clicked card’s visual identity during transition:
- frame geometry
- image crop
- title
- accent styling

6. Motion Design Principles
   Treat this as a cinematic interaction.
   I want the transition and reading experience to feel:

- elegant
- atmospheric
- intentional
- smooth
- spatial
- premium
  Use:
- zoom transitions
- opacity fades
- scale transforms
- depth shifts
- subtle parallax
- restrained easing
  Avoid:
- bouncy UI motion
- overdone blur effects
- generic modal slide-ins
- flashy or chaotic animation
  The motion should feel like entering and leaving a dream state or alternate layer of the same world.

7. Reading UX Expectations
   Even though this is highly designed, the reading experience still needs to be usable.
   Please make sure:

- text is highly readable
- line length is comfortable
- spacing is generous
- headings are clear
- article images scale well
- mobile reading is smooth
- the exit behavior is intuitive
- the user never feels trapped
  A manual close control is okay as a secondary fallback, but the primary behavior should be scroll-based exit at the top and bottom.

8. Mobile Behavior
   This interaction must work beautifully on mobile.
   On mobile:

- the article layout should remain elegant and readable
- the featured image transition should still feel cinematic
- the subtle VHS/static layer should still exist, but remain unobtrusive
- the user should be able to scroll naturally through the article
- the automatic exit at the top and bottom should still feel smooth and understandable
  Be careful not to create a cramped modal feeling on mobile.
  It should still feel like entering a full-screen story experience.

9. Technical Intent
   You may choose the best implementation strategy.
   I am not prescribing exact technical constraints.
   However, the implementation must:

- preserve scroll continuity
- avoid jarring page reload behavior
- maintain strong perceived performance
- work responsively
- feel integrated with the homepage animation system
- be maintainable and reusable
  If appropriate, build this as a reusable content-overlay / article-transition system that can be triggered by homepage cards.
  The important thing is not the exact implementation method.
  The important thing is the quality of the experience.

10. Non-Negotiable Requirements

- [ ] Clicking a featured post zooms into the featured image
- [ ] The clicked image becomes the opening transition into the article
- [ ] The article opens in a premium editorial layout
- [ ] The article background becomes solid gray
- [ ] A very faint haze of the homepage world remains behind the gray
- [ ] Subtle VHS/static/tracking/scan-line effects appear intermittently
- [ ] Those effects stay behind the article content so readability is preserved
- [ ] Scrolling past the bottom automatically exits the article and continues through the homepage
- [ ] Scrolling upward past the top automatically exits the article and returns upward through the homepage
- [ ] The entire interaction feels like part of the same continuous world
- [ ] The experience works on desktop and mobile
- [ ] The interaction feels cinematic, polished, and intentional
      Final Principle
      I do not want this to behave like a standard blog page or generic overlay.
      I want it to feel like the user has clicked into a signal, memory, or transmission embedded in the homepage universe.
      The post should feel temporarily isolated for reading, but still spiritually and behaviorally connected to the larger scrolling experience.
      Make it feel elegant, strange, cinematic, and seamless.

# AESTHETIC OVERRIDE — EXPERIMENTAL CINEMATIC NOIR

This aesthetic direction takes precedence over earlier visual styling instructions where they conflict, but all previously established functionality, content, layouts, and interaction requirements should remain intact.

## Creative Vision

I want this website to feel like a lost black-and-white film from an alternate industrial future.

The primary cinematic inspiration is David Lynch's _Eraserhead_.

The previous designs lean too heavily toward polished AI-generated science-fiction illustrations. I want something stranger, more atmospheric, more authentic, and more unsettling.

Imagine a surreal experimental film from the late 1920s through the 1970s, combining German Expressionist cinema, industrial dystopia, Art Deco architecture, and Lynchian surrealism.

**The result should feel like cinema, not an illustration or a video game poster.**

## 1. Black-and-White Cinematography

Make true monochrome the dominant visual language.

Use:

- Deep, almost crushed blacks.
- Rich charcoal and silver-gray midtones.
- Harsh, directional white lighting.
- Dramatic silhouettes.
- Pools of darkness and negative space.
- High-contrast architectural compositions.
- Soft atmospheric haze and smoke.

Remove the excessive gold, orange, amber, and neon treatments from the previous designs.

Art Deco should be expressed primarily through geometry, framing, typography, and composition rather than metallic gold.

The experience should feel like it was photographed on old black-and-white film.

## 2. Industrial Surrealism

Environments should feel monumental, strange, and slightly oppressive.

Incorporate visual motifs such as:

- Endless industrial structures and machinery.
- Enormous concrete and steel architecture.
- Impossible architectural perspectives.
- Smoke stacks and drifting industrial fog.
- Deep shadows and isolated light sources.
- Empty environments that emphasize scale and solitude.
- Unusual framing and dreamlike spatial relationships.

Avoid adding objects purely for decoration.

Every element should contribute to the atmosphere and narrative.

## 3. Avoid the AI-Generated Poster Look

This is extremely important.

Avoid:

- Excessively symmetrical compositions.
- Overly ornate glowing borders.
- Thousands of unnecessary particles and details.
- Perfectly polished digital illustrations.
- Excessive gradients and bloom.
- Constant dramatic lighting in every direction.
- Overly sharp, uniformly detailed environments.
- Repetitive science-fiction imagery.
- Decorative elements competing with the actual content.

Instead, prioritize restraint.

Some scenes should feel almost empty.

Some should be obscured by darkness.

Others should use a single powerful light source to reveal just enough of the environment.

**Imperfection, mystery, and negative space are essential.**

## 4. Art Deco, Reimagined

Retain Art Deco as the underlying design system, but make it more severe and architectural.

Use:

- Elegant, elongated typography.
- Thin geometric rules and dividers.
- Restrained ornamental detailing.
- Symmetrical UI framing where appropriate.
- Minimal diamond and angular motifs.
- Strong composition and proportional balance.

Think industrial Art Deco, not luxurious Gatsby-inspired Art Deco.

The interface should feel like it belongs inside an abandoned futuristic theater or an old industrial broadcast station.

## 5. Authentic Analog Film Treatment

Introduce subtle imperfections inspired by historical film projection.

Examples:

- Fine monochromatic film grain.
- Occasional film scratches.
- Slight frame instability.
- Infrequent exposure fluctuations.
- Subtle projector flicker.
- Soft diffusion around strong lights.
- Atmospheric smoke and haze.

These should be implemented as restrained environmental effects rather than permanently covering the interface.

Text, controls, code blocks, and interactive elements must remain crisp and readable.

Avoid constant flickering or excessive visual noise.

Respect reduced-motion settings.

## 6. Cinematic Animation

Animation should feel like a camera moving through a surreal film.

Favor:

- Slow, deliberate camera movements.
- Uncomfortable moments of stillness.
- Objects gradually emerging from darkness.
- Environmental movement through smoke and shadow.
- Long, atmospheric transitions.
- Subtle depth and parallax.
- Dramatic changes in scale.
- Carefully timed reveals.

Avoid:

- Bouncy animations.
- Generic UI motion.
- Constant motion for its own sake.
- Excessively smooth, artificial-looking spectacle.
- Overly elaborate transitions that distract from the experience.

Not everything needs to move.

Stillness should be treated as an intentional creative tool.

## 7. Photography and Imagery

Use a consistent cinematic treatment across imagery.

Portraits, article thumbnails, portfolio screenshots, and environmental assets should feel unified.

By default, use monochrome imagery with strong tonal contrast.

Selected content may receive increased brightness, contrast, scale, or clarity when active.

Where an interaction previously required full-color emphasis, preserve that functionality unless explicitly experimenting with a monochrome alternative.

Do not compromise the legibility of actual project screenshots or technical content.

## 8. Consistency Across the Website

Apply this visual treatment consistently to:

- Homepage and cinematic scroll experience.
- Featured Posts and Transmissions.
- Portfolio presentation.
- About Roe.
- Blog index.
- Blog article detail pages.
- Sketchbook experiment pages.
- Buttons, navigation, breadcrumbs, and footers.
- Interactive overlays and reading experiences.

Each page should feel like a different location within the same strange cinematic universe.

Retain existing page-specific layouts and behavior.

Do not homogenize all pages into the same composition.

## 9. Implementation Quality

Choose the most appropriate techniques for the existing architecture.

Favor efficient, reusable visual systems.

Do not use a flattened image as a replacement for interactive elements.

Use lighting, shadow, composition, and restrained animation to establish atmosphere rather than relying on expensive visual effects.

Maintain excellent responsive behavior, accessibility, and readability.

## 10. Final Aesthetic Test

Before considering the redesign complete, ask:

- Does this look like a frame from a surreal black-and-white film?
- Does it feel unsettling and mysterious without being cluttered?
- Does it retain the elegance of Art Deco?
- Does it avoid the appearance of generic AI-generated concept art?
- Are the visuals atmospheric rather than merely decorative?
- Is the interface still readable and usable?
- Does every page feel like part of the same cinematic world?

If the result still looks like a glossy science-fiction poster, the aesthetic has not been implemented successfully.

**Final direction: Less spectacle. More atmosphere. Less ornamentation. More cinematic composition. Less artificial perfection. More mystery.**

Create an immersive experience that feels discovered rather than manufactured.
