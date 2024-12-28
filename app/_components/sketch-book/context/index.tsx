'use client'
import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useState,
  useContext,
} from 'react'
import type { SketchDocument } from '../../../../models/types'
export const PAGE_COUNT = 10
export const sketchBookContext = createContext({ page: 0 } as any)
import { lockPageContext } from '../lock/context'

const { Provider } = sketchBookContext
const imgBg = `<image class="js-draw-image-background" href="/paper.png" width="1821" height="2725" aria-label="" style="transform: matrix(0.2475, 0, 0, 0.22, 0, -0.464309);"></image>`

const getPageTemplate = (normalizedPaths: string, includePageBg: boolean) =>
  `
    <svg
        viewBox="0 0 450 600"
        width="450"
        height="600"
        version="1.1"
        baseProfile="full"
        xmlns="http://www.w3.org/2000/svg"
    >
        <style id="js-draw-style-sheet">
            path{
                stroke-linecap:round;
                stroke-linejoin:round;
            }
            text{
                white-space:pre;
            }
        </style>
        ${includePageBg ? imgBg : ''}
        ${normalizedPaths}
    </svg>`

const SketchBookProvider: React.FC<
  PropsWithChildren<{
    page?: number
    includePageBg?: boolean
    lockId?: string
    code?: string
  }>
> = ({ children, page, includePageBg }) => {
  const [state, setState] = useState<{
    page?: number
    paths: string
    isLoading: boolean
  }>({
    page: page,
    paths: '',
    isLoading: false,
  })
  const isLoading = state.isLoading

  const lockedState = useContext(lockPageContext)

  const finalPage = lockedState?.pageNumber || page
  //we need to keep an eye out for the id they are using and we are going to keep updating the single id insteead of having multipple
  const savePage = React.useCallback(
    (new_paths: string) => {
      setState((prev) => ({ ...prev, isLoading: true }))

      fetch(`/api/sketch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_number: finalPage,
          sketch_paths: new_paths,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (!data.success) throw new Error(data.error)
        })
        .catch((error) => {
          console.error('Failed to save page:', error)
        })
        .finally(() => {
          setState((prev) => ({ ...prev, isLoading: false }))
        })
    },
    [finalPage],
  )

  const getPage = React.useCallback((page: number) => {
    fetch(`/api/sketch/${page}`)
      .then((response) => {
        return response.json()
      })
      .then((data: SketchDocument[]) => {
        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          paths: getPageTemplate(
            data
              .map(({ sketch_paths }) => sketch_paths)

              .join('') + (lockedState.lockedPaths || ''),
            includePageBg || false,
          ),
        }))
      })
      .catch(() => {
        setState((prevState) => ({ ...prevState, isLoading: false }))
      })
  }, [])

  useEffect(() => {
    if (!isLoading && finalPage) {
      //setState((prev) => ({ ...prev, isLoading: true }))
      getPage(finalPage)
    }
  }, [getPage, finalPage, isLoading])

  return <Provider value={{ ...state, savePage }}>{children}</Provider>
}

export const SketchWithHTML: React.FC = () => {
  const { paths } = useContext(sketchBookContext)
  if (paths) {
    return (
      <div className="shadow-lg" dangerouslySetInnerHTML={{ __html: paths }} />
    )
  } else {
    return <div />
  }
}

export default SketchBookProvider
