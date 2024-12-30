'use client'
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react'

interface LockIndicatorsContext {
  pageLockStatus: PageLockStatus[]
  isLoading?: boolean
}

interface PageLockStatus {
  page_number: number | undefined
  locked: boolean | false
  end_time: Date | undefined
  id: string | undefined
}

const defaultState: LockIndicatorsContext = {
  pageLockStatus: [],
  isLoading: false,
}

export const lockIndicatorsContext = createContext(defaultState)
const { Provider } = lockIndicatorsContext

const LockIndicatorProvider: React.FC<
  PropsWithChildren<{ pageNumbers?: number[] }>
> = ({ children, pageNumbers }) => {
  const [state, setState] = useState<LockIndicatorsContext>(
    {} as LockIndicatorsContext,
  )

  const getPagesStatus = useCallback(() => {
    if (state.isLoading) return

    setState({
      ...state,
      isLoading: true,
      pageLockStatus: (pageNumbers || []).map(
        (num) =>
          ({
            page_number: num,
            locked: false,
          }) as PageLockStatus,
      ),
    })
    const params = new URLSearchParams()
    pageNumbers?.forEach((pageNumber) => {
      params.append('page_number', pageNumber.toString()) // Add each page number separately
    })

    fetch(`/api/page-lock?${params.toString()}`)
      .then((response) => response.json())
      .then((data: { page_lock_status: PageLockStatus[] }) => {
        setState({
          ...state,
          isLoading: false,
          pageLockStatus: data.page_lock_status,
        })
      })
      .catch((e) => {
        console.error(e)
        setState({
          ...state,
          isLoading: false,
        })
      })
  }, [state, pageNumbers])

  useEffect(() => {
    if (pageNumbers?.length) getPagesStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumbers])

  return <Provider value={state}>{children}</Provider>
}
export default LockIndicatorProvider
