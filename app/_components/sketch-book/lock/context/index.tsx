'use client'
import { useRouter } from 'next/navigation'
import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react'

interface LockPageState {
  isLoading: boolean
  paths?: string
  pageNumber?: number
  endTime?: Date
}

interface SaveLockedPageResponse {
  success: boolean
  message?: string
  lock?: {
    sketch_doc?: {
      sketch_paths?: string
      page_number?: number
    }
    endTime?: Date
  }
}

interface LockPageContextValue extends LockPageState {
  lockId?: string
  code?: string
  lockedPaths?: string
  // eslint-disable-next-line no-unused-vars
  saveLockedPage: (paths: string) => void
}

interface LockPageProviderProps {
  children: React.ReactNode
  lockId?: string
  code?: string
}

export const lockPageContext = createContext<LockPageContextValue>({
  lockedPaths: '',
  isLoading: false,
  saveLockedPage: () => {},
})
const { Provider } = lockPageContext

const LockPageProvider: React.FC<PropsWithChildren<LockPageProviderProps>> = ({
  children,
  lockId,
  code,
}) => {
  const router = useRouter()
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
      .then((data: SaveLockedPageResponse) => {
        if (data.success === false) {
          throw new Error(data.message)
        }
        setState({
          ...state,
          isLoading: false,
          lockedPaths: data?.lock?.sketch_doc?.sketch_paths || '',
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
        router.replace('/error')
      })
  }

  useEffect(() => {
    getLockedPage()
  }, [])

  //do not trigger a state change here... we dont want to accidently trigger a re-render
  const saveLockedPage = (allLockedPagePaths = '') => {
    if (state.isLoading) return
    fetch(`/api/page-lock/${lockId}/${code}`, {
      method: 'POST',
      body: JSON.stringify({ paths: allLockedPagePaths }),
    })
      .then((response) => response.json())
      .then((data: any) => {
        if (data.success === false) {
          throw new Error(data.message)
        }
        alert('Page saved successfully!')
      })
      .catch((e) => {
        console.error(e)
        alert('There was an error saving your page.')
      })
  }

  return (
    <Provider value={{ ...state, lockId, code, saveLockedPage }}>
      {!state.isLoading && children}
    </Provider>
  )
}
export default LockPageProvider
