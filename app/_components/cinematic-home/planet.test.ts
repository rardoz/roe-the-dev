import { advancePlanetClouds, createPlanet, planetMapWidth } from './planet'

const mockLoads: { url: string; loaded: (texture: unknown) => void }[] = []
jest.mock('three', () => {
  class Texture {
    listeners = new Map<string, () => void>()
    disposed = 0
    addEventListener(name: string, listener: () => void) {
      this.listeners.set(name, listener)
    }
    dispose() {
      this.disposed++
      this.listeners.get('dispose')?.()
    }
  }
  class Vector {
    values = [0, 0, 0]
    constructor(...values: number[]) {
      if (values.length) this.values = values
    }
    set(...values: number[]) {
      this.values = values
    }
    copy(vector: Vector) {
      this.values = [...vector.values]
    }
  }
  return {
    Vector2: Vector,
    TextureLoader: class {
      load(url: string, loaded: (texture: Texture) => void) {
        mockLoads.push({ url, loaded: (texture) => loaded(texture as Texture) })
        return new Texture()
      }
    },
    ShaderMaterial: class {
      constructor(options: object) {
        Object.assign(this, options)
      }
    },
    SphereGeometry: class {
      radius: number
      constructor(radius: number) {
        this.radius = radius
      }
    },
    Mesh: class {
      position = new Vector()
      rotation = new Vector()
      renderOrder = 0
      geometry: object
      material: object
      constructor(geometry: object, material: object) {
        this.geometry = geometry
        this.material = material
      }
    },
    SRGBColorSpace: 'srgb',
    RepeatWrapping: 1000,
    MirroredRepeatWrapping: 1002,
    LinearMipmapLinearFilter: 1008,
  }
})

beforeEach(() => {
  mockLoads.length = 0
})

it('loads one alpha map over charcoal with no coplanar cloud mesh', () => {
  const onLoad = jest.fn()
  const planet = createPlanet(1440, 2, 16, onLoad)
  expect(mockLoads.map(({ url }) => url)).toEqual([
    '/assets/earth/clouds-4096.webp',
  ])
  expect(Object.keys(planet)).toEqual(['earth'])
  expect(planet.earth.geometry).toMatchObject({ radius: 260 })
  expect(planet.earth.material).toMatchObject({ toneMapped: false })
  const texture = planet.earth.material.uniforms.uMap.value
  expect(texture).toMatchObject({
    colorSpace: 'srgb',
    wrapS: 1000,
    wrapT: 1002,
    flipY: false,
    generateMipmaps: true,
    minFilter: 1008,
    anisotropy: 16,
  })
  expect(planet.earth.material.uniforms.uCloudRepeat.value.values).toEqual([
    2, 2,
  ])
  mockLoads[0].loaded(texture)
  expect(onLoad).toHaveBeenCalledTimes(1)
  texture.dispose()
  mockLoads[0].loaded(texture)
  expect(onLoad).toHaveBeenCalledTimes(1)
  expect(texture.disposed).toBe(2)
})

it('loads smaller mobile maps and freezes drift without resetting the rotation', () => {
  createPlanet(390, 3, 4, jest.fn())
  expect(mockLoads[0].url).toContain('2048.webp')
  expect(planetMapWidth(1440, 1)).toBe(4096)
  expect(advancePlanetClouds(1.4, 5, false)).toBeCloseTo(1.46)
  expect(advancePlanetClouds(1.4, 5, true)).toBe(1.4)
})
