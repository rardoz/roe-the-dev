import { useCallback, useEffect, useRef, useState } from 'react'

export const AMBIENT_AUDIO_SRC = '/the-void.mp3'
export const AMBIENT_AUDIO_VOLUME = 0.75
export const AMBIENT_AUDIO_FADE_MS = 2000
export const AMBIENT_AUDIO_FADE_OUT_MS = 500
export const AMBIENT_SOUND_STORAGE_KEY = 'roe-sound'

export function useAmbientSound(
  src = AMBIENT_AUDIO_SRC,
  volume = AMBIENT_AUDIO_VOLUME,
  fadeMs = AMBIENT_AUDIO_FADE_MS,
) {
  const [isPlaying, setIsPlaying] = useState(false)
  const control = useRef<(() => void) | null>(null)
  const toggle = useCallback(() => control.current?.(), [])

  useEffect(() => {
    const audio = new Audio()
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = 0
    audio.src = src
    let active = true
    let frame = 0
    let revision = 0
    let desired = true
    try {
      desired = localStorage.getItem(AMBIENT_SOUND_STORAGE_KEY) !== 'off'
    } catch {}

    const cancelFade = () => {
      revision += 1
      cancelAnimationFrame(frame)
    }

    const fade = (target: number, duration: number, done?: () => void) => {
      const currentRevision = revision
      const initial = audio.volume
      let start: number | undefined
      const step = (time: number) => {
        if (!active || currentRevision !== revision) return
        start ??= time
        const ratio = duration > 0 ? Math.min((time - start) / duration, 1) : 1
        audio.volume = initial + (target - initial) * ratio
        if (ratio < 1) frame = requestAnimationFrame(step)
        else done?.()
      }
      frame = requestAnimationFrame(step)
    }

    const stopped = () => {
      if (!active) return
      desired = false
      cancelFade()
      setIsPlaying(false)
    }
    const paused = () => {
      if (audio.paused) stopped()
    }
    audio.addEventListener('pause', paused)
    audio.addEventListener('ended', stopped)
    audio.addEventListener('error', stopped)

    const startPlayback = () => {
      cancelFade()
      audio.volume = 0
      const currentRevision = revision
      const failed = () => {
        if (active && currentRevision === revision) stopped()
      }
      try {
        audio.play().then(() => {
          if (!active || !desired || currentRevision !== revision) return
          setIsPlaying(true)
          fade(volume, fadeMs)
        }, failed)
      } catch {
        failed()
      }
    }

    control.current = () => {
      desired = !desired
      try {
        localStorage.setItem(AMBIENT_SOUND_STORAGE_KEY, desired ? 'on' : 'off')
      } catch {}
      if (desired) startPlayback()
      else {
        cancelFade()
        setIsPlaying(false)
        fade(0, AMBIENT_AUDIO_FADE_OUT_MS, () => audio.pause())
      }
    }

    queueMicrotask(() => {
      if (active && desired) startPlayback()
    })

    return () => {
      active = false
      control.current = null
      cancelFade()
      audio.removeEventListener('pause', paused)
      audio.removeEventListener('ended', stopped)
      audio.removeEventListener('error', stopped)
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    }
  }, [src, volume, fadeMs])

  return { isPlaying, toggle }
}
