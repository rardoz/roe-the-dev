import React from 'react'
import Carousel from '../carousel'
const BigCarousel: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ className, children }) => {
  return (
    <Carousel className={`h-screen flex w-full ${className ?? ''}`}>
      {children}
    </Carousel>
  )
}

export default BigCarousel
