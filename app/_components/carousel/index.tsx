'use client'
import { Carousel as FCarousel, theme } from 'flowbite-react'
import React from 'react'

const Carousel: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  className,
  children,
}) => {
  return (
    <div className={`${className ?? ''}`}>
      <FCarousel
        slideInterval={5000}
        draggable
        theme={{
          control: {
            base: theme.carousel.control.base + ' hidden sm:inline-flex',
          },
          scrollContainer: {
            snap: 'snap-x',
            base:
              theme.carousel.scrollContainer.base +
              ' rounded-none overflow-hidden',
          },
        }}
      >
        {children}
      </FCarousel>
    </div>
  )
}

export default Carousel
