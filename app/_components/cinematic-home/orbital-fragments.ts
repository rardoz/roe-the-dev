import * as THREE from 'three'
import type { EditorialItem } from './content'
import { smooth } from './motion'
import { silhouetteHull } from './about-motion'
import { rockGeometry, asteroidMaterial } from './asteroid'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// Closed sculpted rocks with welded smooth normals and a front-facing photo material.
export function createOrbitalFragments(
  items: EditorialItem[],
  scene: THREE.Scene,
  onLoad: () => void,
) {
  const loader = new THREE.TextureLoader().setCrossOrigin('anonymous')
  return items.slice(0, 3).map((item, index) => {
    const source = rockGeometry({
      seed: 905 + index * 143,
      detail: 7,
      radii: [0.58, [0.44, 0.49, 0.57][index], 0.48],
      lumpiness: 0.6,
      cuts: 7,
      craters: 0,
      jitter: 0.008,
      bulge: 0,
    })
    // Remove split-face normals and the old UV seam before welding. This
    // prevents disconnected triangle lighting without flattening the rock.
    source.deleteAttribute('normal')
    source.deleteAttribute('uv')
    const geometry = mergeVertices(source, 0.0001)
    source.dispose()
    geometry.computeVertexNormals()
    geometry.computeBoundingSphere()
    geometry.computeBoundingBox()
    const placeholder = new THREE.DataTexture(
      new Uint8Array([25, 25, 25, 255]),
      1,
      1,
    )
    placeholder.needsUpdate = true
    const material = asteroidMaterial.clone()
    material.transparent = true
    material.uniforms.uMap = { value: placeholder }
    material.uniforms.uCrop = { value: new THREE.Vector2(1, 1) }
    material.uniforms.uExtent = {
      value: geometry.boundingBox!.getSize(new THREE.Vector3()),
    }
    material.uniforms.uCenter = {
      value: geometry.boundingBox!.getCenter(new THREE.Vector3()),
    }
    material.uniforms.uOpacity = { value: 1 }
    material.uniforms.uFocus = { value: 0 }
    material.uniforms.uBrightness.value = 0.5
    material.vertexShader = material.vertexShader
      .replace(
        'attribute float cavity;',
        'attribute float cavity; varying vec3 vLocalNormal;',
      )
      .replace(
        'vec4 local=vec4(position,1.);',
        'vLocalNormal=normal; vec4 local=vec4(position,1.);',
      )
    material.fragmentShader = material.fragmentShader
      .replace(
        'uniform float uBrightness;',
        `
        uniform float uBrightness;
        uniform sampler2D uMap;
        uniform vec2 uCrop;
        uniform vec3 uExtent;
        uniform vec3 uCenter;
        uniform float uOpacity;
        uniform float uFocus;
        varying vec3 vLocalNormal;
        vec3 photoAt(vec2 uv) { return texture2D(uMap,(uv-.5)*uCrop+.5).rgb; }
        float stoneHash(vec3 p) {
          p=fract(p*.1031);
          p+=dot(p,p.yzx+33.33);
          return fract((p.x+p.y)*p.z);
        }
        float stoneNoise(vec3 p) {
          vec3 cell=floor(p), f=fract(p);
          f=f*f*(3.-2.*f);
          return mix(
            mix(mix(stoneHash(cell),stoneHash(cell+vec3(1,0,0)),f.x),
                mix(stoneHash(cell+vec3(0,1,0)),stoneHash(cell+vec3(1,1,0)),f.x),f.y),
            mix(mix(stoneHash(cell+vec3(0,0,1)),stoneHash(cell+vec3(1,0,1)),f.x),
                mix(stoneHash(cell+vec3(0,1,1)),stoneHash(cell+vec3(1,1,1)),f.x),f.y),f.z);
        }
      `,
      )
      .replace(
        'vec3 normal=normalize(vNormal);',
        `
        float mineral=stoneNoise(vLocal*18.);
        float grain=stoneNoise(vLocal*72.);
        float relief=mineral*.65+grain*.35;
        vec3 normal=normalize(vNormal);
        vec3 dx=dFdx(vWorld), dy=dFdy(vWorld);
        vec3 rx=cross(dy,normal), ry=cross(normal,dx);
        float determinant=dot(dx,rx);
        float worldScale=length(dx)/max(length(dFdx(vLocal)),.00001);
        vec3 gradient=(dFdx(relief)*rx+dFdy(relief)*ry);
        normal=normalize(abs(determinant)*normal-
          sign(determinant)*gradient*worldScale*.012);
        `,
      )
      // The debris shader deliberately assigns random facet tones. Use a
      // continuous tone here so normals cannot reveal triangular color bands.
      .replace('float tint=hash(floor(normal*3.5));', 'float tint=.32;')
      .replace('pow(max(key,0.),16.)*.3', 'pow(max(key,0.),16.)*.06')
      .replace(
        'gl_FragColor=vec4(vec3(min(value,1.)*uBrightness),1.);',
        `
        vec3 p=(vLocal-uCenter)/uExtent+.5;
        vec3 image=photoAt(p.xy);
        float gray=dot(image,vec3(.2126,.7152,.0722));
        float mineralTone=mix(.72,1.22,mineral)*mix(.88,1.08,grain);
        float stone=min(value,1.)*uBrightness*mineralTone;
        float photograph=gray*(.22+uFocus*.12)*(.38+lit*.62)*mix(.65,1.,vCavity)*mix(.9,1.05,relief);
        float photoFacing=smoothstep(.25,.75,normalize(vLocalNormal).z);
        float faceEdge=1.-smoothstep(.30,.48,length(p.xy-.5));
        float erosion=mix(.7,1.,smoothstep(.25,.85,vCavity));
        float inlay=photoFacing*faceEdge*erosion;
        gl_FragColor=vec4(vec3(mix(stone,photograph,.82*inlay)),uOpacity);
      `,
      )
    const rock = new THREE.Mesh(geometry, material)
    rock.visible = false
    rock.name = `orbital-fragment-${index + 1}`
    scene.add(rock)
    loader.load(
      item.image,
      (texture) => {
        if (rock.userData.disposed) {
          texture.dispose()
          return
        }
        texture.colorSpace = THREE.SRGBColorSpace
        texture.anisotropy = 4
        const ratio = texture.image.width / texture.image.height
        const faceRatio =
          material.uniforms.uExtent.value.x / material.uniforms.uExtent.value.y
        material.uniforms.uCrop.value.set(
          Math.min(1, faceRatio / ratio),
          Math.min(1, ratio / faceRatio),
        )
        material.uniforms.uMap.value = texture
        placeholder.dispose()
        rock.userData.loaded = true
        onLoad()
      },
      undefined,
      onLoad,
    )
    return { rock, index }
  })
}

const direction = new THREE.Vector3()
const right = new THREE.Vector3()
const up = new THREE.Vector3()
const center = new THREE.Vector3()
const point = new THREE.Vector3()
const exitDirection = new THREE.Vector3()
const exitPoint = new THREE.Vector3()
const box = new THREE.Box3()
const size = new THREE.Vector3()

export function updateOrbitalFragments(
  fragments: ReturnType<typeof createOrbitalFragments>,
  camera: THREE.PerspectiveCamera,
  container: HTMLElement,
  asteroid: THREE.Group,
  progress: number,
  reduced: boolean,
) {
  const width = window.innerWidth,
    height = window.innerHeight
  const state = fragments[0]?.rock.userData
  if (!state) return false
  if (progress < 0.12) {
    fragments.forEach(({ rock }) => {
      rock.visible = false
    })
    return false
  }
  camera.getWorldDirection(direction)
  right.set(1, 0, 0).applyQuaternion(camera.quaternion)
  up.set(0, 1, 0).applyQuaternion(camera.quaternion)
  asteroid.updateWorldMatrix(true, true)
  box.setFromObject(asteroid)
  box.getCenter(center)
  box.getSize(size)
  const radius = Math.max(size.x, size.y, size.z) * 0.78
  const focused = fragments.find(({ index }) =>
    container
      .querySelector(`[data-fragment="${index}"]`)
      ?.matches(':focus-within'),
  )
  if (state.focusedIndex !== focused?.index) {
    state.focusHeld = Boolean(focused)
    state.focusScrollY = window.scrollY
  }
  state.focusedIndex = focused?.index
  if (Math.abs(window.scrollY - (state.focusScrollY ?? window.scrollY)) > 2)
    state.focusHeld = false
  const holdingFocus = focused && state.focusHeld
  const orbitPhase =
    Math.PI / 3 -
    THREE.MathUtils.clamp((progress - 0.19) / 0.11, 0, 1) * Math.PI * 2
  const requested = holdingFocus
    ? (-focused.index * Math.PI * 2) / 3
    : orbitPhase
  state.angle = requested
  fragments.forEach(({ rock, index }) => {
    const link = container.querySelector<HTMLElement>(
      `[data-fragment="${index}"]`,
    )
    const surface = link?.querySelector<HTMLElement>('[data-fragment-surface]')
    if (!link || !surface) return
    link.dataset.fragmentReady = String(Boolean(rock.userData.loaded))
    rock.visible = Boolean(rock.userData.loaded)
    const angle = state.angle + (index * Math.PI * 2) / 3
    const front = Math.cos(angle)
    const entry = smooth(0.12 + index * 0.005, 0.18 + index * 0.005, progress)
    const exit = smooth(0.3, 0.315, progress)
    rock.position
      .copy(center)
      .addScaledVector(right, Math.sin(angle) * radius)
      .addScaledVector(direction, -front * radius * 0.85)
      .addScaledVector(up, Math.sin(angle) * radius * 0.22 - radius * 0.04)
    // Begin beyond three different screen edges at the orbit's depth. The
    // margin includes the full rock radius, so it enters solid, never popping
    // into view. Scroll reversal retraces the same approach.
    if (entry < 1) {
      const destination = rock.position.clone()
      const depth = destination.clone().sub(camera.position).dot(direction)
      const halfHeight =
        Math.max(0.01, depth) *
        Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)
      const extent =
        rock.geometry.boundingSphere!.radius *
        radius *
        (width < 700 ? 0.36 : 0.42)
      point.copy(destination).project(camera)
      const horizontal = 1.2 + extent / (halfHeight * camera.aspect)
      const vertical = 1.2 + extent / halfHeight
      // Enter from the same side as the destination, never across another lane.
      if (index === 0) point.set(horizontal, 0.65, point.z)
      else if (index === 1) point.set(0.3, -vertical, point.z)
      else point.set(-horizontal, 0.85, point.z)
      point.unproject(camera)
      rock.position.copy(point).lerp(destination, entry)
    }
    if (exit > 0) {
      // Continue each rock along its projected orbital tangent to the viewport edge.
      point.copy(rock.position).project(camera)
      exitPoint
        .copy(rock.position)
        .addScaledVector(right, Math.cos(angle) * radius * 0.01)
        .addScaledVector(direction, Math.sin(angle) * radius * 0.0085)
        .addScaledVector(up, Math.cos(angle) * radius * 0.0022)
        .project(camera)
      exitDirection.set(exitPoint.x - point.x, exitPoint.y - point.y, 0)
      if (exitDirection.lengthSq() < 1e-12)
        exitDirection.set(point.x, point.y, 0)
      if (exitDirection.lengthSq() < 1e-12)
        exitDirection.set(Math.cos(angle), -Math.cos(angle) * 0.22, 0)
      if (exitDirection.lengthSq() < 1e-12)
        exitDirection.set(0, Math.sin(angle), 0)
      exitDirection.normalize()
      const edgeDistance = Math.min(
        exitDirection.x > 0
          ? (1.25 - point.x) / exitDirection.x
          : exitDirection.x < 0
            ? (-1.25 - point.x) / exitDirection.x
            : Infinity,
        exitDirection.y > 0
          ? (1.25 - point.y) / exitDirection.y
          : exitDirection.y < 0
            ? (-1.25 - point.y) / exitDirection.y
            : Infinity,
      )
      exitPoint
        .set(
          point.x + exitDirection.x * Math.max(0, edgeDistance),
          point.y + exitDirection.y * Math.max(0, edgeDistance),
          point.z,
        )
        .unproject(camera)
      rock.position.lerp(exitPoint, exit)
    }
    link.dataset.orbitEntry = entry.toFixed(3)
    rock.quaternion.copy(camera.quaternion)
    rock.rotateY(Math.sin(angle) * 0.85)
    rock.rotateX(-0.16 + Math.sin(angle * 2) * 0.18)
    rock.rotateZ(
      Math.sin(angle + index) * 0.22 + (1 - entry) * [-0.65, 0.5, 0.7][index],
    )
    rock.scale.setScalar(radius * (width < 700 ? 0.36 : 0.42))
    rock.updateMatrixWorld()
    point.copy(rock.position).project(camera)
    const px = (point.x * 0.5 + 0.5) * width,
      py = (-point.y * 0.5 + 0.5) * height
    const centerDistance = Math.hypot(point.x, point.y)
    const orbitAlignment =
      1 -
      smooth(0.55, 1.1, Math.abs(Math.atan2(Math.sin(angle), Math.cos(angle))))
    const screenAlignment = 1 - smooth(0.12, 0.48, centerDistance)
    const centerFocus = Math.max(orbitAlignment, screenAlignment)
    const focus =
      smooth(0.55, 0.9, front) *
      smooth(0.96, 1, entry) *
      centerFocus *
      (1 - exit)
    rock.material.uniforms.uOpacity.value = 1
    rock.material.uniforms.uFocus.value = focus
    const projected: { x: number; y: number }[] = []
    const positions = rock.geometry.getAttribute('position')
    for (let i = 0; i < positions.count; i++) {
      point
        .fromBufferAttribute(positions, i)
        .applyMatrix4(rock.matrixWorld)
        .project(camera)
      projected.push({
        x: (point.x * 0.5 + 0.5) * width,
        y: (-point.y * 0.5 + 0.5) * height,
      })
    }
    const hull = silhouetteHull(projected)
    const minX = Math.min(...hull.map((p) => p.x)),
      maxX = Math.max(...hull.map((p) => p.x))
    const minY = Math.min(...hull.map((p) => p.y)),
      maxY = Math.max(...hull.map((p) => p.y))
    link.style.setProperty('--orbit-x', `${minX}px`)
    link.style.setProperty('--orbit-y', `${minY}px`)
    link.style.setProperty('--orbit-width', `${maxX - minX}px`)
    link.style.setProperty('--orbit-height', `${maxY - minY}px`)
    link.style.setProperty('--orbit-label', `${focus}`)
    link.style.setProperty(
      '--orbit-label-x',
      `${Math.min(width - 220, Math.max(8, px - 206)) - minX}px`,
    )
    link.style.setProperty('--orbit-label-y', `${maxY + 4 - minY}px`)
    link.dataset.orbitCentered = String(focus > 0.5)
    link.dataset.fragmentTime = progress.toFixed(3)
    surface.style.setProperty(
      '--fragment-outline',
      `polygon(${hull.map((p) => `${((p.x - minX) / (maxX - minX)) * 100}% ${((p.y - minY) / (maxY - minY)) * 100}%`).join(',')})`,
    )
    // Rear rocks are genuinely occluded by the asteroid, including their hit areas.
    surface.style.setProperty('--orbit-hit', front > 0 ? 'auto' : 'none')
    link.style.zIndex = String(Math.round((front + 1) * 10))
    rock.userData.screenY = py
  })
  return !reduced
}

const debrisMatrix = new THREE.Matrix4()
const debrisPosition = new THREE.Vector3()
const debrisScale = new THREE.Vector3()
const debrisRotation = new THREE.Quaternion()
const debrisScreen = new THREE.Vector3()
const rockScreen = new THREE.Vector3()
const offset = new THREE.Vector3()
const inverseDebris = new THREE.Matrix4()

// Start from the authored transforms each frame: clearance never accumulates.
// Keep both physical and projected separation, so distant particles cannot
// appear to cut through the photographic surfaces either.
export function clearOrbitalDebris(
  debris: THREE.InstancedMesh,
  fragments: ReturnType<typeof createOrbitalFragments>,
  camera: THREE.PerspectiveCamera,
) {
  const originals = (debris.userData.orbitOriginals ??= Array.from(
    { length: debris.count },
    (_, i) => {
      const matrix = new THREE.Matrix4()
      debris.getMatrixAt(i, matrix)
      return matrix
    },
  )) as THREE.Matrix4[]
  const active = fragments.filter(({ rock }) => rock.visible)
  if (!active.length && !debris.userData.orbitClearanceActive) return
  debris.userData.orbitClearanceActive = active.length > 0
  debris.updateWorldMatrix(true, false)
  inverseDebris.copy(debris.matrixWorld).invert()
  if (!debris.geometry.boundingSphere) debris.geometry.computeBoundingSphere()
  for (let i = 0; i < debris.count; i++) {
    originals[i].decompose(debrisPosition, debrisRotation, debrisScale)
    debrisPosition.applyMatrix4(debris.matrixWorld)
    const shardRadius =
      debris.geometry.boundingSphere!.radius *
      Math.max(debrisScale.x, debrisScale.y, debrisScale.z)
    for (let pass = 0; pass < 3; pass++)
      for (const { rock } of active) {
        const rockRadius = rock.geometry.boundingSphere!.radius * rock.scale.x
        const clearance = rockRadius + shardRadius + 1.5
        offset.copy(debrisPosition).sub(rock.position)
        const distance = offset.length()
        if (distance < clearance) {
          if (distance < 0.001) offset.copy(right)
          debrisPosition
            .copy(rock.position)
            .addScaledVector(offset.normalize(), clearance)
        }
        debrisScreen.copy(debrisPosition).project(camera)
        rockScreen.copy(rock.position).project(camera)
        const depth = rock.position.clone().sub(camera.position).dot(direction)
        const shardDepth = debrisPosition
          .clone()
          .sub(camera.position)
          .dot(direction)
        if (depth <= 0 || shardDepth <= 0) continue
        const lens = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)
        const screenClearance =
          rockRadius / (depth * lens) +
          shardRadius / (shardDepth * lens) +
          0.035
        let dx = (debrisScreen.x - rockScreen.x) * camera.aspect
        let dy = debrisScreen.y - rockScreen.y
        const screenDistance = Math.hypot(dx, dy)
        if (screenDistance < screenClearance) {
          if (screenDistance < 0.001) {
            dx = i % 2 ? 1 : -1
            dy = 0.3
          }
          const factor = screenClearance / Math.hypot(dx, dy)
          debrisScreen.x = rockScreen.x + (dx * factor) / camera.aspect
          debrisScreen.y = rockScreen.y + dy * factor
          debrisPosition.copy(debrisScreen).unproject(camera)
        }
      }
    debrisPosition.applyMatrix4(inverseDebris)
    debrisMatrix.compose(debrisPosition, debrisRotation, debrisScale)
    debris.setMatrixAt(i, debrisMatrix)
  }
  debris.instanceMatrix.needsUpdate = true
  debris.computeBoundingSphere()
}
