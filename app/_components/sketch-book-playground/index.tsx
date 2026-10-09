'use client'
import React from 'react'
import dynamic from 'next/dynamic'
import LockPageProvider from '../sketch-book/lock/context'
const JsDraw = dynamic(() => import('./components/js-draw'), { ssr: false })
//import { useTranslations } from 'next-intl'

const SketchBookPlayground: React.FC<{
  locale: string
  lockId: string
  code: string
}> = ({ lockId, code }) => {
  //const translations = useTranslations('SketchBook')
  return (
    <div>
      <React.Suspense fallback={'loading...'}>
        <LockPageProvider lockId={lockId} code={code}>
          <JsDraw />
        </LockPageProvider>
      </React.Suspense>
    </div>
  )
}

export default SketchBookPlayground
