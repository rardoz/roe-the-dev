import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'

function hash(x: number, y: number, z: number, seed: number) {
  let h =
    (x * 374761393 + y * 668265263 + z * 2147483647 + seed * 1274126177) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

function valueNoise(x: number, y: number, z: number, seed: number) {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const iz = Math.floor(z)
  const fx = x - ix
  const fy = y - iy
  const fz = z - iz
  const ux = fx * fx * (3 - 2 * fx)
  const uy = fy * fy * (3 - 2 * fy)
  const uz = fz * fz * (3 - 2 * fz)
  const corner = (a: number, b: number, c: number) =>
    hash(ix + a, iy + b, iz + c, seed)
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t
  return lerp(
    lerp(
      lerp(corner(0, 0, 0), corner(1, 0, 0), ux),
      lerp(corner(0, 1, 0), corner(1, 1, 0), ux),
      uy,
    ),
    lerp(
      lerp(corner(0, 0, 1), corner(1, 0, 1), ux),
      lerp(corner(0, 1, 1), corner(1, 1, 1), ux),
      uy,
    ),
    uz,
  )
}

function fbm(
  v: THREE.Vector3,
  frequency: number,
  octaves: number,
  seed: number,
) {
  let sum = 0
  let amplitude = 0.5
  let total = 0
  for (let octave = 0; octave < octaves; octave++) {
    sum +=
      amplitude *
      valueNoise(
        v.x * frequency,
        v.y * frequency,
        v.z * frequency,
        seed + octave * 17,
      )
    total += amplitude
    amplitude *= 0.5
    frequency *= 2.03
  }
  return sum / total
}

function random(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 4294967296
  }
}

function unitVector(next: () => number) {
  const z = next() * 2 - 1
  const angle = next() * Math.PI * 2
  const ring = Math.sqrt(1 - z * z)
  return new THREE.Vector3(Math.cos(angle) * ring, Math.sin(angle) * ring, z)
}

interface RockOptions {
  seed: number
  detail: number
  radii: [number, number, number]
  lumpiness: number
  cuts: number
  craters: number
  jitter: number
  bulge: number
}

/**
 * One star-shaped rock: warped low-frequency lumps give the asymmetric
 * silhouette, a handful of planar cuts carve large flat faces, impact basins
 * break the surface up, and a jittered flat-shaded mesh supplies the facets.
 */
export function rockGeometry(options: RockOptions) {
  const next = random(options.seed)
  const cuts = Array.from({ length: options.cuts }, () => {
    const normal = unitVector(next)
    return {
      normal,
      offset:
        (0.66 + next() * 0.1) *
        (0.78 + fbm(normal, 1.1, 2, options.seed + 41) * 0.5),
    }
  })
  const craters = Array.from({ length: options.craters }, () => ({
    direction: unitVector(next),
    angle: 0.12 + next() * 0.16,
    depth: 0.04 + next() * 0.04,
  }))
  const geometry = new THREE.IcosahedronGeometry(1, options.detail)
  const positions = geometry.getAttribute('position')
  const cavity = new Float32Array(positions.count)
  const direction = new THREE.Vector3()
  const warped = new THREE.Vector3()
  const offset = new THREE.Vector3()
  const solved = new Map<string, number>()
  for (let index = 0; index < positions.count; index++) {
    direction.fromBufferAttribute(positions, index).normalize()
    const key = `${direction.x.toFixed(5)},${direction.y.toFixed(5)},${direction.z.toFixed(5)}`
    const seen = solved.get(key)
    if (seen !== undefined) {
      positions.setXYZ(
        index,
        positions.getX(seen),
        positions.getY(seen),
        positions.getZ(seen),
      )
      cavity[index] = cavity[seen]
      continue
    }
    solved.set(key, index)
    offset.set(
      fbm(direction, 1.4, 2, options.seed + 3) - 0.5,
      fbm(direction, 1.4, 2, options.seed + 7) - 0.5,
      fbm(direction, 1.4, 2, options.seed + 11) - 0.5,
    )
    warped.copy(direction).addScaledVector(offset, 1.1)
    const lumps = fbm(warped, 1.6, 3, options.seed)
    const ridged = 1 - Math.abs(fbm(warped, 3.6, 3, options.seed + 29) * 2 - 1)
    let radius =
      1.1 +
      (lumps - 0.5) * options.lumpiness +
      ridged * 0.04 +
      Math.max(0, direction.z) ** 2 * options.bulge
    for (const cut of cuts) {
      const facing = direction.dot(cut.normal)
      if (facing > 0.05) radius = Math.min(radius, cut.offset / facing)
    }
    let dent = 0
    for (const crater of craters) {
      const angle = Math.acos(Math.min(1, direction.dot(crater.direction)))
      if (angle < crater.angle) {
        const t = angle / crater.angle
        dent += crater.depth * (1 - t * t) - (t > 0.82 ? 0.025 : 0)
      }
    }
    radius *=
      1 +
      (hash(
        Math.round(direction.x * 1e4),
        Math.round(direction.y * 1e4),
        Math.round(direction.z * 1e4),
        options.seed,
      ) -
        0.5) *
        options.jitter
    radius = Math.max(0.35, radius - dent)
    cavity[index] = THREE.MathUtils.clamp(
      (radius - 0.45) / 0.45 - dent * 2,
      0,
      1,
    )
    positions.setXYZ(
      index,
      direction.x * radius * options.radii[0],
      direction.y * radius * options.radii[1],
      direction.z * radius * options.radii[2],
    )
  }
  geometry.setAttribute('cavity', new THREE.BufferAttribute(cavity, 1))
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}

const vertexShader = `
attribute float cavity;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec3 vLocal;
varying float vCavity;
void main(){
  vec4 local=vec4(position,1.);
  vec3 surfaceNormal=normal;
  #ifdef USE_INSTANCING
    mat3 instanceNormal=mat3(instanceMatrix);
    surfaceNormal/=vec3(dot(instanceNormal[0],instanceNormal[0]),dot(instanceNormal[1],instanceNormal[1]),dot(instanceNormal[2],instanceNormal[2]));
    surfaceNormal=instanceNormal*surfaceNormal;
    local=instanceMatrix*local;
  #endif
  vNormal=normalize(mat3(modelMatrix)*surfaceNormal);
  vWorld=(modelMatrix*local).xyz;
  vLocal=position;
  vCavity=cavity;
  gl_Position=projectionMatrix*modelViewMatrix*local;
}`

// The mesh is non-indexed, so vertex normals are flat per triangle and each
// facet gets its own tone.
const fragmentShader = `
varying vec3 vNormal;
varying vec3 vWorld;
varying vec3 vLocal;
varying float vCavity;
float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
void main(){
  vec3 normal=normalize(vNormal);
  vec3 view=normalize(cameraPosition-vWorld);
  float key=dot(normal,normalize(vec3(-.5,.78,.38)));
  float fill=dot(normal,normalize(vec3(.6,-.35,.7)));
  float back=dot(normal,normalize(vec3(.1,.35,-.93)));
  float tint=hash(floor(normal*3.5));
  float lit=smoothstep(-.1,.95,key);
  float tone=.002+pow(lit,3.)*(.05+tint*.55)+tint*tint*.012+max(fill,0.)*.01;
  float cavityShade=mix(.015,1.,smoothstep(.25,.85,vCavity));
  float edge=pow(1.-abs(dot(normal,view)),2.4);
  float rim=smoothstep(.0,.8,back)*edge;
  float gleam=pow(max(key,0.),16.)*.3;
  float value=(tone*cavityShade+gleam)+rim*.4+edge*.012;
  gl_FragColor=vec4(vec3(min(value,1.)),1.);
  #include <colorspace_fragment>
}`

export const asteroidMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
})

const ASSET_ROOT = '/assets/asteroid'
const ASTEROID_WIDTH = 36

export class AsteroidAssetError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause })
    this.name = 'AsteroidAssetError'
  }
}

export function disposeObject(root: THREE.Object3D) {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    object.geometry.dispose()
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material]
    materials.forEach((material: THREE.Material) => {
      Object.values(material).forEach((value) => {
        if (value instanceof THREE.Texture) value.dispose()
      })
      material.dispose()
    })
  })
}

// Loads the supplied scanned rock (OBJ + baked diffuse / AO / normal maps).
// Rejects with AsteroidAssetError instead of substituting stand-in geometry.
export async function loadAsteroid(anisotropy: number) {
  const textures: THREE.Texture[] = []
  try {
    const textureLoader = new THREE.TextureLoader()
    const loadTexture = async (name: string, color: boolean) => {
      const texture = await textureLoader.loadAsync(`${ASSET_ROOT}/${name}`)
      textures.push(texture)
      texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace
      texture.anisotropy = anisotropy
      return texture
    }
    const [source, map, aoMap, normalMap] = await Promise.all([
      new OBJLoader().loadAsync(`${ASSET_ROOT}/asteroid.obj`),
      loadTexture('asteroid-diffuse.jpg', true),
      loadTexture('asteroid-ao.jpg', false),
      loadTexture('asteroid-normal.jpg', false),
    ])
    let rock: THREE.Mesh | undefined
    source.traverse((object) => {
      if (object instanceof THREE.Mesh && !rock) rock = object
    })
    if (
      !rock ||
      !rock.geometry.getAttribute('uv') ||
      !rock.geometry.getAttribute('normal')
    ) {
      disposeObject(source)
      throw new AsteroidAssetError('Asteroid model has no UV-mapped mesh')
    }
    const geometry = rock.geometry as THREE.BufferGeometry
    source.traverse((object) => {
      if (object instanceof THREE.Mesh && object !== rock)
        object.geometry.dispose()
    })
    geometry.center()
    geometry.computeBoundingBox()
    const size = geometry.boundingBox!.getSize(new THREE.Vector3())
    const material = new THREE.MeshStandardMaterial({
      map,
      aoMap,
      aoMapIntensity: 0.5,
      normalMap,
      normalScale: new THREE.Vector2(2, 2),
      color: '#5c5c5c',
      roughness: 0.92,
      metalness: 0,
    })
    material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <opaque_fragment>',
        `float rimEdge = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition))), 7.0);
        outgoingLight += vec3(rimEdge * 0.2);
        #include <opaque_fragment>`,
      )
    }
    const mesh = new THREE.Mesh(geometry, material)
    const fit = ASTEROID_WIDTH / size.x
    mesh.scale.setScalar(fit)
    const model = new THREE.Group()
    model.add(mesh)
    return model
  } catch (error) {
    textures.forEach((texture) => texture.dispose())
    throw error instanceof AsteroidAssetError
      ? error
      : new AsteroidAssetError('Asteroid asset failed to load', error)
  }
}

export function createDebris(count: number) {
  const shard = rockGeometry({
    seed: 905,
    detail: 3,
    radii: [1, 0.72, 0.8],
    lumpiness: 0.6,
    cuts: 7,
    craters: 0,
    jitter: 0.05,
    bulge: 0,
  })
  const debris = new THREE.InstancedMesh(shard, asteroidMaterial, count)
  const next = random(533)
  const pose = new THREE.Object3D()
  for (let index = 0; index < count; index++) {
    const side = next() < 0.5 ? -1 : 1
    const spread = Math.pow(next(), 0.7)
    pose.position.set(
      side * (24 + spread * 40) + (next() - 0.5) * 8,
      65 + (next() - 0.5) * 80,
      (next() - 0.8) * 60,
    )
    const size = 0.25 + Math.pow(next(), 3) * 1.7
    pose.scale.set(
      size * (0.7 + next() * 0.9),
      size,
      size * (0.7 + next() * 0.6),
    )
    pose.rotation.set(next() * 6, next() * 6, next() * 6)
    pose.updateMatrix()
    debris.setMatrixAt(index, pose.matrix)
  }
  return debris
}
