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
  POST_FRAME,
  crossingCard,
  documentFilmOffset,
  documentFilmProgress,
  filmState,
  helixCard,
  mobilePostWidth,
  postRow,
  postsHeadingOffset,
  postsStacked,
  sectionPositions,
} from './motion'
import { keyRotation } from './tumble'
import { useAmbientSound } from './ambient-audio'
import { SoundIcon } from './sound-icon'
import { headingInkBottom } from './heading'
import { editorialFramePath } from './post-frame'
import { AboutRoe } from './about'
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
  hidden = false,
}: {
  item: EditorialItem
  active?: boolean
  style?: CSSProperties
  tabIndex?: number
  spatialId?: string
  hidden?: boolean
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
      aria-hidden={hidden}
      inert={hidden}
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
      {spatialId?.startsWith('posts-') && (
        <svg
          className={styles['post-ornament']}
          viewBox="-.589 -.675 1.178 1.35"
          aria-hidden="true"
        >
          <path
            d={editorialFramePath()}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M-.45 .53125H.31875M.3675 .5375L.41375 .49125V.525M.41375 .49125H.37875"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
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
  const locale = useLocale()
  const { isPlaying, toggle } = useAmbientSound()
  const container = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const handle = useRef<HTMLDivElement>(null)
  const menuButton = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const [hadWebGL, setHadWebGL] = useState(false)
  const [renderer, setRenderer] = useState('loading')
  const [progress, setProgress] = useState(0)
  const [mobile, setMobile] = useState(false)
  const [viewportWidth, setViewportWidth] = useState(1440)
  const [reduced, setReduced] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [readingSelected, setReadingSelected] = useState(false)
  const [postsExtra, setPostsExtra] = useState(0)
  const [postsTop, setPostsTop] = useState(0)
  const [mobileEntries, setMobileEntries] = useState<number[]>([])
  const reading =
    reduced || readingSelected || (renderer === 'fallback' && !hadWebGL)
  const state = filmState(progress)
  const postsStack = postsStacked(viewportWidth)
  useEffect(() => {
    if (postsStack || reading || renderer === 'webgl') return
    const section = container.current?.querySelector<HTMLElement>('#film-posts')
    const heading = section?.querySelector<HTMLElement>('h2')
    const card = section?.querySelector<HTMLElement>('[data-spatial-card]')
    if (!heading || !card) return
    heading.style.setProperty(
      '--posts-heading-offset',
      `${postsHeadingOffset(card.getBoundingClientRect().top - 11, heading.offsetTop, headingInkBottom(heading))}px`,
    )
  }, [postsStack, reading, renderer, progress, viewportWidth])

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
      setViewportWidth(window.innerWidth)
      scroll()
    }
    let frame = 0
    const scroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        if (!container.current) return
        const section =
          container.current.querySelector<HTMLElement>('#film-posts')
        const extra = postsStack && !reading ? postsExtra : 0
        const distance =
          container.current.offsetHeight - window.innerHeight - extra
        setPostsTop(distance * 0.14)
        setProgress(
          documentFilmProgress(
            window.scrollY - container.current.offsetTop,
            distance,
            extra,
          ),
        )
        if (postsStack && !reading && section) {
          const cards = section.querySelectorAll<HTMLElement>(
            '[data-spatial-card]',
          )
          setMobileEntries(
            Array.from(cards, (card) =>
              clamp(
                (window.innerHeight * 0.8 -
                  (section.offsetTop +
                    card.offsetTop +
                    ((card.offsetParent as HTMLElement | null)?.offsetTop ||
                      0) +
                    container.current!.offsetTop -
                    window.scrollY)) /
                  (window.innerHeight * 0.5),
              ),
            ),
          )
          const needed = Math.max(
            0,
            section.offsetHeight + 100 - distance * 0.175,
          )
          if (Math.abs(needed - extra) > 1) setPostsExtra(needed)
        }
      })
    }
    sync()
    scroll()
    window.addEventListener('scroll', scroll, { passive: true })
    window.addEventListener('resize', sync)
    const observer = new ResizeObserver(scroll)
    if (container.current) observer.observe(container.current)
    const postsSection = container.current?.querySelector('#film-posts')
    if (postsSection) observer.observe(postsSection)
    query.addEventListener('change', sync)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', scroll)
      window.removeEventListener('resize', sync)
      query.removeEventListener('change', sync)
      observer.disconnect()
    }
  }, [postsStack, reading, postsExtra])

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
          documentFilmOffset(
            postsStack && name === 'posts' ? 0.14 : sectionPositions[name],
            container.current.offsetHeight -
              window.innerHeight -
              (postsStack && !reading ? postsExtra : 0),
            postsStack && !reading ? postsExtra : 0,
          ),
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

  const postsSection = (
    <section
      id="film-posts"
      data-document={postsStack && !reading}
      inert={menuOpen}
      className={`${styles['section']} ${styles['posts']}`}
      {...(postsStack && !reading ? {} : visibility(state.postsOpacity))}
      style={
        {
          '--section-opacity': reading || postsStack ? 1 : state.postsOpacity,
          '--rise': reading || postsStack ? 0 : state.postsRise,
          '--post-outer-width': `${mobilePostWidth(viewportWidth)}px`,
        } as CSSProperties
      }
    >
      <h2 className={styles['section-title']}>
        <span data-heading-label>
          {t('featuredPosts')}
          <span data-heading-baseline aria-hidden="true" />
        </span>
      </h2>
      <div
        className={styles['spatial-stage']}
        style={
          {
            '--post-unit': `${postRow(viewportWidth, posts.length).unit}px`,
          } as CSSProperties
        }
      >
        {posts.map((item, index) => {
          const pose = crossingCard(
            index,
            posts.length,
            progress,
            postsStack,
            postsStack
              ? undefined
              : viewportWidth / 2 / postRow(viewportWidth, posts.length).unit +
                  POST_FRAME.width / 2 +
                  0.15,
          )
          pose.x +=
            (index - (posts.length - 1) / 2) *
            (postRow(viewportWidth, posts.length).pitch - 1.4) *
            1
          const entry = mobileEntries[index] || 0
          const settled = reading || (postsStack ? entry === 1 : pose.active)
          return (
            <EditorialFrame
              key={item.href}
              item={item}
              spatialId={`posts-${index}`}
              active={settled}
              hidden={!reading && !postsStack && pose.opacity === 0}
              tabIndex={reading || postsStack || pose.interactive ? 0 : -1}
              style={
                {
                  '--card-x': postsStack
                    ? `${(index % 2 ? 1 : -1) * (1 - entry) * 100}vw`
                    : `calc(var(--post-unit) * ${pose.x})`,
                  '--card-y': postsStack
                    ? `${(1 - entry) * 70}px`
                    : `calc(var(--post-unit) * ${pose.y})`,
                  '--card-opacity': reading || postsStack ? 1 : pose.opacity,
                  '--card-scale': postsStack ? 1 : pose.scale,
                  visibility:
                    !reading && !postsStack && pose.opacity === 0
                      ? 'hidden'
                      : 'visible',
                  pointerEvents:
                    reading || postsStack || pose.interactive ? 'auto' : 'none',
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
  )

  return (
    <div
      ref={container}
      className={`${styles['film']} ${className}`}
      data-renderer={renderer}
      data-mode={reading ? 'reading' : 'cinema'}
      data-progress={progress.toFixed(5)}
      data-posts-document={postsStack && !reading}
      data-posts-extra={postsStack && !reading ? postsExtra : 0}
      style={
        {
          '--posts-extra': `${postsStack && !reading ? postsExtra : 0}px`,
          '--posts-top': `${postsTop}px`,
        } as CSSProperties
      }
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
        <div className={styles['header-controls']}>
          <button
            type="button"
            className={styles['sound-button']}
            aria-label={t('sound')}
            aria-pressed={isPlaying}
            onClick={toggle}
          >
            <SoundIcon />
          </button>
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
        </div>
      </header>
      <main id="film-content" tabIndex={-1} inert={menuOpen}>
        {postsStack && !reading && postsSection}
        <div
          key="film-stage"
          data-film-stage
          className={styles['stage']}
          tabIndex={-1}
          inert={menuOpen}
        >
          <canvas
            ref={canvas}
            className={styles['canvas']}
            aria-hidden="true"
          />
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
          {(!postsStack || reading) && postsSection}
          <AboutRoe
            progress={progress}
            opacity={state.aboutOpacity}
            reading={reading}
            mobile={mobile}
            blocked={menuOpen}
          />
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
        </div>
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
