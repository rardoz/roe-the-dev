import {
  IDLE_SPIN,
  MAX_SPIN,
  createTumble,
  dragAxis,
  dragTumble,
  entryScale,
  keyRotation,
  openingDiameter,
  releaseTumble,
  stepTumble,
  wrapAngle,
} from './tumble'

const run = (
  seconds: number,
  fps: number,
  input: { scrollSpeed: number; reduced?: boolean; dragging?: boolean },
) => {
  let state = createTumble()
  for (let i = 0; i < seconds * fps; i++)
    state = stepTumble(state, {
      dt: 1 / fps,
      reduced: false,
      dragging: false,
      ...input,
    })
  return state
}

describe('opening asteroid tumble', () => {
  it('auto-rotates end over end while idle and converges to the idle rate', () => {
    const start = createTumble()
    const state = run(3, 60, { scrollSpeed: 0 })
    expect(state.angle).toBeLessThan(start.angle + IDLE_SPIN * 2)
    expect(state.spin).toBeCloseTo(IDLE_SPIN, 2)
  })

  it('is stable across frame rates', () => {
    const slow = run(2, 30, { scrollSpeed: 0 })
    const fast = run(2, 120, { scrollSpeed: 0 })
    expect(slow.angle).toBeCloseTo(fast.angle, 1)
  })

  it('never advances more than a bounded step for long frames', () => {
    const state = stepTumble(createTumble(), {
      dt: 5,
      scrollSpeed: 0,
      reduced: false,
      dragging: false,
    })
    expect(Math.abs(state.angle - createTumble().angle)).toBeLessThan(0.05)
  })

  it('follows scroll direction and velocity, suppressing idle spin while scrolling', () => {
    const down = run(1, 60, { scrollSpeed: 1 })
    const up = run(1, 60, { scrollSpeed: -1 })
    const fast = run(1, 60, { scrollSpeed: 2 })
    expect(down.spin).toBeLessThan(0)
    expect(up.spin).toBeGreaterThan(0)
    expect(fast.spin).toBeLessThan(down.spin)
    expect(run(1, 60, { scrollSpeed: 50 }).spin).toBeLessThanOrEqual(MAX_SPIN)
  })

  it('does not animate or coast under reduced motion', () => {
    const idle = run(2, 60, { scrollSpeed: 0, reduced: true })
    expect(idle.angle).toBe(createTumble().angle)
    expect(idle.spin).toBe(0)
    expect(run(2, 60, { scrollSpeed: 3, reduced: true }).spin).toBe(0)
    const dragged = dragTumble(createTumble(), 80, 200, 0.016, true)
    expect(dragged.angle).toBeGreaterThan(createTumble().angle)
    expect(releaseTumble(dragged, true).spin).toBe(0)
  })

  it('rotates directly with a drag, holds still while dragging, and then resumes idle', () => {
    const base = createTumble()
    expect(dragTumble(base, 100, 200, 0.016, false).angle).toBeCloseTo(
      base.angle + 0.5,
    )
    expect(dragTumble(base, -100, 200, 0.016, false).angle).toBeLessThan(
      base.angle,
    )
    const held = stepTumble(base, {
      dt: 0.016,
      scrollSpeed: 0,
      reduced: false,
      dragging: true,
    })
    expect(held.angle).toBe(base.angle)
    let state = releaseTumble(dragTumble(base, 100, 200, 0.016, false), false)
    for (let i = 0; i < 360; i++)
      state = stepTumble(state, {
        dt: 1 / 60,
        scrollSpeed: 0,
        reduced: false,
        dragging: false,
      })
    expect(state.spin).toBeCloseTo(IDLE_SPIN, 2)
  })

  it('keeps touch vertical for page scrolling and sizes the rock for both viewports', () => {
    expect(dragAxis('touch')).toBe('x')
    expect(dragAxis('mouse')).toBe('y')
    expect(openingDiameter(1440, 900)).toBeCloseTo(1468.8)
    expect(openingDiameter(390, 844)).toBeCloseTo(911.52)
    expect(IDLE_SPIN).toBeCloseTo(-0.42 / 8)
    expect(entryScale(0)).toBe(1)
    expect(entryScale(0.47)).toBeLessThan(1)
    expect(entryScale(0.47)).toBeGreaterThan(0.5)
    expect(wrapAngle(Math.PI * 3)).toBeCloseTo(-Math.PI)
  })

  it('maps every slider key to rotation so none can scroll the page', () => {
    for (const key of ['ArrowDown', 'ArrowRight', 'PageDown'])
      expect(keyRotation(key)).toEqual({ by: expect.any(Number) })
    expect((keyRotation('ArrowDown') as { by: number }).by).toBeGreaterThan(0)
    expect((keyRotation('ArrowUp') as { by: number }).by).toBeLessThan(0)
    expect(keyRotation('Home')).toEqual({ to: expect.closeTo(-Math.PI, 3) })
    expect(keyRotation('End')).toEqual({ to: expect.closeTo(Math.PI, 3) })
    expect(keyRotation('Tab')).toBeNull()
  })
})
