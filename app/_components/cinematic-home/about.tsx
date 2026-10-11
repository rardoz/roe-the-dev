'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useTranslations } from 'next-intl'
import { mix } from './motion'
import {
  ABOUT_ASTEROID_EVENT,
  aboutAsteroidState,
  aboutLensWidth,
  aboutRestPoint,
  boundAboutPoint,
  type AboutAsteroidProjection,
  type Point,
} from './about-motion'
import styles from './style.module.css'

export function AboutRoe({
  progress,
  opacity,
  reading,
  mobile,
  blocked,
}: {
  progress: number
  opacity: number
  reading: boolean
  mobile: boolean
  blocked: boolean
}) {
  const t = useTranslations('Cinema')
  const about = useTranslations('About')
  const section = useRef<HTMLElement>(null)
  const copy = useRef<HTMLDivElement>(null)
  const alternate = useRef<HTMLDivElement>(null)
  const heading = useRef<HTMLSpanElement>(null)
  const headingAlternate = useRef<HTMLSpanElement>(null)
  const photo = useRef<HTMLDivElement>(null)
  const photoAlternate = useRef<HTMLDivElement>(null)
  const lens = useRef<HTMLButtonElement>(null)
  const silhouette = useRef<HTMLDivElement>(null)
  const projection = useRef<AboutAsteroidProjection | null>(null)
  const target = useRef<Point | null>(null)
  const pointer = useRef<number | null>(null)
  const phase = useRef(aboutAsteroidState(progress))
  const [showAlternate, setShowAlternate] = useState(false)
  const active = !reading && !blocked && aboutAsteroidState(progress).active

  useEffect(() => {
    phase.current = aboutAsteroidState(progress)
  }, [progress])

  useEffect(() => {
    const root = section.current?.closest<HTMLElement>('[data-mode]')
    if (!root || !active) return
    const control = lens.current
    root.dataset.aboutControl = 'true'
    let frame = 0
    let lastTime = 0
    let position: Point | null = null
    let diameter = 100
    const project = (event: Event) => {
      projection.current = (
        event as CustomEvent<AboutAsteroidProjection>
      ).detail
    }
    const move = (event: globalThis.PointerEvent) => {
      if (mobile || event.pointerType !== 'mouse') return
      target.current = boundAboutPoint(
        { x: event.clientX, y: event.clientY },
        window.innerWidth,
        window.innerHeight,
      )
    }
    const reset = () => {
      const id = pointer.current
      pointer.current = null
      target.current = null
      if (id !== null && control?.hasPointerCapture(id))
        control.releasePointerCapture(id)
    }
    const draw = (now: number) => {
      const rock = projection.current
      const stage = section.current?.getBoundingClientRect()
      const text = copy.current?.getBoundingClientRect()
      const title = heading.current?.getBoundingClientRect()
      const picture = photo.current?.getBoundingClientRect()
      if (
        rock &&
        stage &&
        text &&
        title &&
        picture &&
        lens.current &&
        silhouette.current &&
        alternate.current &&
        headingAlternate.current &&
        photoAlternate.current
      ) {
        const destination =
          target.current || aboutRestPoint(stage.width, stage.height)
        const attraction =
          1 - Math.exp(-Math.min(0.05, (now - lastTime) / 1000) / 0.12)
        position ||= destination
        position = {
          x: mix(position.x, destination.x, attraction),
          y: mix(position.y, destination.y, attraction),
        }
        const center = position
        const foreground = phase.current.foreground
        const x = mix(rock.x, position.x, foreground)
        const y = mix(rock.y, position.y, foreground)
        diameter = mix(
          diameter,
          target.current
            ? Math.max(
                ...[title, text, picture].map((bounds) =>
                  aboutLensWidth(
                    center,
                    bounds,
                    mobile || pointer.current !== null,
                  ),
                ),
              )
            : 100,
          attraction,
        )
        const width = mix(rock.width, diameter, foreground)
        root.dataset.aboutX = `${x}`
        root.dataset.aboutY = `${y}`
        root.dataset.aboutWidth = `${width}`
        const polygon = (left: number, top: number) =>
          `polygon(${rock.outline.map((point) => `${x + point.x * width - left}px ${y + point.y * width - top}px`).join(',')})`
        silhouette.current.style.clipPath = polygon(stage.left, stage.top)
        silhouette.current.style.opacity = `${foreground}`
        alternate.current.style.clipPath = polygon(text.left, text.top)
        headingAlternate.current.style.clipPath = polygon(title.left, title.top)
        photoAlternate.current.style.clipPath = polygon(
          picture.left,
          picture.top,
        )
        section.current?.style.setProperty(
          '--lens-opacity',
          `${target.current ? foreground : 0}`,
        )
        lens.current.style.left = `${x - stage.left - 50}px`
        lens.current.style.top = `${y - stage.top - 50}px`
        lens.current.style.opacity = `${foreground}`
        lens.current.dataset.width = width.toFixed(1)
      }
      lastTime = now
      frame = requestAnimationFrame(draw)
    }
    root.addEventListener(ABOUT_ASTEROID_EVENT, project)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('blur', reset)
    document.addEventListener('visibilitychange', reset)
    frame = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(frame)
      root.removeEventListener(ABOUT_ASTEROID_EVENT, project)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('blur', reset)
      document.removeEventListener('visibilitychange', reset)
      reset()
      projection.current = null
      delete root.dataset.aboutControl
      delete root.dataset.aboutX
      delete root.dataset.aboutY
      delete root.dataset.aboutWidth
    }
  }, [active, mobile])

  const release = () => {
    const id = pointer.current
    pointer.current = null
    target.current = null
    if (id !== null && lens.current?.hasPointerCapture(id))
      lens.current.releasePointerCapture(id)
  }
  const revealed = showAlternate && (reading || active)
  return (
    <section
      ref={section}
      id="film-about"
      className={`${styles['section']} ${styles['about']}`}
      style={
        {
          '--section-opacity': reading ? 1 : opacity,
          '--about-rise': `${reading ? 0 : mix(80, -40, aboutAsteroidState(progress).travel)}px`,
        } as CSSProperties
      }
      aria-hidden={!reading && opacity < 0.05}
      inert={blocked || (!reading && opacity < 0.05)}
      data-alternate={revealed}
    >
      <div className={styles['about-composition']}>
        <div className={styles['about-copy']}>
          <h2 className={styles['section-title']}>
            <span ref={heading} className={styles['about-heading']}>
              <span>{t('aboutRoe')}</span>
              <span
                ref={headingAlternate}
                className={styles['about-alternate']}
                aria-hidden="true"
                data-testid="about-heading-alternate"
                style={{ clipPath: 'inset(100%)' }}
              >
                {t('aboutHiddenHeading')}
              </span>
            </span>
          </h2>
          <div ref={copy} className={styles['about-biography']}>
            <div className={styles['about-primary']} aria-hidden={revealed}>
              <h3>{about('subtitle')}</h3>
              <p>{about('description1')}</p>
              <p className={styles['about-education']}>
                {about('description2')}
              </p>
            </div>
            <div
              ref={alternate}
              className={styles['about-alternate']}
              aria-hidden={!revealed}
              style={{ clipPath: 'inset(100%)' }}
            >
              <h3>{t('aboutHiddenTitle')}</h3>
              <p>{t('aboutHiddenBody')}</p>
              <p className={styles['about-education']}>
                {t('aboutHiddenFootnote')}
              </p>
            </div>
          </div>
          <a
            href="https://linkedin.com/in/rardoz"
            target="_blank"
            rel="noopener noreferrer"
            className={styles['about-link']}
          >
            {t('learnMore')} <span aria-hidden="true">↗</span>
          </a>
          <span id="about-reveal-help" hidden>
            {t('aboutRevealKeyboardHint')}
          </span>
          {reading && (
            <button
              type="button"
              className={styles['about-reveal-button']}
              aria-pressed={revealed}
              onClick={() => setShowAlternate((value) => !value)}
            >
              {t('aboutReveal')}
            </button>
          )}
        </div>
        <div className={styles['portrait']}>
          <div ref={photo} className={styles['about-photo']}>
            <Image
              src="/roe-profile-pic.png"
              width={500}
              height={500}
              sizes="(max-width: 699px) 130px, (max-width: 1000px) 240px, 320px"
              alt="Roe Greene"
            />
            <div
              ref={photoAlternate}
              className={`${styles['about-alternate']} ${styles['about-photo-alternate']}`}
              aria-hidden="true"
              data-testid="about-photo-alternate"
              style={{ clipPath: 'inset(100%)' }}
            >
              <Image
                src="/roe-alt.jpeg"
                width={400}
                height={400}
                sizes="(max-width: 699px) 130px, (max-width: 1000px) 240px, 320px"
                alt=""
              />
            </div>
          </div>
          <span className={styles['frame-diamond']} aria-hidden="true" />
          <span
            className={`${styles['frame-diamond']} ${styles['side-diamond']}`}
            data-side="left"
            aria-hidden="true"
          />
          <span
            className={`${styles['frame-diamond']} ${styles['side-diamond']}`}
            data-side="right"
            aria-hidden="true"
          />
        </div>
      </div>
      {active && (
        <>
          <div
            ref={silhouette}
            className={styles['about-silhouette']}
            aria-hidden="true"
          />
          <button
            ref={lens}
            type="button"
            className={styles['about-asteroid']}
            aria-label={t('aboutReveal')}
            aria-describedby="about-reveal-help"
            aria-pressed={revealed}
            onPointerDown={(event) => {
              if (
                event.pointerType === 'mouse' ||
                event.button !== 0 ||
                !event.isPrimary
              )
                return
              pointer.current = event.pointerId
              event.currentTarget.setPointerCapture(event.pointerId)
              target.current = { x: event.clientX, y: event.clientY }
            }}
            onPointerMove={(event) => {
              if (pointer.current !== event.pointerId) return
              target.current = boundAboutPoint(
                { x: event.clientX, y: event.clientY },
                window.innerWidth,
                window.innerHeight,
              )
            }}
            onPointerUp={release}
            onPointerCancel={release}
            onLostPointerCapture={release}
            onClick={(event) => {
              if (event.detail === 0) setShowAlternate((value) => !value)
            }}
            onKeyDown={(event) => {
              const steps: Record<string, Point> = {
                ArrowLeft: { x: -32, y: 0 },
                ArrowRight: { x: 32, y: 0 },
                ArrowUp: { x: 0, y: -32 },
                ArrowDown: { x: 0, y: 32 },
              }
              if (event.key === 'Escape') {
                release()
                setShowAlternate(false)
                return
              }
              const step = steps[event.key]
              if (!step || event.altKey || event.ctrlKey || event.metaKey)
                return
              event.preventDefault()
              const point =
                target.current ||
                aboutRestPoint(window.innerWidth, window.innerHeight)
              target.current = boundAboutPoint(
                { x: point.x + step.x, y: point.y + step.y },
                window.innerWidth,
                window.innerHeight,
              )
            }}
          />
        </>
      )}
    </section>
  )
}
