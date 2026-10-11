import { useEffect } from 'react'

export const AMBIENT_AUDIO_SRC = '/the-void.mp3'
export const AMBIENT_AUDIO_VOLUME = 0.75
export const AMBIENT_AUDIO_FADE_MS = 2000

export function useLoopingAmbientAudio(
  src = AMBIENT_AUDIO_SRC,
  volume = AMBIENT_AUDIO_VOLUME,
  fadeMs = AMBIENT_AUDIO_FADE_MS,
) {
  useEffect(() => {
    const audio = new Audio()
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = 0
    audio.src = src
    let active = true
    let frame = 0

    const fadeIn = () => {
      let start: number | undefined
      const step = (time: number) => {
        if (!active) return
        start ??= time
        const ratio = Math.min((time - start) / fadeMs, 1)
        audio.volume = volume * ratio
        if (ratio < 1) frame = requestAnimationFrame(step)
      }
      frame = requestAnimationFrame(step)
    }

    queueMicrotask(() => {
      if (!active) return
      audio.play().then(
        () => {
          if (active) fadeIn()
        },
        () => {},
      )
    })

    return () => {
      active = false
      cancelAnimationFrame(frame)
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    }
  }, [src, volume, fadeMs])
}
