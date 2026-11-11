import * as THREE from 'three'
import {
  createOrbitalFragments,
  updateOrbitalFragments,
} from './orbital-fragments'

jest.mock('./asteroid', () => {
  const three = jest.requireActual('three')
  return {
    rockGeometry: () => new three.SphereGeometry(1, 16, 12).scale(1.5, 1, 1),
    asteroidMaterial: new three.ShaderMaterial({
      uniforms: { uBrightness: { value: 1 } },
    }),
  }
})
jest.mock('three/examples/jsm/utils/BufferGeometryUtils.js', () => ({
  mergeVertices: (geometry: THREE.BufferGeometry) => geometry.clone(),
}))

describe('featurette image proportions', () => {
  it.each([
    [1600, 900],
    [900, 1600],
    [1000, 1000],
  ])('preserves a %ix%i photo on a non-square stone face', (width, height) => {
    const image = document.createElement('img')
    image.width = width
    image.height = height
    const texture = new THREE.Texture(image)
    const load = jest
      .spyOn(THREE.TextureLoader.prototype, 'load')
      .mockImplementation((_url, onLoad) => {
        onLoad?.(texture)
        return texture
      })
    try {
      const [{ rock }] = createOrbitalFragments(
        [
          {
            title: 'Post',
            description: '',
            href: '/post',
            image: '/photo.jpg',
            imageAlt: 'Photo',
            external: false,
          },
        ],
        new THREE.Scene(),
        jest.fn(),
      )
      const crop = rock.material.uniforms.uCrop.value
      const extent = rock.material.uniforms.uExtent.value
      expect((crop.x * width) / (crop.y * height)).toBeCloseTo(
        extent.x / extent.y,
      )
      expect(Math.max(crop.x, crop.y)).toBe(1)
      expect(Math.min(crop.x, crop.y)).toBeGreaterThan(0)
      rock.geometry.dispose()
      rock.material.dispose()
    } finally {
      load.mockRestore()
      texture.dispose()
    }
  })
})

describe('featurette entry lanes', () => {
  it.each([
    [1440, 900],
    [1920, 1080],
    [1024, 650],
  ])('keeps rocks separated throughout entry at %ix%i', (width, height) => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: width,
    })
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: height,
    })
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.z = 20
    camera.updateMatrixWorld()
    const asteroid = new THREE.Group()
    asteroid.add(new THREE.Mesh(new THREE.SphereGeometry(2)))
    const container = document.createElement('div')
    const fragments = [0, 1, 2].map((index) => {
      const link = document.createElement('a')
      link.dataset.fragment = String(index)
      const surface = document.createElement('span')
      surface.dataset.fragmentSurface = ''
      link.append(surface)
      container.append(link)
      const geometry = new THREE.SphereGeometry(0.6)
      geometry.computeBoundingSphere()
      const rock = new THREE.Mesh(
        geometry,
        new THREE.ShaderMaterial({
          uniforms: { uOpacity: { value: 1 }, uFocus: { value: 0 } },
        }),
      )
      rock.userData.loaded = true
      return { rock, index }
    })

    for (let step = 0; step <= 140; step++) {
      const progress = 0.12 + step * 0.0005
      updateOrbitalFragments(
        fragments,
        camera,
        container,
        asteroid,
        progress,
        false,
      )
      for (let i = 0; i < fragments.length; i++) {
        const rock = fragments[i].rock
        for (let j = i + 1; j < fragments.length; j++) {
          const other = fragments[j].rock
          const clearance =
            rock.geometry.boundingSphere!.radius * rock.scale.x +
            other.geometry.boundingSphere!.radius * other.scale.x
          expect(rock.position.distanceTo(other.position)).toBeGreaterThan(
            clearance,
          )
          const bounds = [i, j].map((index) => {
            const style = (container.children[index] as HTMLElement).style
            const x = parseFloat(style.getPropertyValue('--orbit-x'))
            const y = parseFloat(style.getPropertyValue('--orbit-y'))
            return {
              x,
              y,
              right: x + parseFloat(style.getPropertyValue('--orbit-width')),
              bottom: y + parseFloat(style.getPropertyValue('--orbit-height')),
            }
          })
          expect(
            bounds[0].right < bounds[1].x ||
              bounds[1].right < bounds[0].x ||
              bounds[0].bottom < bounds[1].y ||
              bounds[1].bottom < bounds[0].y,
          ).toBe(true)
        }
      }
    }

    fragments.forEach(({ rock }) => {
      rock.geometry.dispose()
      rock.material.dispose()
    })
    const mesh = asteroid.children[0] as THREE.Mesh
    mesh.geometry.dispose()
    ;(mesh.material as THREE.Material).dispose()
  })
})
