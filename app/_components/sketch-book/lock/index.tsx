import React from 'react'
import SectionTitle from '../../section-title'
import LinkButton from '../../link-button'
import MiniPagePreview from '../../sketch-book-playground/components/mini-page-preview'

const SketchBookLockPage: React.FC<{ page: number }> = ({ page }) => {
  return (
    <div className="">
      <div className="flex justify-center mt-10">
        <MiniPagePreview pageNumber={page} />
      </div>
      <SectionTitle>Almost there!</SectionTitle>
      <div className="flex justify-center mt-5">
        <ul className="list-disc mx-6">
          <li className="">
            Take note of your code or bookmark the page so you can get back to
            it later.
          </li>
          <li className="">
            The bigger the device you are drawing on, the better of an
            experience you will have.
          </li>
          <li className="">Save frequently</li>
          <li className="">Unlock the page when you are done.</li>
        </ul>
      </div>
      <div className="flex justify-center mt-10">
        <LinkButton href="2">
          <>
            <input type="checkbox" readOnly checked className="mr-2" />I promise
            that I wont be an a-hole.
          </>
        </LinkButton>
      </div>
    </div>
  )
}

export default SketchBookLockPage
