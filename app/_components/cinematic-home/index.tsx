'use client'

import Image from 'next/image'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { useLocale, useTranslations } from 'next-intl'
import {
  FaEnvelope,
  FaHouse,
  FaRegFolderOpen,
  FaRegUser,
  FaSatelliteDish,
} from 'react-icons/fa6'
import { UnstyledLink } from '../next-intl'
import { socialLinks, type EditorialItem } from './content'
import {
  clamp,
  crossingCard,
  filmState,
  helixCard,
  sectionPositions,
} from './motion'
import { keyRotation } from './tumble'
import styles from './style.module.css'

type FilmProps = {
  className?: string
  posts: EditorialItem[]
  transmissions: EditorialItem[]
  projects: EditorialItem[]
}
type SectionName = keyof typeof sectionPositions

function EditorialFrame({
  item,
  active = false,
  style,
  tabIndex,
  spatialId,
}: {
  item: EditorialItem
  active?: boolean
  style?: CSSProperties
  tabIndex?: number
  spatialId?: string
}) {
  return (
    <UnstyledLink
      href={item.href}
      target={item.external ? '_blank' : undefined}
      rel={item.external ? 'noopener noreferrer' : undefined}
      className={styles['frame']}
      data-active={active}
      data-spatial-card={spatialId}
      aria-label={item.title}
      style={style}
      tabIndex={tabIndex}
      onPointerDown={(event) => {
        event.currentTarget.dataset.engaged = 'true'
        window.dispatchEvent(new Event('film-card-input'))
      }}
      onClick={(event) => {
        event.currentTarget.dataset.engaged = 'true'
        window.dispatchEvent(new Event('film-card-input'))
      }}
      onFocus={() => window.dispatchEvent(new Event('film-card-input'))}
      onBlur={(event) => {
        delete event.currentTarget.dataset.engaged
        window.dispatchEvent(new Event('film-card-input'))
      }}
      onPointerEnter={() => window.dispatchEvent(new Event('film-card-input'))}
      onPointerCancel={(event) => {
        delete event.currentTarget.dataset.engaged
        window.dispatchEvent(new Event('film-card-input'))
      }}
      onPointerMove={(event) => {
        if (event.pointerType !== 'mouse') return
        const bounds = event.currentTarget.getBoundingClientRect()
        event.currentTarget.style.setProperty(
          '--pointer-x',
          `${((event.clientX - bounds.left) / bounds.width) * 2 - 1}`,
        )
        window.dispatchEvent(new Event('film-card-input'))
        event.currentTarget.style.setProperty(
          '--pointer-y',
          `${((event.clientY - bounds.top) / bounds.height) * 2 - 1}`,
        )
      }}
      onPointerLeave={(event) => {
        if (
          event.pointerType === 'mouse' &&
          document.activeElement !== event.currentTarget
        )
          delete event.currentTarget.dataset.engaged
        event.currentTarget.style.setProperty('--pointer-x', '0')
        event.currentTarget.style.setProperty('--pointer-y', '0')
        window.dispatchEvent(new Event('film-card-input'))
      }}
    >
      <span className={styles['image']}>
        <Image
          src={item.image}
          alt={item.imageAlt}
          fill
          sizes="(max-width: 700px) 76vw, 28vw"
          unoptimized
        />
      </span>
      <span className={styles['frame-copy']}>
        <strong>{item.title}</strong>
        <span>{item.description}</span>
      </span>
      <span className={styles['frame-diamond']} aria-hidden="true" />
    </UnstyledLink>
  )
}

function Transmissions({
  items,
  reading,
}: {
  items: EditorialItem[]
  reading: boolean
}) {
  const t = useTranslations('Cinema')
  const [index, setIndex] = useState(0)
  const [mobile, setMobile] = useState(false)
  const drag = useRef<{ x: number; y: number; pointer: number } | null>(null)
  const suppressClick = useRef(false)
  const [dragOffset, setDragOffset] = useState(0)
  useEffect(() => {
    const query = matchMedia('(max-width: 700px)')
    const sync = () => setMobile(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])
  const visibleCount = mobile ? 1 : 3
  const maximum = Math.max(0, items.length - visibleCount)
  const current = Math.min(index, maximum)
  const move = (direction: number) =>
    setIndex((value) => clamp(value + direction, 0, maximum))
  const release = (event: PointerEvent) => {
    if (!drag.current || drag.current.pointer !== event.pointerId) return
    const distance = event.clientX - drag.current.x
    suppressClick.current = Math.abs(distance) > 10
    if (Math.abs(distance) > 45) move(distance < 0 ? 1 : -1)
    drag.current = null
    setDragOffset(0)
  }
  return (
    <div
      className={styles['transmission-carousel']}
      aria-roledescription="carousel"
      aria-label={t('transmissions')}
    >
      <button
        className={styles['round-button']}
        aria-label={t('previous')}
        disabled={current === 0}
        onClick={() => move(-1)}
      >
        <span aria-hidden="true">‹</span>
      </button>
      <div
        className={styles['carousel-viewport']}
        onPointerDown={(event) => {
          suppressClick.current = false
          drag.current = {
            x: event.clientX,
            y: event.clientY,
            pointer: event.pointerId,
          }
        }}
        onPointerMove={(event) => {
          if (drag.current && Math.abs(event.clientY - drag.current.y) < 35) {
            if (Math.abs(event.clientX - drag.current.x) > 10)
              event.currentTarget.setPointerCapture(event.pointerId)
            setDragOffset(clamp(event.clientX - drag.current.x, -90, 90))
          }
        }}
        onPointerUp={release}
        onClickCapture={(event) => {
          if (suppressClick.current) {
            event.preventDefault()
            event.stopPropagation()
            suppressClick.current = false
          }
        }}
        onPointerCancel={() => {
          drag.current = null
          setDragOffset(0)
        }}
      >
        <div
          className={styles['carousel-track']}
          style={
            {
              '--carousel-position': `calc(${(-current * 100) / visibleCount}% + ${dragOffset}px)`,
            } as CSSProperties
          }
        >
          {items.map((item, itemIndex) => (
            <div
              key={item.href}
              className={styles['transmission-item']}
              aria-hidden={
                !reading &&
                (itemIndex < current || itemIndex >= current + visibleCount)
              }
              inert={
                !reading &&
                (itemIndex < current || itemIndex >= current + visibleCount)
              }
            >
              <EditorialFrame
                item={item}
                active={itemIndex === current + Math.floor(visibleCount / 2)}
              />
            </div>
          ))}
        </div>
      </div>
      <button
        className={styles['round-button']}
        aria-label={t('next')}
        disabled={current === maximum}
        onClick={() => move(1)}
      >
        <span aria-hidden="true">›</span>
      </button>
      <p className={styles['carousel-status']} aria-live="polite">
        {current + 1} — {Math.min(items.length, current + visibleCount)} /{' '}
        {items.length}
      </p>
    </div>
  )
}

export default function CinematicHome({
  posts,
  transmissions,
  projects,
  className = '',
}: FilmProps) {
  const t = useTranslations('Cinema')
  const about = useTranslations('About')
  const locale = useLocale()
  const container = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const handle = useRef<HTMLDivElement>(null)
  const menuButton = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const [hadWebGL, setHadWebGL] = useState(false)
  const [renderer, setRenderer] = useState('loading')
  const [progress, setProgress] = useState(0)
  const [mobile, setMobile] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [readingSelected, setReadingSelected] = useState(false)
  const reading =
    reduced || readingSelected || (renderer === 'fallback' && !hadWebGL)
  const state = filmState(progress)

  useEffect(() => {
    let disposed = false
    let disposeScene: (() => void) | undefined
    if (!canvas.current || !container.current) return
    const sceneCanvas = canvas.current
    const sceneContainer = container.current
    void import('./scene')
      .then(async ({ createFilmScene }) => {
        if (disposed) return
        disposeScene = await createFilmScene({
          canvas: sceneCanvas,
          container: sceneContainer,
          handle: handle.current,
          posts,
          projects,
          onReady: (ready) => {
            if (disposed) return
            if (ready) setHadWebGL(true)
            setRenderer(ready ? 'webgl' : 'fallback')
          },
        })
        if (disposed) disposeScene?.()
      })
      .catch(() => {
        if (!disposed) setRenderer('fallback')
      })
    return () => {
      disposed = true
      disposeScene?.()
    }
  }, [posts, projects])

  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => {
      setReduced(query.matches)
      setMobile(window.innerWidth < 700)
    }
    let frame = 0
    const scroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        if (!container.current) return
        const distance = container.current.offsetHeight - window.innerHeight
        setProgress(
          clamp(
            (window.scrollY - container.current.offsetTop) /
              Math.max(1, distance),
          ),
        )
      })
    }
    sync()
    scroll()
    window.addEventListener('scroll', scroll, { passive: true })
    window.addEventListener('resize', sync)
    query.addEventListener('change', sync)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', scroll)
      window.removeEventListener('resize', sync)
      query.removeEventListener('change', sync)
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const priorOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    menu.current?.querySelector<HTMLElement>('button, a')?.focus()
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuButton.current?.focus()
      }
      if (event.key !== 'Tab') return
      const controls = Array.from(
        menu.current?.querySelectorAll<HTMLElement>('button, a[href]') || [],
      )
      const first = controls[0]
      const last = controls.at(-1)
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    window.addEventListener('keydown', key)
    return () => {
      document.body.style.overflow = priorOverflow
      window.removeEventListener('keydown', key)
    }
  }, [menuOpen])

  const jump = (name: SectionName) => {
    setMenuOpen(false)
    if (reading)
      document
        .getElementById(`film-${name}`)
        ?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' })
    else if (container.current)
      window.scrollTo({
        top:
          container.current.offsetTop +
          sectionPositions[name] *
            (container.current.offsetHeight - window.innerHeight),
        behavior: 'smooth',
      })
  }
  const visibility = (opacity: number) => ({
    style: { '--section-opacity': reading ? 1 : opacity } as CSSProperties,
    'aria-hidden': !reading && opacity < 0.05,
    inert: !reading && opacity < 0.05,
  })
  const sections: { name: SectionName; label: string; icon: ReactNode }[] = [
    { name: 'arrival', label: t('home'), icon: <FaHouse /> },
    { name: 'posts', label: t('articles'), icon: <FaSatelliteDish /> },
    { name: 'about', label: t('about'), icon: <FaRegUser /> },
    { name: 'portfolio', label: t('portfolio'), icon: <FaRegFolderOpen /> },
    { name: 'contact', label: t('contact'), icon: <FaEnvelope /> },
  ]

  return (
    <div
      ref={container}
      className={`${styles['film']} ${className}`}
      data-renderer={renderer}
      data-mode={reading ? 'reading' : 'cinema'}
      data-progress={progress.toFixed(5)}
    >
      <a
        href="#film-content"
        className={styles['skip-link']}
        onClick={() => setReadingSelected(true)}
      >
        {t('skip')}
      </a>
      <header className={styles['header']}>
        <UnstyledLink
          href="/"
          aria-label="Roe the Dev"
          className={styles['logo']}
        >
          <Image
            src="/logo.svg"
            width={76}
            height={43}
            alt="Roe the Dev"
            priority
          />
        </UnstyledLink>
        <button
          ref={menuButton}
          className={styles['menu-button']}
          aria-label={t('menu')}
          aria-expanded={menuOpen}
          aria-controls="film-menu"
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
      </header>
      <main
        id="film-content"
        className={styles['stage']}
        tabIndex={-1}
        inert={menuOpen}
      >
        <canvas ref={canvas} className={styles['canvas']} aria-hidden="true" />
        <div
          ref={handle}
          className={styles['asteroid-handle']}
          role="slider"
          tabIndex={reading ? -1 : 0}
          hidden
          aria-label={t('rotateAsteroid')}
          aria-orientation="vertical"
          aria-valuemin={-180}
          aria-valuemax={180}
          aria-valuenow={20}
          onKeyDown={(event) => {
            // Guards the gap before the scene attaches its own rotation handler.
            if (
              (keyRotation(event.key) || event.key === ' ') &&
              !event.altKey &&
              !event.ctrlKey &&
              !event.metaKey
            )
              event.preventDefault()
          }}
        />
        {renderer === 'fallback' && (
          <div className={styles['fallback-world']} aria-hidden="true">
            <span className={styles['fallback-rock']} />
            <span className={styles['fallback-horizon']} />
          </div>
        )}
        <div className={styles['film-grain']} aria-hidden="true" />
        <section
          id="film-arrival"
          className={`${styles['section']} ${styles['arrival']}`}
          {...visibility(state.arrivalOpacity)}
          style={
            {
              '--section-opacity': reading ? 1 : state.arrivalOpacity,
              '--copy-opacity': reading ? 1 : state.arrivalCopyOpacity,
            } as CSSProperties
          }
        >
          <div className={styles['divider']} aria-hidden="true">
            <span>◇</span>
          </div>
          <h1>{t('intro')}</h1>
          <p className={styles['scroll-prompt']}>
            {t('scroll')}
            <span aria-hidden="true">↓</span>
          </p>
        </section>
        <section
          id="film-posts"
          className={`${styles['section']} ${styles['posts']}`}
          {...visibility(state.postsOpacity)}
          style={
            {
              ...visibility(state.postsOpacity).style,
              '--rise': reading ? 0 : state.postsRise,
            } as CSSProperties
          }
        >
          <h2 className={styles['section-title']}>{t('featuredPosts')}</h2>
          <div className={styles['spatial-stage']}>
            {posts.map((item, index) => {
              const pose = crossingCard(index, posts.length, progress, mobile)
              return (
                <EditorialFrame
                  key={item.href}
                  item={item}
                  spatialId={`posts-${index}`}
                  active={!reading && pose.active}
                  tabIndex={reading || pose.interactive ? 0 : -1}
                  style={
                    {
                      '--card-x': `calc(var(--post-unit) * ${pose.x})`,
                      '--card-y': `calc(var(--post-unit) * ${pose.y})`,
                      '--card-opacity': pose.opacity,
                    } as CSSProperties
                  }
                />
              )
            })}
          </div>
          <UnstyledLink href="/blog" className={styles['text-link']}>
            {t('allArticles')} ↗
          </UnstyledLink>
        </section>
        <section
          id="film-about"
          className={`${styles['section']} ${styles['about']}`}
          {...visibility(state.aboutOpacity)}
        >
          <h2 className={styles['section-title']}>{t('aboutRoe')}</h2>
          <div className={styles['about-composition']}>
            <div className={styles['about-copy']}>
              <h3>{about('subtitle')}</h3>
              <p>{about('description1')}</p>
              <p className={styles['about-education']}>
                {about('description2')}
              </p>
              <a
                href="https://linkedin.com/in/rardoz"
                target="_blank"
                rel="noopener noreferrer"
                className={styles['line-button']}
              >
                {t('learnMore')} ↗
              </a>
            </div>
            <div className={styles['portrait']}>
              <Image
                src="/roe-profile-pic.png"
                width={500}
                height={500}
                alt="Roe Greene"
              />
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
        </section>
        <section
          id="film-impact"
          className={`${styles['section']} ${styles['impact']}`}
          {...visibility(
            state.progress > 0.455 && state.progress < 0.535 ? 1 : 0,
          )}
          aria-label={t('impact')}
        >
          <p>{t('impactCaption')}</p>
        </section>
        <div
          className={styles['impact-exposure']}
          style={{ opacity: reading || reduced ? 0 : state.flash }}
          aria-hidden="true"
        />
        <section
          id="film-transmissions"
          className={`${styles['section']} ${styles['transmissions']}`}
          {...visibility(state.transmissionsOpacity)}
        >
          <h2 className={styles['section-title']}>{t('transmissions')}</h2>
          <p className={styles['subtitle']}>{t('transmissionCaption')}</p>
          <Transmissions items={transmissions} reading={reading} />
        </section>
        <section
          id="film-portfolio"
          className={`${styles['section']} ${styles['portfolio']}`}
          {...visibility(state.portfolioOpacity)}
        >
          <h2 className={styles['section-title']}>{t('portfolio')}</h2>
          <p className={styles['subtitle']}>{t('portfolioCaption')}</p>
          <div className={`${styles['spatial-stage']} ${styles['helix']}`}>
            {projects.map((item, index) => {
              const pose = helixCard(index, projects.length, progress, mobile)
              return (
                <EditorialFrame
                  key={item.href}
                  item={item}
                  spatialId={`projects-${index}`}
                  active={pose.active}
                  tabIndex={reading || pose.active ? 0 : -1}
                  style={
                    {
                      '--card-x': `${pose.x}vw`,
                      '--card-y': `${pose.y}vh`,
                      '--card-z': `${pose.depth}px`,
                      '--card-angle': `${pose.rotation}deg`,
                      '--card-opacity': pose.opacity,
                      '--card-color': pose.color,
                      '--card-scale': pose.scale,
                    } as CSSProperties
                  }
                />
              )
            })}
          </div>
          <UnstyledLink href="/portfolio" className={styles['text-link']}>
            {t('allProjects')} ↗
          </UnstyledLink>
        </section>
        <footer
          id="film-contact"
          className={`${styles['section']} ${styles['contact']}`}
          {...visibility(state.contactOpacity)}
        >
          <span className={styles['end-mark']} aria-hidden="true">
            ◇
          </span>
          <h2>{t('contactHeading')}</h2>
          <p>{t('contactCaption')}</p>
          <a
            href="mailto:roethedev@gmail.com"
            className={styles['line-button']}
          >
            {t('contactCta')} ↗
          </a>
          <nav className={styles['socials']} aria-label={t('socials')}>
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('mailto') ? undefined : '_blank'}
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <p className={styles['copyright']}>
            © {new Date().getFullYear()} Roe Greene
          </p>
        </footer>
      </main>
      <nav
        className={styles['bottom-nav']}
        aria-label={t('sectionNavigation')}
        inert={menuOpen}
      >
        {sections.map(({ name, label, icon }) => (
          <button key={name} onClick={() => jump(name)} aria-label={label}>
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className={styles['progress-line']} aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>
      {menuOpen && (
        <div
          id="film-menu"
          ref={menu}
          className={styles['menu']}
          role="dialog"
          aria-modal="true"
          aria-label={t('menu')}
        >
          <button
            className={styles['menu-close']}
            onClick={() => {
              setMenuOpen(false)
              menuButton.current?.focus()
            }}
          >
            {t('close')} ×
          </button>
          <span className={styles['menu-eyebrow']}>{t('navigate')}</span>
          {sections.map(({ name, label }, index) => (
            <button
              key={name}
              className={styles['menu-section']}
              onClick={() => jump(name)}
            >
              <span>0{index + 1}</span>
              {label}
            </button>
          ))}
          <div className={styles['menu-routes']}>
            <UnstyledLink href="/blog">{t('allArticles')}</UnstyledLink>
            <UnstyledLink href="/portfolio">{t('allProjects')}</UnstyledLink>
            <UnstyledLink href="/experiment">{t('experiments')}</UnstyledLink>
          </div>
          <button
            className={styles['reading-button']}
            onClick={() => {
              setReadingSelected((value) => !value)
              setMenuOpen(false)
              window.scrollTo({ top: 0, behavior: 'instant' })
            }}
          >
            {readingSelected ? t('cinemaMode') : t('readingMode')}
          </button>
          <UnstyledLink
            href="/"
            locale={locale === 'en-US' ? 'es-US' : 'en-US'}
            className={styles['locale-link']}
          >
            {locale === 'en-US' ? 'Español' : 'English'} ↗
          </UnstyledLink>
        </div>
      )}
    </div>
  )
}
