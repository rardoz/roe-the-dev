let context: CanvasRenderingContext2D | null | undefined

export function headingInkBottom(heading: HTMLElement) {
  const label = heading.querySelector<HTMLElement>('[data-heading-label]')
  const baseline = heading.querySelector<HTMLElement>('[data-heading-baseline]')
  if (!label || !baseline) return heading.offsetHeight
  if (context === undefined)
    context = document.createElement('canvas').getContext('2d')
  if (!context) return heading.offsetHeight
  const style = getComputedStyle(label)
  context.font = style.font
  const metrics = context.measureText(label.firstChild?.textContent || '')
  if (!Number.isFinite(metrics.actualBoundingBoxDescent))
    return heading.offsetHeight
  return (
    baseline.getBoundingClientRect().top -
    heading.getBoundingClientRect().top +
    metrics.actualBoundingBoxDescent
  )
}
