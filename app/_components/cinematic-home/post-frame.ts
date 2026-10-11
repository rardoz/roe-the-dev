export const POST_ORNAMENT = { width: 1.178, height: 1.35 }

export function editorialFrameLines() {
  const lines: number[] = []
  const add = (x1: number, y1: number, x2: number, y2: number) =>
    lines.push(x1, y1, 0.014, x2, y2, 0.014)
  for (const [width, height, step] of [
    [1.035, 1.2, 0.035],
    [1.075, 1.24, 0.045],
    [1.125, 1.29, 0.075],
  ]) {
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
    corners.forEach((corner, i) => {
      const next = corners[(i + 1) % corners.length]
      add(corner[0], corner[1], next[0], next[1])
    })
  }
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
  const diamond = (x: number, y: number, size: number) => {
    add(x, y + size, x + size, y)
    add(x + size, y, x, y - size)
    add(x, y - size, x - size, y)
    add(x - size, y, x, y + size)
  }
  for (const y of [-0.645, 0.645]) {
    diamond(0, y, 0.03)
    diamond(0, y, 0.015)
  }
  for (const side of [-1, 1]) {
    diamond(side * 0.56, 0, 0.026)
    add(side * 0.54, 0.09, side * 0.54, 0.26)
    add(side * 0.54, -0.09, side * 0.54, -0.26)
    add(side * 0.19, 0.645, side * 0.36, 0.645)
    add(side * 0.19, -0.645, side * 0.36, -0.645)
    add(side * 0.4, 0.655, side * 0.4, 0.635)
    add(side * 0.4, -0.655, side * 0.4, -0.635)
  }
  add(-0.5, -0.0075, -0.04, -0.0075)
  add(0.04, -0.0075, 0.5, -0.0075)
  return lines
}

export const editorialFramePath = () => {
  const lines = editorialFrameLines()
  const segments: string[] = []
  for (let i = 0; i < lines.length; i += 6)
    segments.push(
      `M${lines[i]} ${-lines[i + 1]}L${lines[i + 3]} ${-lines[i + 4]}`,
    )
  return segments.join('')
}
