import {
  clamp,
  documentFilmOffset,
  documentFilmProgress,
  mix,
  smooth,
} from './motion'

export const atmosphereStart = 0.315
export const aboutResume = 0.3
export const aboutReplay = atmosphereStart - aboutResume

export function filmScrollFrame(
  offset: number,
  length: number,
  postsExtra = 0,
  atmosphereDistance = 0,
) {
  const start = documentFilmOffset(atmosphereStart, length, postsExtra)
  const atmosphere =
    atmosphereDistance > 0
      ? Math.max(0, (offset - start) / atmosphereDistance)
      : 1
  const before = offset <= start || atmosphereDistance === 0
  const aboutReady = !before && offset >= start + atmosphereDistance
  const progress = before
    ? documentFilmProgress(offset, length, postsExtra)
    : aboutReady
      ? clamp(
          aboutResume +
            (offset - start - atmosphereDistance) / Math.max(1, length),
        )
      : aboutResume
  return {
    progress,
    postsProgress: before ? progress : Math.max(atmosphereStart, progress),
    sceneProgress:
      before || aboutReady
        ? progress
        : mix(atmosphereStart, aboutResume, smooth(0, 1, atmosphere)),
    atmosphere: before ? -1 : atmosphere,
    aboutReady: atmosphereDistance === 0 || aboutReady,
  }
}

export function filmScrollOffset(
  progress: number,
  length: number,
  postsExtra = 0,
  atmosphereDistance = 0,
) {
  return (
    documentFilmOffset(progress, length, postsExtra) +
    (progress > aboutResume ? atmosphereDistance + length * aboutReplay : 0)
  )
}
