import React, { FC } from 'react'
import { Card } from 'flowbite-react'
import SectionTitle from './components/section-title'

const BlogSection: FC = () => {
  return (
    <div className="w-full max-w-screen-2xl mt-10">
      <SectionTitle />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4">
        <Card />
        <Card />
        <Card />
      </div>
    </div>
  )
}

export default BlogSection
