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

const SketchBookProvider: React.FC<
  PropsWithChildren<{
    page?: number
    includePageBg?: boolean
    lockId?: string
    code?: string
  }>
> = ({ children, page }) => {
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

  const getPage = React.useCallback((page: number) => {
    fetch(`/api/sketch/${page}`)
      .then((response) => {
        return response.json()
      })
      .then((data: SketchDocument) => {
        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          paths: data?.sketch_paths || '',
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

  return <Provider value={{ ...state }}>{children}</Provider>
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
