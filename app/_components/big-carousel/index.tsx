'use client'
import { Carousel } from 'flowbite-react'
import React from 'react'

const BigCarousel: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ className, children }) => {
  return (
    <div className={`h-screen flex w-full ${className ?? ''}`}>
      <Carousel
        theme={{ control: { base: 'hidden' } }}
        leftControl=""
        rightControl=""
      >
        {children}
      </Carousel>
    </div>
  )
}

export default BigCarousel
