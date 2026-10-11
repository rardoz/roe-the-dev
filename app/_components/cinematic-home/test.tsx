import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { StrictMode } from 'react'
import CinematicHome from './index'
import { createFilmScene } from './scene'
import { headingInkBottom } from './heading'
import { advancePlanetClouds, planetFragment, planetMapWidth } from './planet'

jest.mock('three', () => ({}))
import {
  editorialFrameLines,
  editorialFramePath,
  POST_ORNAMENT,
} from './post-frame'
import { editorialItems, type EditorialItem } from './content'
import {
  POST_FRAME,
  documentFilmOffset,
  documentFilmProgress,
  filmState,
  helixCard,
  mobilePostWidth,
  postRow,
  postsPose,
  postsHeadingOffset,
  postsStacked,
  smooth,
} from './motion'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    <span data-src={src} role="img" aria-label={alt} />
  ),
}))
jest.mock('../next-intl', () => ({
  UnstyledLink: ({
    locale: _locale,
    ...props
  }: React.ComponentProps<'a'> & { locale?: string }) => <a {...props} />,
}))
jest.mock('next-intl', () => ({
  useLocale: () => 'en-US',
  useTranslations: () => (key: string) => key,
}))
jest.mock('./scene', () => ({
  createFilmScene: jest.fn(
    async ({ onReady }: { onReady: (ready: boolean) => void }) => {
      onReady(false)
      return jest.fn()
    },
  ),
}))

const items: EditorialItem[] = Array.from({ length: 5 }, (_, index) => ({
  title: `Actual item ${index + 1}`,
  description: `Description ${index + 1}`,
  href: `/portfolio/project-${index + 1}`,
  image: `/project-${index + 1}.png`,
  imageAlt: `Project ${index + 1}`,
  external: false,
}))

beforeEach(() => {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: 1024,
  })
  window.matchMedia = jest.fn().mockImplementation(() => ({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }))
  window.scrollTo = jest.fn()
  Element.prototype.scrollIntoView = jest.fn()
  global.ResizeObserver = class {
    observe() {}
    disconnect() {}
    unobserve() {}
  }
  jest
    .spyOn(HTMLMediaElement.prototype, 'play')
    .mockImplementation(() => Promise.resolve())
  jest.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  jest.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {})
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('continuous scroll film', () => {
  it('drifts cloud formations slowly and freezes their phase with reduced motion', () => {
    expect(advancePlanetClouds(0, 5, false)).toBeCloseTo(0.06)
    expect(advancePlanetClouds(0.7, 5, true)).toBe(0.7)
    expect(advancePlanetClouds(0.7, 0, false)).toBe(0.7)
    const stepped = Array.from({ length: 100 }).reduce<number>(
      (phase) => advancePlanetClouds(phase, 0.05, false),
      0,
    )
    expect(stepped).toBeCloseTo(advancePlanetClouds(0, 5, false))
    expect(advancePlanetClouds(Math.PI * 2 - 0.01, 1, false)).toBeCloseTo(0.002)
  })

  it('selects bounded map sizes and desaturates painted values without tone mapping', () => {
    expect(planetMapWidth(390, 3)).toBe(2048)
    expect(planetMapWidth(1440, 2)).toBe(4096)
    expect(planetMapWidth(1440, 1)).toBe(4096)
    expect(planetFragment).toContain('dot(paint.rgb,vec3(.2126,.7152,.0722))')
    expect(planetFragment).toContain('mix(.025,pow(grey,1.18)*.9,paint.a)')
    expect(planetFragment).toContain(
      'texture2D(uMap,(vUv+vec2(cloudLongitudeOffset+uCloudDrift/6.28318530718,0.))*uCloudRepeat)',
    )
    expect(planetFragment).not.toMatch(/projectClouds|cloudTile|textureGrad/)
    expect(planetFragment).not.toMatch(
      /stormDensity|horizonFade|tonemapping_fragment/,
    )
  })

  it('anchors to glyph ink rather than the linebox whitespace', () => {
    const heading = document.createElement('h2')
    heading.innerHTML =
      '<span data-heading-label>FEATURED POSTS<span data-heading-baseline></span></span>'
    jest
      .spyOn(heading, 'getBoundingClientRect')
      .mockReturnValue({ top: 100 } as DOMRect)
    jest
      .spyOn(
        heading.querySelector<HTMLElement>('[data-heading-baseline]')!,
        'getBoundingClientRect',
      )
      .mockReturnValue({ top: 140 } as DOMRect)
    const ctx = document.createElement('canvas').getContext('2d')!
    const descent = ctx.measureText('FEATURED POSTS').actualBoundingBoxDescent
    const ink = headingInkBottom(heading)
    expect(ink).toBeCloseTo(40 + descent)
    const offset = postsHeadingOffset(280, 100, ink)
    expect(280 - (100 + offset + ink)).toBeCloseTo(100)
  })
  it('keeps bright city geometry out of the posts backdrop and restores it for About', () => {
    for (const progress of [0, 0.12, 0.14, 0.17625, 0.2125, 0.24875, 0.314])
      expect(filmState(progress).postsBackdropClear).toBe(false)
    for (const progress of [0.315, 0.335, 0.36, 0.49, 0.68, 1])
      expect(filmState(progress).postsBackdropClear).toBe(true)
  })

  it('keeps the impact bounded and reverses to the same state at the same scroll position', () => {
    const forward = [0.3, 0.46, 0.49, 0.54, 0.9].map(filmState)
    const reverse = [0.9, 0.54, 0.49, 0.46, 0.3].map(filmState).reverse()
    expect(reverse).toEqual(forward)
    expect(filmState(-2).impact).toBe(0)
    expect(filmState(3).impact).toBe(1)
    expect(filmState(0.49).flash).toBeLessThanOrEqual(0.65)
    expect(filmState(0.6).flash).toBeLessThan(0.001)
  })

  it('fits the mobile ornamental footprint and balanced desktop row gaps', () => {
    expect(mobilePostWidth(390)).toBe(350)
    for (const width of [700, 1024, 1440, 1920])
      for (const count of [1, 2, 3, 5]) {
        const row = postRow(width, count)
        expect(
          row.unit * (POST_FRAME.width + 0.08) * count + row.gap * (count - 1),
        ).toBeLessThanOrEqual(width - 112 + 1e-6)
        expect(
          row.pitch * row.unit - row.unit * (POST_FRAME.width + 0.08),
        ).toBeCloseTo(28)
      }
  })

  it('uses the Posts-only stack boundary and the approved reference footprint', () => {
    for (const width of [699, 700, 701, 999, 1000, 1001]) {
      expect(postsStacked(width)).toBe(width <= 1000)
      expect(mobilePostWidth(width)).toBe(Math.min(width - 40, 421.96757))
    }
  })

  it('shares desktop ornament geometry with stacked SVG and caps outer widths', () => {
    expect(mobilePostWidth(390)).toBe(350)
    expect(mobilePostWidth(700)).toBe(421.96757)
    expect(mobilePostWidth(974)).toBe(421.96757)
    const lines = editorialFrameLines()
    expect(lines.length % 6).toBe(0)
    expect(editorialFramePath().match(/M/g)).toHaveLength(lines.length / 6)
    expect(Math.max(...lines.filter((_, i) => i % 3 === 1))).toBe(
      POST_ORNAMENT.height / 2,
    )
    expect(Math.max(...lines.filter((_, i) => i % 3 === 0))).toBeCloseTo(
      POST_ORNAMENT.width / 2,
    )
  })

  it('accumulates entered posts without subsequent departures', () => {
    for (const mobile of [false, true])
      for (const count of [1, 2, 5, 9])
        for (let index = 0; index < count; index++) {
          const settled = postsPose(index, count, 0.25, mobile)
          expect(settled.y).toBeCloseTo(0)
          expect(settled.color).toBe(1)
          expect(settled.active).toBe(true)
          expect(settled.interactive).toBe(true)
          expect(postsPose(index, count, 0.13, mobile).opacity).toBe(0)
          expect(postsPose(index, count, 0.29, mobile)).toEqual(settled)
        }
  })

  it('keeps readable desktop frames separated throughout opposing entries', () => {
    for (const count of [1, 2, 3, 5, 9])
      for (const reach of [1.4, 2.7, 3.7, 10])
        for (let step = 0; step <= 150; step++) {
          const cards = Array.from({ length: count }, (_, index) =>
            postsPose(index, count, 0.13 + step / 1000, false, reach),
          ).filter((card) => card.opacity > 0)
          cards.forEach((a, index) =>
            cards
              .slice(index + 1)
              .forEach((b) =>
                expect(
                  Math.abs(a.x - b.x) >=
                    ((POST_FRAME.width + 0.08) * (a.scale + b.scale)) / 2 ||
                    Math.abs(a.y - b.y) >=
                      ((POST_FRAME.height + 0.08) * (a.scale + b.scale)) / 2,
                ).toBe(true),
              ),
          )
        }
  })

  it('enters desktop posts one at a time in CMS order and settles all before handoff', () => {
    for (const count of [1, 2, 3, 5, 9]) {
      for (let step = 0; step <= 1400; step++) {
        const progress = 0.13 + step / 10000
        const cards = Array.from({ length: count }, (_, index) =>
          postsPose(index, count, progress, false),
        )
        const moving = cards.filter(
          (card) => card.travel > 0 && card.travel < 1,
        )
        expect(moving.length).toBeLessThanOrEqual(1)
        cards.forEach((card, index) => {
          if (card.travel > 0) {
            expect(
              cards.slice(0, index).every((previous) => previous.travel === 1),
            ).toBe(true)
            if (card.travel < 1)
              expect(
                cards.slice(index + 1).every((next) => next.travel === 0),
              ).toBe(true)
          }
        })
      }
      for (let index = 0; index < count; index++) {
        const start = 0.14 + (index / count) * 0.105
        const entering = postsPose(
          index,
          count,
          start + (0.105 / count) * 0.1,
          false,
        )
        const slot = (index - (count - 1) / 2) * 1.4
        if (index > 0 && index < count - 1) {
          expect(entering.x).toBe(slot)
          expect(entering.y).toBeGreaterThan(0)
        } else {
          expect((entering.x - slot) * (index === 0 ? -1 : 1)).toBeGreaterThan(
            0,
          )
          expect(entering.y).toBe(0)
        }
        expect(postsPose(index, count, 0.245, false).travel).toBe(1)
        expect(postsPose(index, count, 0.275, false)).toEqual(
          postsPose(index, count, 0.245, false),
        )
      }
    }
  })

  it('anchors the desktop title bottom 100px above the measured first ornamental footprint', () => {
    for (const viewport of [
      { width: 700, height: 500 },
      { width: 1200, height: 900 },
      { width: 1440, height: 900 },
      { width: 1920, height: 1080 },
    ])
      for (const progress of [0.15, 0.17, 0.175, 0.21, 0.245, 0.275]) {
        const row = postRow(viewport.width, 3)
        const pose = postsPose(0, 3, progress, false)
        const ornamentalTop =
          viewport.height / 2 +
          row.unit * pose.y -
          ((POST_FRAME.height + 0.08) * row.unit * pose.scale) / 2
        const headingTop = 110
        const headingHeight = 58.5
        const offset = postsHeadingOffset(
          ornamentalTop,
          headingTop,
          headingHeight,
        )
        expect(
          ornamentalTop - (headingTop + offset + headingHeight),
        ).toBeCloseTo(100)
      }
  })

  it('stages horizontal entrances beyond their edge and keeps waiting posts hidden', () => {
    for (const width of [700, 1200, 1440, 1920])
      for (const count of [1, 2, 3, 5, 9]) {
        const row = postRow(width, count)
        const reach = width / 2 / row.unit + POST_FRAME.width / 2 + 0.15
        for (let index = 0; index < count; index++) {
          const pose = postsPose(index, count, 0.13, false, reach)
          const x = pose.x + (index - (count - 1) / 2) * (row.pitch - 1.4)
          const half = ((POST_FRAME.width + 0.08) * pose.scale * row.unit) / 2
          expect(pose.opacity).toBe(0)
          if (index > 0 && index < count - 1) {
            expect(pose.y).toBe(reach)
            expect(pose.x).toBe((index - (count - 1) / 2) * 1.4)
          } else if (index === 0)
            expect(width / 2 + x * row.unit + half).toBeLessThan(0)
          else expect(width / 2 + x * row.unit - half).toBeGreaterThan(width)
        }
      }
  })

  it('preserves the approved mobile pose timing independently of desktop sequencing', () => {
    for (const count of [1, 2, 3, 5, 9])
      for (let index = 0; index < count; index++)
        for (const progress of [0.14, 0.17, 0.19, 0.21, 0.245, 0.275]) {
          const side = index - (count - 1) / 2 <= 0 ? -1 : 1
          expect(postsPose(index, count, progress, true).travel).toBe(
            smooth(side < 0 ? 0.14 : 0.175, side < 0 ? 0.205 : 0.245, progress),
          )
        }
  })

  it('uses only direct left, bottom, right axes for the three CMS posts', () => {
    for (let step = 0; step <= 120; step++) {
      const progress = 0.135 + step / 1000
      const cards = [0, 1, 2].map((index) =>
        postsPose(index, 3, progress, false),
      )
      expect(cards[0].y).toBe(0)
      expect(cards[1].x).toBe(0)
      expect(cards[2].y).toBe(0)
      cards.forEach((card) => {
        expect(card.scale).toBe(1)
        expect(card.depth).toBe(0)
      })
      cards.forEach((card, index) => {
        const start = 0.14 + (index / 3) * 0.105
        if (progress <= start) {
          expect(card.opacity).toBe(0)
          expect(card.interactive).toBe(false)
        }
      })
    }
  })

  it('inserts document reading distance without changing opening or later film states', () => {
    const length = 16000
    const extra = 2100
    expect(documentFilmProgress(1000, length, extra)).toBe(1000 / length)
    expect(
      documentFilmProgress(length * 0.285 + extra / 2, length, extra),
    ).toBe(0.285)
    for (const progress of [0.36, 0.49, 0.68, 1]) {
      const offset = documentFilmOffset(progress, length, extra)
      expect(documentFilmProgress(offset, length, extra)).toBeCloseTo(progress)
    }
  })

  it('makes every project reachable in front of the helix with real depth between projects', () => {
    for (let index = 0; index < 6; index++) {
      const progress = 0.67 + (index / 5) * 0.215
      const cards = Array.from({ length: 6 }, (_, project) =>
        helixCard(project, 6, progress, false),
      )
      expect(cards[index].x).toBeCloseTo(0)
      expect(cards[index].depth).toBeCloseTo(0)
      expect(cards[index].color).toBeCloseTo(1)
      expect(cards.filter((card) => card.active)).toHaveLength(1)
      expect(cards.some((card) => card.depth < -200)).toBe(true)
    }
  })

  it('preserves CMS hard routes, featured destinations, and real assets', () => {
    expect(
      editorialItems(
        [
          {
            title: 'Sketchbook',
            slug: '/experiment/sketchbook-experiment',
            featuredImage: { url: 'https://images.example.com/sketch.png' },
          },
        ],
        'featured',
      )[0],
    ).toMatchObject({
      href: '/experiment/sketchbook-experiment',
      image: 'https://images.example.com/sketch.png',
      external: false,
    })
    expect(
      editorialItems(
        [
          {
            title: 'External article',
            slug: 'https://example.com/article',
            hardRoute: true,
          },
        ],
        'blog',
      )[0],
    ).toMatchObject({ href: 'https://example.com/article', external: true })
    expect(
      editorialItems([{ title: 'e-Gro', slug: 'e-gro-app' }], 'portfolio')[0]
        .href,
    ).toBe('/portfolio/e-gro-app')
    expect(editorialItems([{ title: 'Missing destination' }], 'blog')).toEqual(
      [],
    )
  })
})

describe('semantic content and native controls', () => {
  it.each([699, 700, 701, 999, 1000, 1001])(
    'keeps Posts layout independent of other scene breakpoints at %ipx',
    async (width) => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: width,
      })
      jest
        .mocked(createFilmScene)
        .mockImplementationOnce(async ({ onReady }) => {
          onReady(true)
          return jest.fn()
        })
      const { container } = render(
        <CinematicHome posts={items} transmissions={items} projects={items} />,
      )
      await waitFor(() =>
        expect(container.firstChild).toHaveAttribute(
          'data-posts-document',
          `${width <= 1000}`,
        ),
      )
      const section = container.querySelector<HTMLElement>('#film-posts')!
      expect(section.style.getPropertyValue('--post-outer-width')).toBe(
        `${mobilePostWidth(width)}px`,
      )
      expect(section.closest('[data-film-stage]') !== null).toBe(width > 1000)
      expect(
        section.compareDocumentPosition(
          container.querySelector('#film-about')!,
        ) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
    },
  )

  it('renders mobile Posts as real keyboard-accessible document content outside the sticky stage', async () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 390,
    })
    jest.mocked(createFilmScene).mockImplementationOnce(async ({ onReady }) => {
      onReady(true)
      return jest.fn()
    })
    const { container } = render(
      <CinematicHome posts={items} transmissions={items} projects={items} />,
    )
    await waitFor(() =>
      expect(container.firstChild).toHaveAttribute(
        'data-posts-document',
        'true',
      ),
    )
    const section = container.querySelector('#film-posts')!
    expect(section.parentElement).toBe(container.querySelector('main'))
    expect(section.closest('#film-content')).toBe(
      container.querySelector('main'),
    )
    expect(section.closest('.stage')).toBeNull()
    const stage = container.querySelector('[data-film-stage]')!
    expect(stage).not.toHaveAttribute('hidden')
    expect(stage).not.toHaveAttribute('role', 'slider')
    expect(stage.querySelector('canvas')).not.toBeNull()
    expect(stage.querySelector('[role="slider"]')).not.toBe(stage)
    const about = container.querySelector('#film-about')!
    expect(
      section.compareDocumentPosition(about) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(section).toHaveAttribute('data-document', 'true')
    expect(
      (section as HTMLElement).style.getPropertyValue('--post-outer-width'),
    ).toBe('350px')
    expect(section.querySelectorAll('[data-spatial-card]')).toHaveLength(5)
    section.querySelectorAll('[data-spatial-card]').forEach((link) => {
      expect(link).toHaveAttribute('tabindex', '0')
      expect(link.querySelector('[role="img"]')).not.toBeNull()
      expect(link.querySelector('svg')).toHaveAttribute(
        'viewBox',
        '-.589 -.675 1.178 1.35',
      )
      expect(link.querySelector('svg path')).toHaveAttribute(
        'd',
        editorialFramePath(),
      )
      expect(link.querySelector('svg path')).toHaveAttribute(
        'vector-effect',
        'non-scaling-stroke',
      )
    })
  })

  it('keeps every post readable and keyboard reachable with reduced motion', async () => {
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }))
    const { container } = render(
      <CinematicHome posts={items} transmissions={items} projects={items} />,
    )
    await waitFor(() =>
      expect(container.firstChild).toHaveAttribute('data-mode', 'reading'),
    )
    const links = container.querySelectorAll<HTMLAnchorElement>(
      '#film-posts [data-spatial-card]',
    )
    expect(links).toHaveLength(items.length)
    links.forEach((link, index) => {
      expect(link).toHaveAttribute('tabindex', '0')
      expect(link).toHaveAttribute('href', items[index].href)
      expect(link).toHaveAccessibleName(items[index].title)
      expect(link.style.pointerEvents).toBe('auto')
      fireEvent.pointerDown(link)
      expect(link).toHaveAttribute('data-engaged', 'true')
      fireEvent.blur(link)
      expect(link).not.toHaveAttribute('data-engaged')
    })
  })

  it('provides the real content and portrait when WebGL is unavailable', async () => {
    const { container } = render(
      <CinematicHome
        posts={items.slice(0, 2)}
        transmissions={items}
        projects={items}
      />,
    )
    await waitFor(() =>
      expect(container.firstChild).toHaveAttribute('data-mode', 'reading'),
    )
    expect(screen.getByRole('img', { name: 'Roe Greene' })).toHaveAttribute(
      'data-src',
      '/roe-profile-pic.png',
    )
    expect(screen.getAllByRole('link', { name: /Actual item 5/ })).toHaveLength(
      2,
    )
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/rardoz',
    )
  })

  it('opens a keyboard-contained navigation menu and returns focus with Escape', async () => {
    render(
      <CinematicHome posts={items} transmissions={items} projects={items} />,
    )
    await waitFor(() =>
      expect(document.querySelector('[data-mode]')).toHaveAttribute(
        'data-mode',
        'reading',
      ),
    )
    const trigger = screen.getByRole('button', { name: 'menu' })
    fireEvent.click(trigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const close = screen.getByRole('button', { name: /close/ })
    expect(close).toHaveFocus()
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true })
    expect(screen.getByRole('link', { name: /Español/ })).toHaveFocus()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('gives only Transmissions arrow controls and advances the actual carousel window', async () => {
    render(
      <CinematicHome posts={items} transmissions={items} projects={items} />,
    )
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'previous' })).toBeDisabled(),
    )
    fireEvent.click(screen.getByRole('button', { name: 'next' }))
    expect(screen.getByText('2 — 4 / 5')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'previous' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'next' }))
    expect(screen.getByRole('button', { name: 'next' })).toBeDisabled()
    expect(document.querySelector('#film-portfolio button')).toBeNull()
    expect(document.querySelector('#film-posts button')).toBeNull()
  })
})

describe('home ambient audio', () => {
  let frames: FrameRequestCallback[]

  beforeEach(() => {
    frames = []
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => frames.push(callback))
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
  })

  const flushFrames = (time: number) => {
    const pending = frames
    frames = []
    pending.forEach((callback) => callback(time))
  }

  const audioOf = (play: jest.SpyInstance) =>
    play.mock.contexts[0] as HTMLAudioElement

  it('attempts looping playback of the void on mount', async () => {
    const play = jest.mocked(HTMLMediaElement.prototype.play)
    render(
      <CinematicHome posts={items} transmissions={items} projects={items} />,
    )
    await waitFor(() => expect(play).toHaveBeenCalledTimes(1))
    const audio = audioOf(play)
    expect(audio.loop).toBe(true)
    expect(audio.src).toMatch(/\/the-void\.mp3$/)
    expect(audio.volume).toBe(0)
  })

  it('silently ignores blocked autoplay without fading', async () => {
    const error = jest.spyOn(console, 'error')
    const play = jest
      .mocked(HTMLMediaElement.prototype.play)
      .mockRejectedValue(new DOMException('blocked', 'NotAllowedError'))
    render(
      <CinematicHome posts={items} transmissions={items} projects={items} />,
    )
    await waitFor(() => expect(play).toHaveBeenCalled())
    await Promise.resolve()
    await Promise.resolve()
    flushFrames(5000)
    expect(audioOf(play).volume).toBe(0)
    expect(
      error.mock.calls
        .flat()
        .some((arg) => /NotAllowed|blocked/.test(`${arg}`)),
    ).toBe(false)
  })

  it('fades in to 0.75 over two seconds once playing', async () => {
    const play = jest.mocked(HTMLMediaElement.prototype.play)
    render(
      <CinematicHome posts={items} transmissions={items} projects={items} />,
    )
    await waitFor(() => expect(play).toHaveBeenCalled())
    const audio = audioOf(play)
    await waitFor(() => expect(frames.length).toBeGreaterThan(0))
    let volume = 0
    for (const time of [1000, 1000, 2000, 3000, 3500]) {
      flushFrames(time)
      expect(audio.volume).toBeGreaterThanOrEqual(volume)
      volume = audio.volume
      if (time === 2000) expect(audio.volume).toBeCloseTo(0.375)
    }
    expect(audio.volume).toBeCloseTo(0.75)
    expect(frames).toHaveLength(0)
  })

  it('pauses and releases the audio when leaving the home page', async () => {
    const play = jest.mocked(HTMLMediaElement.prototype.play)
    const pause = jest.mocked(HTMLMediaElement.prototype.pause)
    const load = jest.mocked(HTMLMediaElement.prototype.load)
    const { unmount } = render(
      <CinematicHome posts={items} transmissions={items} projects={items} />,
    )
    await waitFor(() => expect(frames.length).toBeGreaterThan(0))
    const audio = audioOf(play)
    unmount()
    expect(pause.mock.contexts).toContain(audio)
    expect(load.mock.contexts).toContain(audio)
    expect(audio.hasAttribute('src')).toBe(false)
    expect(window.cancelAnimationFrame).toHaveBeenCalled()
    flushFrames(10000)
    expect(audio.volume).toBe(0)
  })

  it('keeps a single audio instance under Strict Mode remounts', async () => {
    const play = jest.mocked(HTMLMediaElement.prototype.play)
    const pause = jest.mocked(HTMLMediaElement.prototype.pause)
    render(
      <StrictMode>
        <CinematicHome posts={items} transmissions={items} projects={items} />
      </StrictMode>,
    )
    await waitFor(() => expect(play).toHaveBeenCalled())
    await Promise.resolve()
    expect(play).toHaveBeenCalledTimes(1)
    const audio = audioOf(play)
    expect(audio.src).toMatch(/\/the-void\.mp3$/)
    expect(pause.mock.contexts).not.toContain(audio)
  })
})
