'use client'
import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react'
import { SketchDocument } from '../../../../models/sketch'

export const sketchBookContext = createContext({ page: 0 } as any)
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
  PropsWithChildren<{ page: number; includePageBg?: boolean }>
> = ({ children, page, includePageBg }) => {
  const [state, setState] = useState<{
    page: number
    paths: string
    isLoading: boolean
  }>({
    page: page,
    paths: '',
    isLoading: false,
  })
  const isLoading = state.isLoading

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
          page_number: page,
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
    [page],
  )

  const getPage = React.useCallback((page: number) => {
    console.log('getting page', page)

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

              .join(''),
            includePageBg || false,
          ),
        }))
      })
      .catch((e) => {
        console.error(e)
        setState((prevState) => ({ ...prevState, isLoading: false }))
      })
  }, [])

  useEffect(() => {
    if (!isLoading) {
      //setState((prev) => ({ ...prev, isLoading: true }))
      getPage(page)
    }
  }, [getPage, page, isLoading])

  return <Provider value={{ ...state, savePage }}>{children}</Provider>
}
export default SketchBookProvider
