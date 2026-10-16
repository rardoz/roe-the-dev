import * as THREE from 'three'
import { cloudVertex, cloudFragment } from './cloud-shader'
import { createPlanet } from './planet'
import { createDebris } from './asteroid'
import { createAtmosphericDescent } from './atmospheric-descent'
import { createCity } from './city'

export function seededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 4294967296
  }
}

const concrete = new THREE.MeshStandardMaterial({
  color: '#c8c5b8',
  roughness: 1,
  flatShading: true,
})
const dark = new THREE.MeshStandardMaterial({ color: '#111110', roughness: 1 })

function fracturedRock(seed: number, detail = 5) {
  const random = seededRandom(seed)
  const geometry = new THREE.IcosahedronGeometry(1, detail)
  const positions = geometry.getAttribute('position')
  const points = new Map<string, THREE.Vector3>()
  for (let index = 0; index < positions.count; index++) {
    const vertex = new THREE.Vector3().fromBufferAttribute(positions, index)
    const key = vertex
      .toArray()
      .map((value) => value.toFixed(4))
      .join(',')
    if (!points.has(key)) {
      const wave =
        Math.sin(vertex.x * 11 + vertex.z * 7) *
        Math.cos(vertex.y * 9 - vertex.z * 3)
      vertex.multiplyScalar(0.78 + wave * 0.16 + random() * 0.29)
      points.set(key, vertex)
    }
    const point = points.get(key)!
    positions.setXYZ(index, point.x, point.y, point.z)
  }
  geometry.computeVertexNormals()
  return geometry
}
const rockGeometry = fracturedRock(251, 3)

function sphere(
  parent: THREE.Object3D,
  position: number[],
  scale: number[],
  material: THREE.Material,
  detail = 2,
) {
  const mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1, detail),
    material,
  )
  mesh.position.set(position[0], position[1], position[2])
  mesh.scale.set(scale[0], scale[1], scale[2])
  parent.add(mesh)
  return mesh
}

function openingLight() {
  const group = new THREE.Group()
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader:
      'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:
      'varying vec2 vUv;void main(){float r=length(vUv-.5)*2.;float edge=1.-smoothstep(.65,.98,r);float alpha=(exp(-r*r*36.)+exp(-r*r*9.)*.12)*edge;gl_FragColor=vec4(vec3(1.),alpha);}',
    blending: THREE.AdditiveBlending,
  })
  const light = new THREE.Mesh(new THREE.CircleGeometry(22, 64), material)
  light.position.set(0, 33, -135)
  group.add(light)
  return group
}

function mushroomCloud() {
  const material = new THREE.ShaderMaterial({
    vertexShader: cloudVertex,
    fragmentShader: cloudFragment,
    transparent: true,
    depthWrite: true,
    side: THREE.BackSide,
    uniforms: {
      uCamera: { value: new THREE.Vector3() },
      uProgress: { value: 0 },
      uViewProjection: { value: new THREE.Matrix4() },
      uModel: { value: new THREE.Matrix4() },
    },
  })
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(72, 78, 62).translate(0, 37, 0),
    material,
  )
  return mesh
}

function wasteland() {
  const group = new THREE.Group()
  const random = seededRandom(345)
  const substrate = new THREE.Mesh(
    new THREE.PlaneGeometry(750, 750),
    new THREE.MeshBasicMaterial({ color: '#030303' }),
  )
  substrate.rotation.x = -Math.PI / 2
  substrate.position.y = -1.65
  group.add(substrate)
  const columns = 32,
    rows = 36,
    cellWidth = 9,
    cellDepth = 10
  const points: THREE.Vector3[][] = []
  for (let row = 0; row <= rows; row++) {
    points[row] = []
    for (let column = 0; column <= columns; column++) {
      points[row][column] = new THREE.Vector3(
        (column - columns / 2) * cellWidth + (random() - 0.5) * 3.7,
        -0.8 + random() * 0.24,
        row * cellDepth - 115 + (random() - 0.5) * 4,
      )
    }
  }
  const vertices: number[] = [],
    colors: number[] = []
  const triangle = (
    a: THREE.Vector3,
    b: THREE.Vector3,
    c: THREE.Vector3,
    tone: number,
  ) => {
    for (const vertex of [a, b, c]) {
      vertices.push(vertex.x, vertex.y, vertex.z)
      colors.push(tone, tone, tone)
    }
  }
  for (let row = 0; row < rows; row++)
    for (let column = 0; column < columns; column++) {
      const corners = [
        points[row][column],
        points[row + 1][column],
        points[row + 1][column + 1],
        points[row][column + 1],
      ]
      const center = corners
        .reduce((sum, point) => sum.add(point), new THREE.Vector3())
        .multiplyScalar(0.25)
      const top = corners.map((point) =>
        point.clone().sub(center).multiplyScalar(0.94).add(center),
      )
      const bottom = top.map(
        (point) => new THREE.Vector3(point.x, -1.6, point.z),
      )
      const tone = 0.09 + random() * 0.31
      triangle(top[0], top[1], top[2], tone)
      triangle(top[0], top[2], top[3], tone * 0.91)
      for (let index = 0; index < 4; index++) {
        const next = (index + 1) % 4
        triangle(top[index], bottom[index], bottom[next], 0.008)
        triangle(top[index], bottom[next], top[next], 0.008)
      }
    }
  const relief = new THREE.BufferGeometry()
  relief.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  relief.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  relief.computeVertexNormals()
  group.add(
    new THREE.Mesh(
      relief,
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 1,
        flatShading: true,
      }),
    ),
  )
  const horizon = new THREE.Mesh(
    new THREE.CircleGeometry(18, 64),
    new THREE.MeshBasicMaterial({ color: '#e5e3dc', side: THREE.DoubleSide }),
  )
  horizon.position.set(-3, 17, -104)
  group.add(horizon)
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#101010'
    ctx.fillRect(0, 0, 512, 256)
    ctx.strokeStyle = '#a1a1a1'
    ctx.lineWidth = 4
    ctx.strokeRect(12, 12, 488, 232)
    ctx.fillStyle = '#d6d6d6'
    ctx.font = '56px Georgia'
    ctx.textAlign = 'center'
    ctx.fillText('ROE', 256, 106)
    ctx.fillText('THE DEV', 256, 174)
    ctx.fillStyle = '#292929'
    for (let index = 0; index < 90; index++)
      ctx.fillRect(random() * 512, random() * 256, random() * 25, 1)
  }
  const sign = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 0.3), [
    dark,
    dark,
    dark,
    dark,
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas) }),
    dark,
  ])
  sign.position.set(7, 4.5, 157)
  sign.rotation.z = -0.1
  sign.rotation.y = -0.18
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.4, 9, 0.4), dark)
  post.position.set(7, 0.5, 157)
  group.add(sign, post)
  const scorpion = new THREE.Group()
  sphere(scorpion, [0, 0, 0], [0.6, 0.18, 1.1], dark, 1)
  const lineMaterial = new THREE.LineBasicMaterial({ color: '#0b0b0b' })
  for (let side = -1; side <= 1; side += 2) {
    for (let index = 0; index < 4; index++) {
      const line = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(side * 0.3, 0, index * 0.35 - 0.5),
        new THREE.Vector3(side * 1.1, 0.1, index * 0.4 - 0.5),
        new THREE.Vector3(side * 1.5, -0.15, index * 0.5 - 0.3),
      ])
      scorpion.add(new THREE.Line(line, lineMaterial))
    }
    sphere(scorpion, [side * 0.9, 0, 1.5], [0.35, 0.18, 0.55], dark, 1)
  }
  const tail = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, -0.7),
    new THREE.Vector3(0, 0.7, -1.2),
    new THREE.Vector3(0, 1.5, -0.8),
    new THREE.Vector3(0, 1.2, -0.1),
  ])
  scorpion.add(
    new THREE.Mesh(new THREE.TubeGeometry(tail, 12, 0.12, 5, false), dark),
  )
  scorpion.position.set(-5, -0.6, 166)
  scorpion.scale.setScalar(1.7)
  group.add(scorpion)
  const tumbleweed = new THREE.Group()
  for (let index = 0; index < 8; index++) {
    const hoop = new THREE.Mesh(
      new THREE.TorusGeometry(1.2, 0.025, 3, 18),
      concrete,
    )
    hoop.rotation.set(random() * 3, random() * 3, random() * 3)
    tumbleweed.add(hoop)
  }
  tumbleweed.position.set(8, 0.8, 159)
  tumbleweed.scale.setScalar(1.3)
  group.add(tumbleweed)
  return { group, scorpion, tumbleweed }
}

export function createWorld(
  scene: THREE.Scene,
  asteroidModel: THREE.Object3D,
  planetOptions = {
    width: 1440,
    pixelRatio: 1,
    anisotropy: 1,
    onLoad: () => {},
    onCityError: (error: unknown) => console.error(error),
  },
) {
  const asteroidGroup = new THREE.Group()
  asteroidGroup.add(asteroidModel)
  const city = createCity(
    planetOptions.anisotropy,
    planetOptions.onLoad,
    planetOptions.onCityError,
  )
  const arrivalLight = openingLight()
  const cloud = mushroomCloud()
  const desert = wasteland()
  const { earth } = createPlanet(
    planetOptions.width,
    planetOptions.pixelRatio,
    planetOptions.anisotropy,
    planetOptions.onLoad,
  )
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(260.5, 96, 64),
    new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {},
      vertexShader:
        'varying vec3 vNormal; varying vec3 vView; void main(){vec4 p=modelViewMatrix*vec4(position,1.);vNormal=normalize(normalMatrix*normal);vView=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',
      fragmentShader:
        'varying vec3 vNormal;varying vec3 vView;void main(){float rim=pow(1.-abs(dot(vNormal,vView)),5.);gl_FragColor=vec4(vec3(1.),min(1.,rim*2.3));}',
    }),
  )
  atmosphere.position.copy(earth.position)
  atmosphere.renderOrder = 2
  const random = seededRandom(533)
  const debris = createDebris(54)
  const atmosphericClouds = createAtmosphericDescent(
    planetOptions.width,
    planetOptions.onLoad,
    planetOptions.anisotropy,
  )
  const shockwave = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.035, 4, 100),
    new THREE.MeshBasicMaterial({
      color: '#ddd',
      transparent: true,
      opacity: 0.6,
    }),
  )
  shockwave.rotation.x = -Math.PI / 2
  shockwave.position.y = 1
  const blastDebris = new THREE.InstancedMesh(rockGeometry, dark, 42)
  const blastPaths = Array.from({ length: 42 }, () => ({
    angle: random() * Math.PI * 2,
    distance: 17 + random() * 51,
    height: 12 + random() * 32,
    size: 0.35 + random() * 1.2,
  }))
  scene.add(
    asteroidGroup,
    city,
    arrivalLight,
    cloud,
    desert.group,
    earth,
    atmosphere,
    debris,
    atmosphericClouds,
    shockwave,
    blastDebris,
  )
  return {
    asteroid: asteroidGroup,
    city,
    arrivalLight,
    cloud,
    desert,
    earth,
    atmosphere,
    debris,
    atmosphericClouds,
    shockwave,
    blastDebris,
    blastPaths,
  }
}

export function disposeWorld(scene: THREE.Scene) {
  const geometries = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()
  const textures = new Set<THREE.Texture>()
  scene.traverse((object) => {
    object.userData.disposed = true
    if (!(object instanceof THREE.Mesh || object instanceof THREE.Line)) return
    geometries.add(object.geometry)
    const list = Array.isArray(object.material)
      ? object.material
      : [object.material]
    list.forEach((material) => {
      materials.add(material)
      Object.values(material).forEach((value) => {
        if (value instanceof THREE.Texture) textures.add(value)
      })
      if (material instanceof THREE.ShaderMaterial) {
        Object.values(material.uniforms).forEach(({ value }) => {
          if (value instanceof THREE.Texture) textures.add(value)
        })
      }
    })
  })
  textures.forEach((texture) => texture.dispose())
  geometries.forEach((geometry) => geometry.dispose())
  materials.forEach((material) => material.dispose())
}
