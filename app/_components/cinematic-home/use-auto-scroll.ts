import { useEffect, useRef, useState, type RefObject } from 'react'
import { aboutReplay, atmosphereStart, filmScrollOffset } from './film-scroll'
import { documentFilmOffset } from './motion'

export function useAutoScroll(
  container: RefObject<HTMLDivElement | null>,
  posts: number,
  projects: number,
) {
  const [playing, setPlaying] = useState(false)
  const button = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!playing) return
    let frame = 0
    let previous = 0
    let position = window.scrollY
    let expected = position
    let speed = 0
    const stop = () => {
      cancelAnimationFrame(frame)
      setPlaying(false)
    }
    const interrupt = (event: Event) => {
      if (
        event.target instanceof Node &&
        button.current?.contains(event.target) &&
        (!(event instanceof KeyboardEvent) ||
          event.key === ' ' ||
          event.key === 'Enter')
      )
        return
      stop()
    }
    const visibility = () => {
      if (document.hidden) stop()
    }
    const manualScroll = () => {
      if (Math.abs(window.scrollY - expected) > 3) stop()
    }
    const tick = (time: number) => {
      const element = container.current
      if (!element) {
        stop()
        return
      }
      const dt = previous ? Math.min((time - previous) / 1000, 0.05) : 0
      previous = time
      const bottom = Math.max(
        0,
        document.documentElement.scrollHeight - innerHeight,
      )
      const reading = element.dataset.mode === 'reading'
      let targetSpeed = innerHeight / 8
      if (!reading) {
        const extra = Number(element.dataset.postsExtra || 0)
        const atmosphere = Number(element.dataset.atmosphereExtra || 0)
        const length = Math.max(
          1,
          element.offsetHeight - innerHeight - extra - atmosphere,
        )
        const cloudDistance = Math.max(0, atmosphere - length * aboutReplay)
        const passageStart = documentFilmOffset(atmosphereStart, length, extra)
        const offset = (progress: number) =>
          filmScrollOffset(progress, length, extra, cloudDistance)
        const stops = [
          { end: offset(0.13), seconds: 16 },
          { end: passageStart, seconds: Math.max(24, posts * 9) },
          { end: passageStart + cloudDistance, seconds: 24 },
          { end: offset(0.455), seconds: 26 },
          { end: offset(0.645), seconds: 20 },
          { end: offset(0.91), seconds: Math.max(28, projects * 8 + 12) },
          { end: bottom - element.offsetTop, seconds: 14 },
        ]
        const local = position - element.offsetTop
        let start = 0
        for (const segment of stops) {
          if (local < segment.end) {
            targetSpeed = (segment.end - start) / segment.seconds
            break
          }
          start = segment.end
        }
      }
      speed += (targetSpeed * 4 - speed) * (1 - Math.exp(-dt / 0.6))
      position = Math.min(bottom, position + speed * dt)
      window.scrollTo({ top: position, behavior: 'instant' })
      expected = window.scrollY
      if (position >= bottom) {
        stop()
        return
      }
      frame = requestAnimationFrame(tick)
    }
    window.addEventListener('pointerdown', interrupt, {
      passive: true,
      capture: true,
    })
    window.addEventListener('touchstart', interrupt, {
      passive: true,
      capture: true,
    })
    window.addEventListener('wheel', stop, { passive: true })
    window.addEventListener('keydown', interrupt, true)
    window.addEventListener('scroll', manualScroll, { passive: true })
    window.addEventListener('resize', stop)
    window.addEventListener('blur', stop)
    document.addEventListener('visibilitychange', visibility)
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointerdown', interrupt, true)
      window.removeEventListener('touchstart', interrupt, true)
      window.removeEventListener('wheel', stop)
      window.removeEventListener('keydown', interrupt, true)
      window.removeEventListener('scroll', manualScroll)
      window.removeEventListener('resize', stop)
      window.removeEventListener('blur', stop)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [playing, container, posts, projects])

  return { playing, button, toggle: () => setPlaying((value) => !value) }
}
