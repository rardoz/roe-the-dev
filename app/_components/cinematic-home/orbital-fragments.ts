import * as THREE from 'three'
import type { EditorialItem } from './content'
import { smooth } from './motion'
import { silhouetteHull } from './about-motion'
import { rockGeometry, asteroidMaterial } from './asteroid'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// Closed sculpted rocks with welded smooth normals and an all-sided photo material.
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
        vec3 weights=pow(abs(normalize(vLocalNormal)),vec3(4.));
        weights/=max(dot(weights,vec3(1.)),.0001);
        vec3 image=photoAt(p.zy)*weights.x+photoAt(p.xz)*weights.y+photoAt(p.xy)*weights.z;
        float gray=dot(image,vec3(.2126,.7152,.0722));
        float photograph=gray*(.18+uFocus*.10)*(.38+lit*.62);
        gl_FragColor=vec4(vec3(mix(min(value,1.)*uBrightness,photograph,.86)),uOpacity);
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
        material.uniforms.uCrop.value.set(
          Math.min(1, 1 / ratio),
          Math.min(1, ratio),
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
const box = new THREE.Box3()
const size = new THREE.Vector3()

export function updateOrbitalFragments(
  fragments: ReturnType<typeof createOrbitalFragments>,
  camera: THREE.PerspectiveCamera,
  container: HTMLElement,
  asteroid: THREE.Group,
  progress: number,
  dt: number,
  reduced: boolean,
) {
  const width = window.innerWidth,
    height = window.innerHeight
  const opacity = 1 - smooth(0.285, 0.315, progress)
  const state = fragments[0]?.rock.userData
  if (!state) return false
  if (progress < 0.12 || opacity < 0.005) {
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
  const hovering = fragments.some(({ index }) =>
    container
      .querySelector(`[data-fragment="${index}"]`)
      ?.matches('[data-orbit-centered="true"]:hover'),
  )
  if (!reduced && !holdingFocus && !hovering)
    state.time = (state.time || 0) + dt
  const requested = holdingFocus
    ? (-focused.index * Math.PI * 2) / 3
    : (state.time || 0) * 0.006 + (Math.max(0.19, progress) - 0.19) * 42
  const current = state.angle ?? requested
  const delta = Math.atan2(
    Math.sin(requested - current),
    Math.cos(requested - current),
  )
  state.angle = current + delta * (1 - Math.exp(-dt * 3))
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
    const focus = smooth(0.975, 0.998, front) * smooth(0.96, 1, entry)
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
      if (index === 0) point.set(-horizontal, 0.65, point.z)
      else if (index === 1) point.set(0.3, -vertical, point.z)
      else point.set(horizontal, 0.85, point.z)
      point.unproject(camera)
      rock.position.copy(point).lerp(destination, entry)
    }
    link.dataset.orbitEntry = entry.toFixed(3)
    rock.quaternion.copy(camera.quaternion)
    rock.rotateY(Math.sin(angle) * 0.85)
    rock.rotateX(-0.16 + Math.sin(angle * 2) * 0.18)
    rock.rotateZ(
      Math.sin(angle + index) * 0.22 + (1 - entry) * [-0.65, 0.5, 0.7][index],
    )
    rock.scale.setScalar(radius * (width < 700 ? 0.36 : 0.42))
    rock.material.uniforms.uOpacity.value = opacity
    rock.material.uniforms.uFocus.value = focus
    rock.updateMatrixWorld()
    point.copy(rock.position).project(camera)
    const px = (point.x * 0.5 + 0.5) * width,
      py = (-point.y * 0.5 + 0.5) * height
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
      `${Math.min(width - 220, Math.max(24, px - 100)) - minX}px`,
    )
    link.style.setProperty(
      '--orbit-label-y',
      `${Math.min(height - 155, maxY + 18) - minY}px`,
    )
    link.dataset.orbitCentered = String(focus > 0.5)
    link.dataset.fragmentTime = (state.time || 0).toFixed(2)
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
