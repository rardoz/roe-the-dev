import * as THREE from 'three'
import { cloudVertex, cloudFragment } from './cloud-shader'
import { createPlanet } from './planet'
import { createDebris } from './asteroid'

export function seededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 4294967296
  }
}

const rockVertex = `
varying vec3 vNormal;
varying vec3 vWorld;
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
  gl_Position=projectionMatrix*modelViewMatrix*local;
}`
const carvedFragment = `
varying vec3 vNormal;
varying vec3 vWorld;
void main(){
  vec3 normal=normalize(vNormal);
  vec3 view=normalize(cameraPosition-vWorld);
  float key=dot(normal,normalize(vec3(-.56,.83,.07)));
  float back=dot(normal,normalize(vec3(.42,.3,-.86)));
  float facet=key>.78?.66:key>.58?.28:key>.38?.1:key>.12?.032:.004;
  float edge=pow(1.-abs(dot(normal,view)),3.);
  float rim=smoothstep(.2,.9,back)*edge;
  float seam=sin(vWorld.x*2.7+vWorld.y*1.9)*sin(vWorld.z*3.1-vWorld.y*.7);
  float strata=.5+.5*sin(vWorld.y*5.3+vWorld.x*.9);
  float tone=facet*(.84+.16*step(-.25,seam))*(.93+.07*strata)+rim*.78+edge*.035;
  gl_FragColor=vec4(vec3(min(tone,1.)),1.);
  #include <colorspace_fragment>
}`
const carved = new THREE.ShaderMaterial({
  vertexShader: rockVertex,
  fragmentShader: carvedFragment,
})
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

function industrialCity() {
  const group = new THREE.Group()
  const random = seededRandom(909)
  const footprint = new THREE.Shape()
  footprint.moveTo(-0.42, -0.5)
  footprint.lineTo(0.42, -0.5)
  footprint.lineTo(0.5, -0.42)
  footprint.lineTo(0.5, 0.42)
  footprint.lineTo(0.42, 0.5)
  footprint.lineTo(-0.42, 0.5)
  footprint.lineTo(-0.5, 0.42)
  footprint.lineTo(-0.5, -0.42)
  footprint.closePath()
  const bodyGeometry = new THREE.ExtrudeGeometry(footprint, {
    depth: 1,
    bevelEnabled: false,
  })
  bodyGeometry.rotateX(-Math.PI / 2)
  const ribGeometry = new THREE.BoxGeometry(1, 1, 1)
  const crownGeometry = new THREE.ConeGeometry(0.7, 1, 4)
  const drumGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 10).translate(
    0,
    0.5,
    0,
  )
  const needleGeometry = new THREE.CylinderGeometry(0.04, 0.12, 1, 4).translate(
    0,
    0.5,
    0,
  )
  const buildings = new THREE.InstancedMesh(bodyGeometry, carved, 2600)
  const ribs = new THREE.InstancedMesh(ribGeometry, concrete, 14000)
  const crowns = new THREE.InstancedMesh(crownGeometry, carved, 420)
  const drums = new THREE.InstancedMesh(drumGeometry, carved, 360)
  const needles = new THREE.InstancedMesh(needleGeometry, concrete, 420)
  const transform = new THREE.Object3D()
  let buildingIndex = 0,
    ribIndex = 0,
    crownIndex = 0,
    drumIndex = 0,
    needleIndex = 0
  const place = (
    mesh: THREE.InstancedMesh,
    index: number,
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
  ) => {
    transform.position.set(x, y, z)
    transform.scale.set(sx, sy, sz)
    transform.updateMatrix()
    mesh.setMatrixAt(index, transform.matrix)
  }
  function tower(
    x: number,
    z: number,
    width: number,
    height: number,
    depth: number,
    tiers: number,
  ) {
    let lower = 0
    for (let tier = 0; tier < tiers; tier++) {
      const segment = tier === 0 ? height * 0.52 : height * (0.34 / tiers) * 1.4
      const scale = 1 - tier * 0.16
      if (buildingIndex >= 2600) break
      place(
        buildings,
        buildingIndex++,
        x,
        lower,
        z,
        width * scale,
        segment,
        depth * scale,
      )
      const strips = Math.min(7, 3 + Math.floor(width / 2))
      for (let rib = 0; rib < strips && ribIndex < 14000; rib++) {
        place(
          ribs,
          ribIndex++,
          x + ((rib - (strips - 1) / 2) / strips) * width * scale * 1.1,
          lower + segment * 0.5,
          z + depth * scale * 0.52,
          0.06 + width * 0.014,
          segment * 0.94,
          0.13,
        )
      }
      lower += segment * (tier === 0 ? 1 : 0.92)
    }
    const spireHeight = Math.max(2, height - lower)
    if (crownIndex < 420)
      place(
        crowns,
        crownIndex++,
        x,
        lower + spireHeight * 0.5,
        z,
        width * 0.3,
        spireHeight,
        depth * 0.3,
      )
    if (needleIndex < 420)
      place(
        needles,
        needleIndex++,
        x,
        lower + spireHeight,
        z,
        1,
        height * 0.1,
        1,
      )
  }
  function industrial(x: number, z: number, radius: number, height: number) {
    if (drumIndex >= 360) return
    place(drums, drumIndex++, x, 0, z, radius * 2, height, radius * 2)
    place(
      drums,
      drumIndex++,
      x,
      height,
      z,
      radius * 1.45,
      height * 0.24,
      radius * 1.45,
    )
    place(
      drums,
      drumIndex++,
      x,
      height * 1.24,
      z,
      radius * 0.55,
      height * 0.36,
      radius * 0.55,
    )
  }
  // A vast massing envelope: low flanks rising toward a single monumental core.
  for (let index = 0; index < 330; index++) {
    const x = (random() * 2 - 1) * 105
    const z = -70 + random() * 100
    const center = Math.pow(1 - Math.min(1, Math.abs(x + 3) / 105), 1.7)
    const depthBoost = 1 - Math.min(1, Math.max(0, z + 70) / 130)
    const height =
      5 + random() * 15 + center * (16 + random() * 40) * (0.55 + depthBoost)
    const width = 1.5 + random() * 4.5
    if (random() < 0.17 && Math.abs(x) > 16)
      industrial(x, z, 1.3 + random() * 2, 8 + random() * 22)
    else
      tower(
        x,
        z,
        width,
        height,
        width * (0.6 + random() * 0.8),
        3 + Math.floor(random() * 3),
      )
  }
  const core: number[][] = [
    [-3, -7, 8, 87, 9, 5],
    [-13, -12, 5, 63, 7, 5],
    [8, -14, 5, 68, 6, 5],
    [-7, -23, 6, 75, 7, 5],
    [1, -25, 5, 70, 6, 5],
    [-21, -20, 4, 49, 5, 4],
    [18, -18, 4, 52, 5, 4],
    [-4, -3, 2.3, 99, 2.5, 5],
    [-26, -9, 4.5, 56, 5, 5],
    [22, -8, 4.2, 58, 5, 5],
    [-34, -16, 5, 46, 6, 4],
    [30, -20, 5, 50, 6, 4],
    [-16, 2, 3.2, 41, 4, 4],
    [11, 3, 3.4, 44, 4, 4],
  ]
  core.forEach((args) => {
    const [x, z, width, height, depth, tiers] = args
    tower(x, z, width, height, depth, tiers)
  })
  buildings.count = buildingIndex
  ribs.count = ribIndex
  crowns.count = crownIndex
  drums.count = drumIndex
  needles.count = needleIndex
  group.add(buildings, ribs, crowns, drums, needles)
  for (let index = 0; index < 20; index++) {
    const side = index % 2 ? 1 : -1
    const fin = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 37 + (index % 5) * 4, 2.5),
      carved,
    )
    fin.position.set(
      -3 + side * (3.7 + Math.floor(index / 2) * 0.75),
      18 + (index % 5) * 2,
      0,
    )
    group.add(fin)
  }
  const bridge = (
    x1: number,
    x2: number,
    y: number,
    z: number,
    thickness = 1.3,
  ) => {
    const span = new THREE.Mesh(
      new THREE.BoxGeometry(Math.abs(x2 - x1), thickness, 1.8),
      carved,
    )
    span.position.set((x1 + x2) / 2, y, z)
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(Math.abs(x2 - x1), 0.14, 2),
      concrete,
    )
    rail.position.set((x1 + x2) / 2, y + thickness / 2 + 0.07, z)
    group.add(span, rail)
  }
  bridge(-13, -3, 38, -12)
  bridge(-3, 8, 46, -14)
  bridge(-21, -7, 30, -20)
  bridge(1, 18, 33, -20)
  bridge(-26, -13, 24, -10)
  bridge(8, 22, 28, -10)
  bridge(-34, -21, 18, -18, 1.6)
  bridge(18, 30, 20, -19, 1.6)
  // Searchlights rake the cloud from crown spires.
  const beamMaterial = new THREE.MeshBasicMaterial({
    color: '#fff',
    transparent: true,
    opacity: 0.07,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  })
  group.userData.beamMaterial = beamMaterial
  ;[
    [-13, 63, -12, 0.22],
    [8, 68, -14, -0.2],
    [-26, 56, -9, 0.38],
    [22, 58, -8, -0.36],
  ].forEach(([x, y, z, tilt]) => {
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 5, 90, 12, 1, true).translate(0, 45, 0),
      beamMaterial,
    )
    beam.position.set(x, y, z)
    beam.rotation.z = tilt
    group.add(beam)
  })
  const slab = new THREE.Mesh(new THREE.BoxGeometry(250, 1.2, 160), dark)
  slab.position.set(-3, -0.55, -20)
  group.add(slab)
  for (let side = -1; side <= 1; side += 2) {
    const road = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.18, 120),
      concrete,
    )
    road.position.set(-3 + side * 9, 0.1, 58)
    group.add(road)
    for (let index = 0; index < 18; index++) {
      const pavement = new THREE.Mesh(
        new THREE.BoxGeometry(5.5, 0.22, 6.8),
        dark,
      )
      pavement.position.set(-3 + side * 5, 0.15, index * 7 + 8)
      group.add(pavement)
    }
    const arch = new THREE.Mesh(new THREE.BoxGeometry(3.5, 21, 5), carved)
    arch.position.set(-3 + side * 10, 10.5, 2)
    group.add(arch)
  }
  const portal = new THREE.Mesh(new THREE.BoxGeometry(24, 3, 5), carved)
  portal.position.set(-3, 21, 2)
  group.add(portal)
  return group
}

function atmosphericDisc() {
  const group = new THREE.Group()
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uRays: { value: 0 } },
    vertexShader:
      'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `uniform float uRays;varying vec2 vUv;
void main(){
  vec2 p=(vUv-.5)*2.;
  float r=length(p);
  float angle=atan(p.y,p.x);
  float sun=1.-smoothstep(.43,.46,r);
  float ring=smoothstep(.47,.49,r)*(1.-smoothstep(.495,.51,r))*.7;
  float ring2=smoothstep(.55,.565,r)*(1.-smoothstep(.57,.585,r))*.32;
  float rays=step(.5,fract(angle*5.7295))*smoothstep(.46,.62,r)*(1.-smoothstep(.62,1.,r))*.26*uRays;
  float halo=exp(-pow(max(r-.43,0.),2.)*34.)*.5*(1.-sun);
  float shade=.7+.3*smoothstep(.35,-.45,p.y);
  float alpha=clamp(sun*.97+ring+ring2+rays+halo,0.,1.)*(1.-smoothstep(.9,1.,r));
  gl_FragColor=vec4(vec3(mix(1.,shade,sun)),alpha);
}`,
    side: THREE.DoubleSide,
  })
  const disc = new THREE.Mesh(new THREE.PlaneGeometry(208, 208), material)
  disc.position.set(-3, 44, -78)
  group.add(disc)
  return group
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

function cloudBanks() {
  const group = new THREE.Group()
  const random = seededRandom(73)
  const material = new THREE.ShaderMaterial({
    vertexShader: rockVertex,
    fragmentShader: `varying vec3 vNormal;varying vec3 vWorld;void main(){float light=max(0.,dot(normalize(vNormal),normalize(vec3(-.5,.85,.1))));float rim=pow(1.-abs(dot(normalize(vNormal),normalize(cameraPosition-vWorld))),5.);float band=floor(light*4.)/4.;gl_FragColor=vec4(vec3(.02+band*.36+light*.1+rim*.16),1.);}`,
  })
  for (const side of [-1, 1]) {
    const bank = new THREE.Group()
    for (let index = 0; index < 34; index++) {
      const cloud = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1, 3),
        material,
      )
      cloud.position.set(
        side * (14 + random() * 27),
        random() * 34 - 7,
        random() * 28,
      )
      cloud.scale.set(7 + random() * 9, 4 + random() * 7, 6 + random() * 8)
      cloud.rotation.set(random() * 0.6, random() * 2, random() * 0.4)
      bank.add(cloud)
    }
    bank.position.set(side * 28, 14, 34)
    group.add(bank)
  }
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
  },
) {
  const asteroidGroup = new THREE.Group()
  asteroidGroup.add(asteroidModel)
  const city = industrialCity()
  const cityDisc = atmosphericDisc()
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
  const haze = cloudBanks()
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
    cityDisc,
    arrivalLight,
    cloud,
    desert.group,
    earth,
    atmosphere,
    debris,
    haze,
    shockwave,
    blastDebris,
  )
  return {
    asteroid: asteroidGroup,
    city,
    cityDisc,
    arrivalLight,
    cloud,
    desert,
    earth,
    atmosphere,
    debris,
    haze,
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
