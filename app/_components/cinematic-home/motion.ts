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
    aboutOpacity: windowOpacity(p, 0.3, 0.335, 0.405, 0.455),
    transmissionsOpacity: windowOpacity(p, 0.535, 0.555, 0.615, 0.65),
    portfolioOpacity: windowOpacity(p, 0.645, 0.67, 0.875, 0.91),
    contactOpacity: smooth(0.93, 0.975, p),
  }
}

// Featured Posts criss-cross. Distances are in card widths; y grows downward.
// Normal page scroll drives it: each group of up to three cards is staged
// outside opposite sides of the viewport, then slides diagonally into a
// non-overlapping slot (first card from the upper left, second from the lower
// right, third later from the upper right).
export const POST_FRAME = { width: 1.125, height: 1.29 }
const POST_GAP = 0.26
const POST_PITCH_X = POST_FRAME.width + POST_GAP
// Mobile rows need extra air so stacked frames never touch.
const POST_PITCH_Y = POST_FRAME.height + 0.45
const POST_SPAN = { start: 0.14, end: 0.245 }
// Per-card enter windows inside a group's timeline: the pair first, then the third.
const POST_ENTER: [number, number][] = [
  [0, 0.45],
  [0, 0.45],
  [0.35, 0.8],
]
const POST_LEAVE = [0.86, 1]
// Default distance, in card widths, that clears the viewport edge.
const POST_REACH = { desktop: 3.7, mobile: 2.7 }

type PostSlot = { x: number; y: number; side: -1 | 1; dy: number }

function postSlots(count: number, mobile: boolean): PostSlot[] {
  const half = POST_PITCH_X / 2
  if (mobile) {
    if (count <= 1) return [{ x: 0, y: 0, side: -1, dy: -0.45 }]
    if (count === 2)
      return [
        { x: -half, y: -0.36, side: -1, dy: -0.45 },
        { x: half, y: 0.36, side: 1, dy: 1 },
      ]
    return [
      { x: -half, y: -POST_PITCH_Y / 2, side: -1, dy: -0.45 },
      { x: half, y: 0, side: 1, dy: 1 },
      { x: -half, y: POST_PITCH_Y / 2, side: -1, dy: 0.45 },
    ]
  }
  if (count <= 1) return [{ x: 0, y: 0, side: -1, dy: -1.4 }]
  if (count === 2)
    return [
      { x: -half, y: 0, side: -1, dy: -1.4 },
      { x: half, y: 0, side: 1, dy: 1.4 },
    ]
  return [
    { x: -POST_PITCH_X, y: 0, side: -1, dy: -1.4 },
    { x: 0, y: 0, side: 1, dy: 1.4 },
    { x: POST_PITCH_X, y: 0, side: 1, dy: -1.4 },
  ]
}

export function postsFormation(mobile: boolean, count = 3) {
  const slots = postSlots(Math.min(3, Math.max(1, count)), mobile)
  const xs = slots.map((slot) => slot.x)
  const ys = slots.map((slot) => slot.y)
  return {
    slots,
    extent: {
      width: Math.max(...xs) - Math.min(...xs) + POST_FRAME.width,
      height: Math.max(...ys) - Math.min(...ys) + POST_FRAME.height,
    },
  }
}

export function postsPose(
  index: number,
  count: number,
  progress: number,
  mobile: boolean,
  reach = mobile ? POST_REACH.mobile : POST_REACH.desktop,
) {
  const groups = Math.max(1, Math.ceil(count / 3))
  const group = Math.floor(index / 3)
  const slot = postSlots(Math.min(3, count - group * 3), mobile)[index % 3]
  const timeline =
    clamp((progress - POST_SPAN.start) / (POST_SPAN.end - POST_SPAN.start)) *
      groups -
    group
  const [from, to] = POST_ENTER[index % 3]
  const travel = smooth(from, to, timeline)
  const leaving =
    group < groups - 1 ? smooth(POST_LEAVE[0], POST_LEAVE[1], timeline) : 0
  const away = slot.side * Math.max(reach, Math.abs(slot.x) + 1)
  // The vertical offset resolves early so a card never crosses the title or link row.
  const lift = 1 - smooth(0, 0.8, travel)
  return {
    x: mix(slot.x, away, Math.max(1 - travel, leaving)),
    y: slot.y + slot.dy * lift,
    opacity: 1,
    color: smooth(0.7, 1, travel) * (1 - smooth(0, 0.4, leaving)),
    active: travel > 0.85 && leaving < 0.2,
    interactive: travel > 0.97 && leaving === 0,
  }
}

// Fallback (DOM-only) pose in card widths, matching the WebGL formation.
export function crossingCard(
  index: number,
  count: number,
  progress: number,
  mobile: boolean,
) {
  return postsPose(index, count, progress, mobile)
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
