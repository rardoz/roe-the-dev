export const sectionPositions = {
  arrival: 0,
  posts: 0.19,
  about: 0.36,
  impact: 0.485,
  transmissions: 0.565,
  portfolio: 0.68,
  contact: 0.965,
} as const

export const clamp = (value: number, lower = 0, upper = 1) =>
  Math.min(upper, Math.max(lower, value))
export const mix = (from: number, to: number, value: number) =>
  from + (to - from) * value
export const smooth = (from: number, to: number, value: number) => {
  const progress = clamp((value - from) / (to - from))
  return progress * progress * (3 - 2 * progress)
}
export const windowOpacity = (
  progress: number,
  start: number,
  enter: number,
  leave: number,
  end: number,
) => smooth(start, enter, progress) * (1 - smooth(leave, end, progress))

export function filmState(progress: number) {
  const p = clamp(progress)
  return {
    progress: p,
    descent: smooth(0.015, 0.48, p),
    impact: smooth(0.475, 0.54, p),
    flash: 0.65 * Math.exp(-Math.pow((p - 0.49) / 0.0045, 2)),
    portfolio: clamp((p - 0.655) / 0.235),
    retreat: smooth(0.89, 0.99, p),
    // Headline and divider: absent at exact top, in after scrolling starts, out before Featured Posts.
    arrivalCopyOpacity: smooth(0.006, 0.03, p) * (1 - smooth(0.07, 0.12, p)),
    arrivalOpacity: 1 - smooth(0.075, 0.145, p),
    postsOpacity: windowOpacity(p, 0.13, 0.165, 0.285, 0.315),
    // Cards start fully staged outside the viewport, so they need no slow fade-in.
    postsCardsOpacity: windowOpacity(p, 0.125, 0.14, 0.285, 0.315),
    // Title and link flow upward from below as the section arrives.
    postsRise: 1 - smooth(0.12, 0.2, p),
    postsBackdropClear: p >= 0.315,
    aboutOpacity: windowOpacity(p, 0.3, 0.335, 0.405, 0.455),
    transmissionsOpacity: windowOpacity(p, 0.535, 0.555, 0.615, 0.65),
    portfolioOpacity: windowOpacity(p, 0.645, 0.67, 0.875, 0.91),
    contactOpacity: smooth(0.93, 0.975, p),
  }
}

// Opposing entries settle into a persistent row; the mobile document list uses
// the same color/interaction states but lays out real DOM frames vertically.
export const POST_FRAME = { width: 1.125, height: 1.29 }
const POST_PITCH_Y = 1.15
const POST_REACH = { desktop: 3.7, mobile: 2.7 }

export function postRow(viewportWidth: number, count: number) {
  const gap = 28
  const available = viewportWidth - 112
  const unit = Math.min(
    480,
    (available - gap * Math.max(0, count - 1)) /
      (Math.max(1, count) * (POST_FRAME.width + 0.08)),
  )
  return { unit, pitch: POST_FRAME.width + 0.08 + gap / unit, gap }
}

export function documentFilmProgress(
  offset: number,
  length: number,
  extra = 0,
) {
  const insertion = length * 0.285
  return clamp(
    (offset - clamp(offset - insertion, 0, extra)) / Math.max(1, length),
  )
}

export function documentFilmOffset(
  progress: number,
  length: number,
  extra = 0,
) {
  return progress * length + (progress > 0.285 ? extra : 0)
}

export function mobilePostWidth(viewportWidth: number) {
  return Math.min(viewportWidth - 40, 421.96757)
}
export const postsStacked = (viewportWidth: number) => viewportWidth <= 1000
export function postsHeadingOffset(
  cardTop: number,
  headingTop: number,
  headingHeight: number,
) {
  return cardTop - 100 - headingHeight - headingTop
}
export function postsPose(
  index: number,
  count: number,
  progress: number,
  mobile: boolean,
  reach = mobile ? POST_REACH.mobile : POST_REACH.desktop,
) {
  const slot = (index - (count - 1) / 2) * 1.4
  const side = mobile ? (slot <= 0 ? -1 : 1) : index === 0 ? -1 : 1
  const travel = smooth(
    mobile
      ? side < 0
        ? 0.14
        : 0.175
      : 0.14 + (index / Math.max(1, count)) * 0.105,
    mobile
      ? side < 0
        ? 0.205
        : 0.245
      : 0.14 + ((index + 1) / Math.max(1, count)) * 0.105,
    progress,
  )
  // The first and last enter horizontally; interior entries rise into their
  // own columns so additional CMS content cannot cross settled footprints.
  const bottom = !mobile && index > 0 && index < count - 1
  return {
    x: mobile
      ? slot + side * reach * (1 - travel)
      : bottom
        ? slot
        : mix(side * (reach + Math.abs(slot)), slot, travel),
    y: mobile
      ? -POST_PITCH_Y * (1 - travel)
      : bottom
        ? reach * (1 - travel)
        : 0,
    depth: mobile ? (1 - travel) * 0.12 : 0,
    scale: mobile ? mix(0.6, 1, travel) : 1,
    opacity: travel > 0 ? 1 : 0,
    color: smooth(0.8, 1, travel),
    active: travel > 0.97,
    interactive: travel > 0.97,
    travel,
  }
}

// DOM-only pose in card widths, matching the WebGL crossing.
export function crossingCard(
  index: number,
  count: number,
  progress: number,
  mobile: boolean,
  reach?: number,
) {
  return postsPose(index, count, progress, mobile, reach)
}

export function helixCard(
  index: number,
  count: number,
  progress: number,
  mobile: boolean,
) {
  const cursor = clamp((progress - 0.67) / 0.215) * Math.max(0, count - 1)
  const offset = index - cursor
  const angle = offset * 1.13
  const cosine = Math.cos(angle)
  return {
    x: Math.sin(angle) * (mobile ? 91 : 42),
    y: offset * (mobile ? 29 : 25),
    depth: (cosine - 1) * 490,
    rotation: -Math.sin(angle) * 38,
    scale: mix(0.53, 1, (cosine + 1) / 2),
    opacity:
      clamp(1 - Math.abs(offset) * 0.19) * mix(0.25, 1, (cosine + 1) / 2),
    color: 1 - smooth(0.12, 0.7, Math.abs(offset)),
    active: index === Math.round(cursor),
  }
}
