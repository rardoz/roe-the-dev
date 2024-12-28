'use client'
import React, { createContext, PropsWithChildren, useState } from 'react'

export const lockPageContext = createContext({ page: 0 } as any)
const { Provider } = lockPageContext

const LockPageProvider: React.FC<PropsWithChildren<{ lockId: string }>> = ({
  children,
  lockId,
}) => {
  const [state] = useState<{
    lockId: string
    paths: string
    isLoading: boolean
  }>({
    lockId,
    paths: '',
    isLoading: false,
  })

  return <Provider value={{ ...state }}>{children}</Provider>
}
export default LockPageProvider
