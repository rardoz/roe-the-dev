import { act, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AboutRoe } from './about'
import {
  ABOUT_ASTEROID_EVENT,
  aboutAsteroidState,
  aboutLensWidth,
  aboutRestPoint,
  boundAboutPoint,
  silhouetteHull,
} from './about-motion'
import en from '../../../messages/en-US.json'
import es from '../../../messages/es-US.json'

const mockEnMessages = en

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    <span role="img" aria-label={alt} data-src={src} />
  ),
}))
jest.mock('next-intl', () => ({
  useTranslations: (namespace: 'Cinema' | 'About') => (key: string) =>
    mockEnMessages[namespace][key as keyof (typeof en)[typeof namespace]],
}))

const bounds = { left: 20, top: 150, right: 370, bottom: 500 }
const titleBounds = { left: 20, top: 80, right: 300, bottom: 120 }
const photoBounds = { left: 260, top: 520, right: 370, bottom: 630 }
const outline = [
  { x: -0.5, y: 0 },
  { x: -0.25, y: -0.45 },
  { x: 0.3, y: -0.4 },
  { x: 0.5, y: 0.1 },
  { x: 0.2, y: 0.45 },
  { x: -0.4, y: 0.35 },
]

describe('About asteroid geometry and scroll ownership', () => {
  it('owns only the About window and reverses deterministically', () => {
    for (const progress of [0, 0.19, 0.3, 0.455, 0.49, 0.68, 1])
      expect(aboutAsteroidState(progress).active).toBe(false)
    for (const progress of [0.301, 0.325, 0.36, 0.415, 0.454])
      expect(aboutAsteroidState(progress).active).toBe(true)
    expect(aboutAsteroidState(0.3).foreground).toBe(0)
    expect(aboutAsteroidState(0.335).foreground).toBe(1)
    expect(aboutAsteroidState(0.415).foreground).toBe(1)
    expect(aboutAsteroidState(0.455).foreground).toBe(0)
    const positions = [0.3, 0.32, 0.36, 0.43, 0.455]
    expect(positions.map(aboutAsteroidState)).toEqual(
      [...positions].reverse().map(aboutAsteroidState).reverse(),
    )
  })

  it('measures 100px away from text and 360px / 220px over it', () => {
    expect(aboutLensWidth({ x: 195, y: 684 }, bounds, false)).toBe(100)
    expect(aboutLensWidth({ x: 195, y: 684 }, bounds, true)).toBe(100)
    expect(aboutLensWidth({ x: 195, y: 300 }, bounds, false)).toBe(360)
    expect(aboutLensWidth({ x: 195, y: 300 }, bounds, true)).toBe(220)
    expect(aboutLensWidth({ x: 410, y: 300 }, bounds, false)).toBe(230)
    expect(aboutRestPoint(390, 844)).toEqual({ x: 195, y: 684 })
    expect(boundAboutPoint({ x: -50, y: 1000 }, 390, 844)).toEqual({
      x: 50,
      y: 734,
    })
  })

  it('derives an irregular outline from mesh projections, not a circle', () => {
    const hull = silhouetteHull([...outline, { x: 0, y: 0 }, outline[0]])
    expect(hull).toHaveLength(outline.length)
    expect(hull).toEqual(expect.arrayContaining(outline))
    expect(hull).not.toContainEqual({ x: 0, y: 0 })
    expect(silhouetteHull([])).toEqual([])
  })

  it('localizes every reveal string in English and Spanish', () => {
    const keys = Object.keys(en.Cinema).filter(
      (key) => key.startsWith('aboutHidden') || key.startsWith('aboutReveal'),
    ) as (keyof typeof en.Cinema)[]
    expect(keys).toHaveLength(6)
    keys.forEach((key) => {
      expect(en.Cinema[key].length).toBeGreaterThan(0)
      expect(es.Cinema[key].length).toBeGreaterThan(0)
      expect(es.Cinema[key]).not.toEqual(en.Cinema[key])
    })
  })
})

describe('About reveal inputs', () => {
  let frames: Map<number, FrameRequestCallback>
  let frameId: number
  let now: number

  beforeEach(() => {
    frames = new Map()
    frameId = 0
    now = 0
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        frames.set(++frameId, callback)
        return frameId
      })
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      frames.delete(id)
    })
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 390,
    })
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 844,
    })
    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        const rect = {
          'about-heading': titleBounds,
          'about-biography': bounds,
          'about-photo': photoBounds,
        }[this.className] || { left: 0, top: 0, right: 390, bottom: 844 }
        return {
          ...rect,
          x: rect.left,
          y: rect.top,
          width: rect.right - rect.left,
          height: rect.bottom - rect.top,
          toJSON: () => ({}),
        }
      })
    HTMLElement.prototype.setPointerCapture = jest.fn()
    HTMLElement.prototype.hasPointerCapture = jest.fn().mockReturnValue(true)
    HTMLElement.prototype.releasePointerCapture = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const advance = () =>
    act(() => {
      for (let index = 0; index < 30; index++) {
        now += 50
        const pending = [...frames.values()]
        frames.clear()
        pending.forEach((callback) => callback(now))
      }
    })
  const point = (
    element: Element | Window,
    type: string,
    x: number,
    y: number,
    id = 1,
  ) => {
    const event = new Event(type, { bubbles: true })
    Object.assign(event, {
      clientX: x,
      clientY: y,
      pointerId: id,
      pointerType: 'touch',
      button: 0,
      isPrimary: true,
    })
    fireEvent(element, event)
  }
  const mount = (mobile = true) => {
    const props = {
      progress: 0.36,
      opacity: 1,
      reading: false,
      mobile,
      blocked: false,
    }
    const result = render(
      <div data-mode="cinema">
        <AboutRoe {...props} />
      </div>,
    )
    const root = result.container.firstElementChild as HTMLElement
    act(() =>
      root.dispatchEvent(
        new CustomEvent(ABOUT_ASTEROID_EVENT, {
          detail: { x: 195, y: 400, width: 190, outline },
        }),
      ),
    )
    advance()
    return {
      ...result,
      root,
      props,
      control: screen.getByRole('button', { name: en.Cinema.aboutReveal }),
    }
  }

  it('rests at bottom center and ignores touches that did not start on the asteroid', () => {
    const { root, control, container } = mount()
    expect(root.dataset.aboutX).toBe('195')
    expect(root.dataset.aboutY).toBe('684')
    expect(control.dataset.width).toBe('100.0')
    expect(
      container
        .querySelector<HTMLElement>('#film-about')!
        .style.getPropertyValue('--lens-opacity'),
    ).toBe('0')
    point(window, 'pointermove', 140, 250)
    point(control, 'pointermove', 140, 250)
    advance()
    expect(root.dataset.aboutY).toBe('684')
    expect(control.dataset.width).toBe('100.0')
  })

  it.each(['pointerup', 'pointercancel', 'lostpointercapture'])(
    'drags only the captured mobile pointer and returns home on %s',
    (end) => {
      const { root, control } = mount()
      point(control, 'pointerdown', 195, 684)
      expect(control.setPointerCapture).toHaveBeenCalledWith(1)
      point(control, 'pointermove', 160, 300, 2)
      advance()
      expect(root.dataset.aboutY).toBe('684')
      point(control, 'pointermove', 160, 300)
      advance()
      expect(Number(root.dataset.aboutY)).toBeCloseTo(300, 1)
      expect(Number(control.dataset.width)).toBeCloseTo(220, 1)
      point(control, end, 160, 300)
      advance()
      expect(Number(root.dataset.aboutY)).toBeCloseTo(684, 1)
      expect(Number(control.dataset.width)).toBeCloseTo(100, 1)
    },
  )

  it('attracts toward desktop mouse input and grows the matching reveal mask', () => {
    const { root, control, container } = mount(false)
    const event = new Event('pointermove')
    Object.assign(event, { clientX: 160, clientY: 300, pointerType: 'mouse' })
    fireEvent(window, event)
    advance()
    expect(Number(root.dataset.aboutX)).toBeCloseTo(160, 1)
    expect(Number(root.dataset.aboutY)).toBeCloseTo(300, 1)
    expect(Number(control.dataset.width)).toBeCloseTo(360, 1)
    container
      .querySelectorAll<HTMLElement>('.about-alternate')
      .forEach((layer) => {
        expect(layer.style.clipPath).toMatch(/^polygon\(/)
        expect(layer).toHaveAttribute('aria-hidden', 'true')
      })
    expect(
      container
        .querySelector<HTMLElement>('#film-about')!
        .style.getPropertyValue('--lens-opacity'),
    ).toBe('1')
  })

  it.each([
    ['title', 160, 100, 'about-heading-alternate'],
    ['portrait', 315, 575, 'about-photo-alternate'],
  ])(
    'grows over the %s and clips its alternate layer to the silhouette',
    (_, x, y, testId) => {
      const { control } = mount(false)
      const event = new Event('pointermove')
      Object.assign(event, { clientX: 60, clientY: 760, pointerType: 'mouse' })
      fireEvent(window, event)
      advance()
      expect(Number(control.dataset.width)).toBeCloseTo(100, 1)
      Object.assign(event, { clientX: x, clientY: y })
      fireEvent(window, event)
      advance()
      expect(Number(control.dataset.width)).toBeCloseTo(360, 1)
      const layer = screen.getByTestId(testId)
      const offset =
        testId === 'about-heading-alternate' ? titleBounds : photoBounds
      const [left, top] = layer.style.clipPath
        .match(/^polygon\(([-\d.]+)px ([-\d.]+)px/)!
        .slice(1)
        .map(Number)
      expect(left).toBeCloseTo(x + outline[0].x * 360 - offset.left, 1)
      expect(top).toBeCloseTo(y + outline[0].y * 360 - offset.top, 1)
      expect(layer).toHaveAttribute('aria-hidden', 'true')
    },
  )

  it('supports keyboard movement, full reveal, and Escape reset', () => {
    const { control, root, container } = mount(false)
    fireEvent.keyDown(control, { key: 'ArrowUp' })
    advance()
    expect(Number(root.dataset.aboutY)).toBeCloseTo(652, 1)
    fireEvent.click(control, { detail: 0 })
    expect(control).toHaveAttribute('aria-pressed', 'true')
    expect(
      container.querySelector('.about-biography .about-alternate'),
    ).toHaveAttribute('aria-hidden', 'false')
    fireEvent.keyDown(control, { key: 'Escape' })
    advance()
    expect(control).toHaveAttribute('aria-pressed', 'false')
    expect(Number(root.dataset.aboutY)).toBeCloseTo(684, 1)
  })

  it('releases scene ownership, capture, and animation on departure or a menu', () => {
    const { root, control, rerender, props } = mount()
    point(control, 'pointerdown', 195, 684)
    rerender(
      <div data-mode="cinema">
        <AboutRoe {...props} blocked />
      </div>,
    )
    expect(root).not.toHaveAttribute('data-about-control')
    expect(root).not.toHaveAttribute('data-about-x')
    expect(control.releasePointerCapture).toHaveBeenCalledWith(1)
    expect(frames.size).toBe(0)
    rerender(
      <div data-mode="cinema">
        <AboutRoe {...props} progress={0.49} />
      </div>,
    )
    expect(
      screen.queryByRole('button', { name: en.Cinema.aboutReveal }),
    ).not.toBeInTheDocument()
  })

  it('provides a static accessible reveal with the real biography and photograph in reading mode', () => {
    const { container } = render(
      <div data-mode="reading">
        <AboutRoe progress={0} opacity={0} reading mobile blocked={false} />
      </div>,
    )
    expect(container.firstElementChild).not.toHaveAttribute(
      'data-about-control',
    )
    expect(frames.size).toBe(0)
    expect(screen.getByRole('img', { name: 'Roe Greene' })).toHaveAttribute(
      'data-src',
      '/roe-profile-pic.png',
    )
    expect(screen.getByText(en.About.description1)).toBeInTheDocument()
    expect(screen.getByText(en.About.description2)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: en.Cinema.aboutReveal }))
    expect(
      screen.getByRole('heading', { name: en.Cinema.aboutHiddenTitle }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: en.About.subtitle }),
    ).not.toBeInTheDocument()
    const learnMore = screen.getByRole('link', { name: /Learn more/ })
    expect(learnMore).toHaveAttribute('href', 'https://linkedin.com/in/rardoz')
    expect(learnMore).toHaveClass('about-link')
    expect(learnMore).not.toHaveClass('line-button')
    expect(
      screen.getByRole('heading', { level: 2, name: en.Cinema.aboutRoe }),
    ).toBeInTheDocument()
    expect(container.querySelector('[data-src="/roe-alt.jpeg"]')).toBeTruthy()
    expect(screen.queryByText(/Drag the asteroid|Move the asteroid/)).toBeNull()
  })
})
