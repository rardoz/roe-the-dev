import { clamp, smooth } from './motion'

// Pure, time-based end-over-end (world X axis) tumble model for the opening asteroid.
// Negative angular rate rolls the visible face upward on screen (verified live).
export const IDLE_SPIN = -0.0525 // rad/s while the page is not scrolling
export const SCROLL_GAIN = -1.6 // rad per viewport-height scrolled (down = upward roll)
export const MAX_SPIN = 7 // rad/s
export const MAX_STEP = 0.05 // s; long frames never advance the model further
const SPIN_RESPONSE = 0.22 // s time constant toward the target spin
const SETTLE_TIME = 0.35 // s without scrolling before idle spin resumes

export type TumbleState = {
  angle: number
  spin: number
  sinceScroll: number
}

export const createTumble = (): TumbleState => ({
  angle: 0.35,
  spin: 0,
  sinceScroll: SETTLE_TIME,
})

const approach = (from: number, to: number, dt: number, tau: number) =>
  to + (from - to) * Math.exp(-dt / tau)

type StepInput = {
  dt: number
  // Signed scroll speed in viewport-heights per second (positive = down).
  scrollSpeed: number
  reduced: boolean
  dragging: boolean
}

export function stepTumble(state: TumbleState, input: StepInput): TumbleState {
  if (input.reduced) return { ...state, spin: 0, sinceScroll: SETTLE_TIME }
  if (input.dragging) return { ...state, sinceScroll: SETTLE_TIME }
  const dt = clamp(input.dt, 0, MAX_STEP)
  const scrolling = Math.abs(input.scrollSpeed) > 0.02
  const sinceScroll = scrolling
    ? 0
    : Math.min(SETTLE_TIME, state.sinceScroll + dt)
  const idleWeight = smooth(0.1, SETTLE_TIME, sinceScroll)
  const target = clamp(
    IDLE_SPIN * idleWeight + input.scrollSpeed * SCROLL_GAIN,
    -MAX_SPIN,
    MAX_SPIN,
  )
  const spin = approach(state.spin, target, dt, SPIN_RESPONSE)
  // Midpoint integration keeps the angle stable across frame rates.
  const angle = state.angle + ((state.spin + spin) / 2) * dt
  return { angle, spin, sinceScroll }
}

// Direct manipulation: the angle follows the pointer and the release velocity
// is carried into short inertia (never under reduced motion).
export function dragTumble(
  state: TumbleState,
  delta: number,
  radiusPx: number,
  dt: number,
  reduced: boolean,
): TumbleState {
  const step = delta / Math.max(40, radiusPx)
  const span = clamp(dt, 0.008, MAX_STEP)
  const measured = clamp(step / span, -MAX_SPIN, MAX_SPIN)
  return {
    angle: state.angle + step,
    spin: reduced ? 0 : approach(state.spin, measured, span, 0.06),
    sinceScroll: SETTLE_TIME,
  }
}

export const releaseTumble = (
  state: TumbleState,
  reduced: boolean,
): TumbleState => ({
  ...state,
  spin: reduced ? 0 : state.spin,
  sinceScroll: 0,
})

// Touch keeps vertical motion for page scrolling (touch-action: pan-y), so it
// rotates from horizontal motion; mouse and pen use the end-over-end vertical axis.
export const dragAxis = (pointerType: string) =>
  pointerType === 'touch' ? 'x' : 'y'

// On-screen diameter (px) the opening rock fills: at least the full frame
// width, and tall enough on portrait screens that the frame crops its middle.
export function openingDiameter(width: number, height: number) {
  return Math.max(width * 1.02, height * 1.08)
}

// 1 at rest, shrinking as the meteor enters the atmosphere so it stays framed.
export const entryScale = (progress: number) =>
  1 - 0.38 * smooth(0.3, 0.47, progress)

export const wrapAngle = (angle: number) => {
  const turn = Math.PI * 2
  return ((((angle + Math.PI) % turn) + turn) % turn) - Math.PI
}

const KEY_STEP = Math.PI / 12
// Just inside the wrap point so Home reads -180 and End reads 180.
const KEY_END = Math.PI - 1e-4

// Slider keyboard model: relative steps for arrows/Page keys, absolute ends for Home/End.
export function keyRotation(
  key: string,
): { by: number } | { to: number } | null {
  switch (key) {
    case 'ArrowDown':
    case 'ArrowRight':
      return { by: KEY_STEP }
    case 'ArrowUp':
    case 'ArrowLeft':
      return { by: -KEY_STEP }
    case 'PageDown':
      return { by: KEY_STEP * 3 }
    case 'PageUp':
      return { by: -KEY_STEP * 3 }
    case 'Home':
      return { to: -KEY_END }
    case 'End':
      return { to: KEY_END }
    default:
      return null
  }
}
