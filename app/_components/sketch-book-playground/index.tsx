'use client'
import React from 'react'
import SketchBook from '../sketch-book'
import { Button } from 'flowbite-react'
import HR from '../hr'
import Link from 'next/link'

const SketchBookPlayground: React.FC = () => {
  return (
    <>
      <SketchBook />
      <div className="flex justify-center">
        <Button color={'pink'}>Lock for 60 minutes</Button>
      </div>
      <div className="flex justify-center  px-4">
        <p className="max-w-lg text-center text-xs mt-5">
          Locking the scketchbook allows you to add to the pages.
          <br /> After 60 minutes, the lock will remove automatically and you
          will not be able to make any more changes until the sketchbook is
          available again.
        </p>
      </div>

      <div className="flex justify-center  px-4">
        <p className="max-w-lg text-center text-xs my-5">
          <strong>Estimated wait time:</strong> {0} seconds
        </p>
      </div>
      <div className="max-w-4xl mx-auto px-4">
        <HR />
        <h2 className="text-2xl -mt-4 underline">How it works</h2>
        <p className="mt-8">
          The sketchbook is a shared space where you can draw on the pages. You
          can lock the sketchbook to prevent others from drawing on the pages.
          You can also unlock the sketchbook to allow others to draw on the
          pages. The sketchbook will automatically unlock after 60 minutes.
        </p>
        <br />
        <p>
          Everything is completely anonymous. No personal data is stored. If you
          want to mark your name on the sketchbook though, you are free to do so
          at your own risk.
        </p>
        <br />
        <p>
          I have the ability to edit what is in the sketchbook, so please keep
          it respectful. I will be monitoring the sketchbook to ensure that it
          is a safe and fun place for everyone.
        </p>
        <br />
        <p>
          There are only 10 pages available in the sketchbook. I am happy to add
          more pages if there is interest.
        </p>
        <br />
        <br />
        <p>
          Find out more about{' '}
          <Link href="/experiment/sketchbook-experiment">the project here</Link>
          . Happy sketching! 🎨
        </p>
      </div>
    </>
  )
}

export default SketchBookPlayground
