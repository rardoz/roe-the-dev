import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import CinematicHome from './index'
import { editorialItems, type EditorialItem } from './content'
import { POST_FRAME, filmState, helixCard, postsPose } from './motion'

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
  window.matchMedia = jest.fn().mockImplementation(() => ({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }))
  window.scrollTo = jest.fn()
  Element.prototype.scrollIntoView = jest.fn()
})

describe('continuous scroll film', () => {
  it('keeps the impact bounded and reverses to the same state at the same scroll position', () => {
    const forward = [0.3, 0.46, 0.49, 0.54, 0.9].map(filmState)
    const reverse = [0.9, 0.54, 0.49, 0.46, 0.3].map(filmState).reverse()
    expect(reverse).toEqual(forward)
    expect(filmState(-2).impact).toBe(0)
    expect(filmState(3).impact).toBe(1)
    expect(filmState(0.49).flash).toBeLessThanOrEqual(0.65)
    expect(filmState(0.6).flash).toBeLessThan(0.001)
  })

  it('flows featured posts in from below along opposing diagonals without overlap', () => {
    for (const mobile of [false, true])
      for (const count of [1, 2, 3, 4, 5, 9]) {
        for (let step = 0; step <= 400; step++) {
          const progress = 0.12 + (step / 400) * 0.2
          const cards = Array.from({ length: count }, (_, index) =>
            postsPose(index, count, progress, mobile),
          ).filter((card) => card.opacity > 0.02)
          cards.forEach((a, i) =>
            cards.slice(i + 1).forEach((b) => {
              const apart =
                Math.abs(a.x - b.x) >= POST_FRAME.width - 1e-6 ||
                Math.abs(a.y - b.y) >= POST_FRAME.height - 1e-6
              expect(apart).toBe(true)
            }),
          )
        }
      }
  })

  it('arrives from the outer lower sides and settles the last pair with a card-width gap', () => {
    for (const mobile of [false, true]) {
      const early = [0, 1].map((index) => postsPose(index, 4, 0.15, mobile))
      expect(early[0].x).toBeLessThan(0)
      expect(early[1].x).toBeGreaterThan(0)
      expect(early[0].y).toBeGreaterThan(0.5)
      const later = [0, 1].map((index) => postsPose(index, 4, 0.19, mobile))
      expect(Math.abs(later[0].x)).toBeLessThan(Math.abs(early[0].x))
      expect(later[0].y).toBeLessThan(early[0].y)
      const settled = [2, 3].map((index) => postsPose(index, 4, 0.27, mobile))
      expect(settled.every((card) => card.color === 1)).toBe(true)
      const distance = Math.hypot(
        settled[0].x - settled[1].x,
        settled[0].y - settled[1].y,
      )
      expect(distance).toBeGreaterThanOrEqual(POST_FRAME.width + 0.1)
    }
    expect(postsPose(0, 4, 0.135, false).opacity).toBe(0)
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
