'use client'
import React, {
  createContext,
  PropsWithChildren,
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
  const [result, setResult] = useState<{
    requestKey: string
    pageLockStatus: PageLockStatus[]
  }>()
  const requestKey = (pageNumbers || []).join(',')

  useEffect(() => {
    if (!requestKey) return
    const controller = new AbortController()
    const params = new URLSearchParams()
    requestKey.split(',').forEach((pageNumber) => {
      params.append('page_number', pageNumber)
    })
    fetch(`/api/page-lock?${params.toString()}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data: { page_lock_status: PageLockStatus[] }) => {
        if (!controller.signal.aborted) {
          setResult({ requestKey, pageLockStatus: data.page_lock_status })
        }
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        console.error(error)
        setResult({ requestKey, pageLockStatus: [] })
      })
    return () => controller.abort()
  }, [requestKey])

  const state: LockIndicatorsContext = !requestKey
    ? defaultState
    : {
        isLoading: result?.requestKey !== requestKey,
        pageLockStatus:
          result?.requestKey === requestKey
            ? result.pageLockStatus
            : (pageNumbers || []).map((page_number) => ({
                page_number,
                locked: false,
                end_time: undefined,
                id: undefined,
              })),
      }

  return <Provider value={state}>{children}</Provider>
}
export default LockIndicatorProvider
