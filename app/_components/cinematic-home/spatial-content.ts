import * as THREE from 'three'
import type { EditorialItem } from './content'
import {
  clamp,
  filmState,
  mix,
  POST_FRAME,
  postsFormation,
  postsPose,
  smooth,
} from './motion'

const vertex = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`
const fragment = `uniform sampler2D uMap;uniform float uColor;uniform float uOpacity;varying vec2 vUv;void main(){vec4 tex=texture2D(uMap,vUv);float gray=dot(tex.rgb,vec3(.2126,.7152,.0722));gl_FragColor=vec4(mix(vec3(gray),tex.rgb,uColor),uOpacity);\n#include <colorspace_fragment>\n}`

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  width: number,
) {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (context.measureText(candidate).width > width && line) {
      lines.push(line)
      line = word
    } else line = candidate
  }
  if (line) lines.push(line)
  return lines
}

function copyTexture(item: EditorialItem, displayFont: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 440
  const context = canvas.getContext('2d')
  if (context) {
    context.fillStyle = '#080808'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#e9e6df'
    context.font = `56px ${displayFont}`
    let y = 65
    wrapText(context, item.title, 700)
      .slice(0, 3)
      .forEach((line) => {
        context.fillText(line, 40, y)
        y += 60
      })
    context.font = '35px Arial'
    context.fillStyle = '#b0b0aa'
    y += 20
    wrapText(context, item.description, 700)
      .slice(0, Math.max(1, Math.min(3, Math.floor((385 - y) / 40))))
      .forEach((line) => {
        context.fillText(line, 40, y)
        y += 40
      })
    context.strokeStyle = '#817f75'
    context.lineWidth = 2
    context.beginPath()
    context.moveTo(40, 409)
    context.lineTo(655, 409)
    context.moveTo(694, 414)
    context.lineTo(731, 377)
    context.lineTo(731, 404)
    context.moveTo(731, 377)
    context.lineTo(703, 377)
    context.stroke()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function frameGeometry() {
  const lines: number[] = []
  const add = (x1: number, y1: number, x2: number, y2: number) =>
    lines.push(x1, y1, 0.014, x2, y2, 0.014)
  const chamfered = (width: number, height: number, step: number) => {
    const x = width / 2,
      y = height / 2
    const corners = [
      [-x + step, -y],
      [x - step, -y],
      [x, -y + step],
      [x, y - step],
      [x - step, y],
      [-x + step, y],
      [-x, y - step],
      [-x, -y + step],
    ]
    corners.forEach((corner, index) => {
      const next = corners[(index + 1) % corners.length]
      add(corner[0], corner[1], next[0], next[1])
    })
  }
  chamfered(1.035, 1.2, 0.035)
  chamfered(1.075, 1.24, 0.045)
  chamfered(1.125, 1.29, 0.075)
  // Stepped corner brackets with fan rays.
  for (const sx of [-1, 1])
    for (const sy of [-1, 1]) {
      const x = sx * 0.585,
        y = sy * 0.66
      add(x, y - sy * 0.13, x, y)
      add(x, y, x - sx * 0.13, y)
      add(x - sx * 0.02, y - sy * 0.1, x - sx * 0.02, y - sy * 0.02)
      add(x - sx * 0.1, y - sy * 0.02, x - sx * 0.02, y - sy * 0.02)
      for (const spread of [0.05, 0.09, 0.13])
        add(
          sx * 0.5175,
          sy * 0.6,
          sx * (0.5175 + spread * 0.55),
          sy * (0.6 + spread * 0.55),
        )
    }
  const diamond = (cx: number, cy: number, size: number) => {
    add(cx, cy + size, cx + size, cy)
    add(cx + size, cy, cx, cy - size)
    add(cx, cy - size, cx - size, cy)
    add(cx - size, cy, cx, cy + size)
  }
  diamond(0, 0.645, 0.03)
  diamond(0, -0.645, 0.03)
  diamond(0, 0.645, 0.015)
  diamond(0, -0.645, 0.015)
  for (const side of [-1, 1]) {
    diamond(side * 0.56, 0, 0.026)
    add(side * 0.54, 0.09, side * 0.54, 0.26)
    add(side * 0.54, -0.09, side * 0.54, -0.26)
    add(side * 0.19, 0.645, side * 0.36, 0.645)
    add(side * 0.19, -0.645, side * 0.36, -0.645)
    add(side * 0.4, 0.655, side * 0.4, 0.635)
    add(side * 0.4, -0.655, side * 0.4, -0.635)
  }
  // Separator between the image and the copy.
  add(-0.5, -0.0075, -0.04, -0.0075)
  add(0.04, -0.0075, 0.5, -0.0075)
  return new THREE.BufferGeometry().setAttribute(
    'position',
    new THREE.Float32BufferAttribute(lines, 3),
  )
}

export function createSpatialContent(
  items: EditorialItem[],
  scene: THREE.Scene,
  namespace: string,
  onLoad: () => void,
  displayFont: string,
) {
  const loader = new THREE.TextureLoader()
  loader.setCrossOrigin('anonymous')
  const frames = items.map((item, index) => {
    const group = new THREE.Group()
    const placeholder = new THREE.DataTexture(
      new Uint8Array([26, 26, 26, 255]),
      1,
      1,
    )
    placeholder.needsUpdate = true
    const imageMaterial = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uMap: { value: placeholder },
        uColor: { value: 0 },
        uOpacity: { value: 1 },
      },
      side: THREE.DoubleSide,
      transparent: namespace === 'posts',
    })
    const image = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 0.61),
      imageMaterial,
    )
    image.position.set(0, 0.295, 0.006)
    const title = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 0.55),
      new THREE.MeshBasicMaterial({
        map: copyTexture(item, displayFont),
        side: THREE.DoubleSide,
        transparent: namespace === 'posts',
      }),
    )
    title.position.set(0, -0.295, 0.007)
    const frame = new THREE.LineSegments(
      frameGeometry(),
      new THREE.LineBasicMaterial({
        color: '#b9b8b0',
        transparent: namespace === 'posts',
      }),
    )
    const back = new THREE.Mesh(
      new THREE.PlaneGeometry(1.035, 1.2),
      new THREE.MeshBasicMaterial({
        color: '#070707',
        side: THREE.DoubleSide,
        transparent: namespace === 'posts',
      }),
    )
    back.position.z = -0.003
    group.add(back, image, title, frame)
    group.userData.index = index
    group.userData.namespace = namespace
    scene.add(group)
    loader.load(
      item.image,
      (texture) => {
        if (group.userData.disposed) {
          texture.dispose()
          return
        }
        texture.colorSpace = THREE.SRGBColorSpace
        imageMaterial.uniforms.uMap.value = texture
        placeholder.dispose()
        group.userData.loaded = true
        onLoad()
      },
      undefined,
      () => {
        if (!group.userData.disposed) group.userData.loaded = false
      },
    )
    return { group, imageMaterial }
  })
  return frames
}

export function updateSpatialContent(
  frames: ReturnType<typeof createSpatialContent>,
  camera: THREE.PerspectiveCamera,
  progress: number,
  mobile: boolean,
  namespace: 'posts' | 'projects',
  container: HTMLElement,
) {
  const isPosts = namespace === 'posts'
  const start = isPosts ? 0.155 : 0.67
  const duration = isPosts ? 0.14 : 0.215
  const cursor = isPosts
    ? 0
    : clamp((progress - start) / duration) * Math.max(0, frames.length - 1)
  const active = Math.round(cursor)
  const z = isPosts ? 28 : 48
  const direction = camera.getWorldDirection(new THREE.Vector3())
  const center = camera.position
    .clone()
    .add(
      direction.multiplyScalar(
        (camera.position.z - z) / Math.max(0.01, -direction.z),
      ),
    )
  const distance = camera.position.distanceTo(center)
  let reach: number | undefined
  let width =
    2 *
    distance *
    Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) *
    camera.aspect *
    (mobile ? 0.73 : 0.27)
  const viewportHeight = window.innerHeight
  const landscape = !mobile && viewportHeight <= 500
  const worldPerPixel =
    (2 * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)) /
    viewportHeight
  if (isPosts) {
    const viewportWidth = window.innerWidth
    const formation = postsFormation(mobile, frames.length)
    const section = container.querySelector<HTMLElement>('#film-posts')
    const heading = section?.querySelector<HTMLElement>('h2')
    const link = section?.querySelector<HTMLElement>(':scope > a')
    // Layout offsets ignore the scroll-driven rise transform on the heading.
    const safeTop = landscape
      ? 57
      : (heading ? heading.offsetTop + heading.offsetHeight : 130) + 14
    const safeBottom = landscape
      ? viewportHeight - 57
      : Math.max(
          safeTop + 160,
          (link ? link.offsetTop : viewportHeight - (mobile ? 112 : 52)) - 14,
        )
    const reservedSides = landscape ? 0.28 * viewportWidth : mobile ? 16 : 56
    const pixels = Math.min(
      (safeBottom - safeTop) / formation.extent.height,
      (viewportWidth - 2 * reservedSides) / formation.extent.width,
      viewportWidth * (mobile ? 1 : 0.3),
    )
    width = pixels * worldPerPixel
    // Cards are staged beyond the viewport edge, whatever the card size.
    reach = viewportWidth / 2 / pixels + POST_FRAME.width / 2 + 0.15
    center.addScaledVector(
      camera.up,
      (viewportHeight / 2 - (safeTop + safeBottom) / 2) * worldPerPixel,
    )
  } else if (landscape) {
    width = Math.min(width, ((viewportHeight - 114) * worldPerPixel) / 1.28)
  } else {
    const section = container.querySelector(
      `#film-${isPosts ? 'posts' : 'portfolio'}`,
    )
    const headingBottom =
      section?.querySelector('h2')?.getBoundingClientRect().bottom || 130
    const subtitleBottom =
      section?.querySelector('p')?.getBoundingClientRect().bottom ||
      headingBottom
    const linkTop =
      section?.querySelector(':scope > a')?.getBoundingClientRect().top ||
      viewportHeight - (mobile ? 112 : 52)
    const safeTop = Math.max(headingBottom, subtitleBottom) + 20
    const safeBottom = Math.max(safeTop + 160, linkTop - 20)
    width = Math.min(width, ((safeBottom - safeTop) * worldPerPixel) / 1.28)
    const halfHeight = (width / worldPerPixel) * 0.64
    const centerY = Math.max(
      safeTop + halfHeight,
      Math.min(viewportHeight / 2, safeBottom - halfHeight),
    )
    center.addScaledVector(
      camera.up,
      (viewportHeight / 2 - centerY) * worldPerPixel,
    )
  }
  const projected = new THREE.Vector3()
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
  let animating = false
  frames.forEach(({ group, imageMaterial }, index) => {
    const element = container.querySelector<HTMLElement>(
      `[data-spatial-card="${namespace}-${index}"]`,
    )
    const pointerX = Number(element?.style.getPropertyValue('--pointer-x') || 0)
    const pointerY = Number(element?.style.getPropertyValue('--pointer-y') || 0)
    group.userData.pointerX = mix(group.userData.pointerX || 0, pointerX, 0.25)
    group.userData.pointerY = mix(group.userData.pointerY || 0, pointerY, 0.25)
    const offset = index - cursor
    const absolute = Math.abs(offset)
    const pose = isPosts
      ? postsPose(index, frames.length, progress, mobile, reach)
      : null
    const sectionOpacity = isPosts ? filmState(progress).postsCardsOpacity : 1
    const opacity = pose ? pose.opacity * sectionOpacity : 1
    const visible = isPosts
      ? opacity > 0.004
      : progress > 0.645 && progress < 0.915
    group.visible = isPosts
      ? visible
      : visible && absolute < (mobile ? 2.1 : 2.7)
    const centerWeight = 1 - smooth(0.22, 0.72, absolute)
    if (pose) {
      group.position
        .copy(center)
        .addScaledVector(right, pose.x * width)
        .addScaledVector(camera.up, -pose.y * width)
      group.quaternion.copy(camera.quaternion)
    } else {
      const angle = offset * 1.13
      const x = Math.sin(angle) * width * 1.3
      group.position.set(
        mix(x, x * 0.18, centerWeight),
        center.y + offset * width * 0.72 * smooth(0.5, 1.15, absolute),
        Math.cos(angle) * z,
      )
      group.quaternion.copy(camera.quaternion)
      group.rotateY(-Math.sin(angle) * 0.55)
    }
    group.scale.setScalar(width)
    group.rotateY(group.userData.pointerX * 0.035)
    group.rotateX(group.userData.pointerY * -0.028)
    const frameMaterial = (group.children[3] as THREE.LineSegments)
      .material as THREE.LineBasicMaterial
    frameMaterial.color.setScalar(
      0.68 + Math.min(1, Math.abs(pointerX) + Math.abs(pointerY)) * 0.24,
    )
    if (pose) {
      // Hover, focus, and activation fade the image into color regardless of position.
      const engaged =
        !!element &&
        (element.matches(':hover, :focus') ||
          element.dataset.engaged === 'true')
      const target = engaged ? 1 : 0
      const engage = mix(group.userData.engage || 0, target, 0.16)
      group.userData.engage = Math.abs(engage - target) < 0.01 ? target : engage
      if (group.userData.engage !== target) animating = true
      imageMaterial.uniforms.uColor.value = Math.max(
        pose.color,
        group.userData.engage,
      )
      imageMaterial.uniforms.uOpacity.value = opacity
      group.children.forEach((child) => {
        const material = (child as THREE.Mesh | THREE.LineSegments)
          .material as THREE.Material
        if (material !== imageMaterial) material.opacity = opacity
      })
    } else imageMaterial.uniforms.uColor.value = 1 - smooth(0.12, 0.7, absolute)
    group.updateMatrixWorld()
    if (!element) return
    projected.copy(group.position).project(camera)
    const topLeft = new THREE.Vector3(-0.55, 0.65, 0)
      .applyMatrix4(group.matrixWorld)
      .project(camera)
    const bottomRight = new THREE.Vector3(0.55, -0.65, 0)
      .applyMatrix4(group.matrixWorld)
      .project(camera)
    const px = (projected.x * 0.5 + 0.5) * window.innerWidth
    const py = (-projected.y * 0.5 + 0.5) * window.innerHeight
    element.style.setProperty('--projected-x', `${px}px`)
    element.style.setProperty('--projected-y', `${py}px`)
    element.style.setProperty(
      '--projected-width',
      `${Math.abs(topLeft.x - bottomRight.x) * 0.5 * window.innerWidth}px`,
    )
    element.style.setProperty(
      '--projected-height',
      `${Math.abs(topLeft.y - bottomRight.y) * 0.5 * window.innerHeight}px`,
    )
    element.dataset.worldPosition = JSON.stringify(
      group.position.toArray().map((value) => +value.toFixed(3)),
    )
    element.dataset.visible = `${group.visible}`
    element.dataset.loaded = `${Boolean(group.userData.loaded)}`
    element.dataset.rotation = JSON.stringify(
      group.rotation
        .toArray()
        .slice(0, 3)
        .map((value) =>
          typeof value === 'number' ? +value.toFixed(4) : value,
        ),
    )
    element.style.pointerEvents = pose
      ? group.visible && pose.interactive && sectionOpacity > 0.7
        ? 'auto'
        : 'none'
      : group.visible && index === active
        ? 'auto'
        : 'none'
    element.dataset.opacity = opacity.toFixed(3)
    element.dataset.color = (
      imageMaterial.uniforms.uColor.value as number
    ).toFixed(3)
  })
  return animating
}
