'use client'
import React, { useEffect } from 'react'
import SectionTitle from '../../section-title'
import MiniPagePreview from '../../sketch-book-playground/components/mini-page-preview'
import SketchBookProvider, { PAGE_COUNT } from '../context'
import ConfirmBtn from './confirm-btn'
import { useRouter } from 'next/navigation'
const SketchBookLockPage: React.FC<{ page: number }> = ({ page }) => {
  const router = useRouter()
  useEffect(() => {
    if (page > PAGE_COUNT || page < 1) {
      router.replace('/error?coode=page-count-count')
    }
  }, [page])

  return (
    <React.Suspense fallback={'loading...'}>
      <SketchBookProvider page={page} includePageBg>
        <div className="">
          <div className="flex justify-center mt-10">
            <MiniPagePreview />
          </div>
          <SectionTitle>Almost there!</SectionTitle>
          <div className="flex justify-center mt-5">
            <ul className="list-disc mx-6">
              <li className="">
                Take note of your code or bookmark the page so you can get back
                to it later.
              </li>
              <li className="">
                The bigger the device you are drawing on, the better of an
                experience you will have.
              </li>
              <li className="">Save frequently</li>
              <li className="">Unlock the page when you are done.</li>
            </ul>
          </div>
          <ConfirmBtn page={page} />
        </div>
      </SketchBookProvider>
    </React.Suspense>
  )
}

export default SketchBookLockPage
