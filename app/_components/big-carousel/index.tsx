'use client'
import { Carousel, theme } from 'flowbite-react'
import React from 'react'

const BigCarousel: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ className, children }) => {
  return (
    <div className={`h-screen border-white flex w-full ${className ?? ''}`}>
      <Carousel
        theme={{
          control: { base: 'hidden' },
          scrollContainer: {
            base: theme.carousel.scrollContainer.base + ' rounded-none',
          },
        }}
        leftControl=""
        rightControl=""
      >
        {children}
      </Carousel>
    </div>
  )
}

export default BigCarousel
