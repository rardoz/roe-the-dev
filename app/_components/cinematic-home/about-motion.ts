import { clamp, smooth, windowOpacity } from './motion'

export type Point = { x: number; y: number }
export type AboutAsteroidProjection = {
  x: number
  y: number
  width: number
  outline: Point[]
}

export const ABOUT_ASTEROID_EVENT = 'film-about-asteroid'

export function aboutAsteroidState(progress: number) {
  return {
    active: progress > 0.3 && progress < 0.455,
    foreground: windowOpacity(progress, 0.3, 0.335, 0.415, 0.455),
    travel: smooth(0.3, 0.435, progress),
  }
}

export function aboutLensWidth(
  point: Point,
  bounds: { left: number; top: number; right: number; bottom: number },
  mobile: boolean,
) {
  const distance = Math.hypot(
    Math.max(bounds.left - point.x, 0, point.x - bounds.right),
    Math.max(bounds.top - point.y, 0, point.y - bounds.bottom),
  )
  return 100 + ((mobile ? 220 : 360) - 100) * (1 - smooth(0, 80, distance))
}

export function aboutRestPoint(width: number, height: number) {
  return { x: width / 2, y: Math.max(60, height - 160) }
}

export function boundAboutPoint(point: Point, width: number, height: number) {
  return {
    x: clamp(point.x, 50, width - 50),
    y: clamp(point.y, 50, height - 110),
  }
}

export function silhouetteHull(points: Point[]) {
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y)
  const cross = (a: Point, b: Point, c: Point) =>
    (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
  const half = (values: Point[]) => {
    const hull: Point[] = []
    for (const point of values) {
      while (
        hull.length >= 2 &&
        cross(hull[hull.length - 2], hull[hull.length - 1], point) <= 0
      )
        hull.pop()
      hull.push(point)
    }
    return hull.slice(0, -1)
  }
  return [...half(sorted), ...half(sorted.reverse())]
}
