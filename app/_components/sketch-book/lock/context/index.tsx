'use client'
import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react'

export const lockPageContext = createContext({
  lockedPaths: '',
  isLoading: false,
} as any)
const { Provider } = lockPageContext

const LockPageProvider: React.FC<
  PropsWithChildren<{ lockId: string; code: string }>
> = ({ children, lockId, code }) => {
  const [state, setState] = useState<{
    lockedPaths: string
    isLoading: boolean
    pageNumber?: number
    endTime?: Date
  }>({
    lockedPaths: '',
    isLoading: false,
    pageNumber: undefined,
    endTime: undefined,
  })

  const getLockedPage = () => {
    if (state.isLoading) return
    setState({ ...state, isLoading: true })
    fetch(`/api/page-lock/${lockId}/${code}`)
      .then((response) => response.json())
      .then((data: any) => {
        setState({
          ...state,
          isLoading: false,
          lockedPaths: data?.lock?.sketch_doc?.sketch_paths,
          pageNumber: data?.lock?.sketch_doc?.page_number,
          endTime: data?.lock?.endTime,
        })
      })
      .catch((e) => {
        console.error(e)
        setState({
          ...state,
          isLoading: false,
        })
      })
  }

  useEffect(() => {
    getLockedPage()
  }, [])

  return (
    <Provider value={{ ...state, lockId, code }}>
      {!state.isLoading && children}
    </Provider>
  )
}
export default LockPageProvider
