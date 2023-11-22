import type { FC } from 'react'
import Image from 'next/image'
import { FaChevronDown } from 'react-icons/fa6'

const Hero: FC<{
  imageSrc?: string
  imageDescription?: string
  title?: string
  description?: string
  chevron?: boolean
}> = ({ imageSrc, imageDescription, title, description, chevron = true }) => {
  return (
    <div className="h-screen w-full relative bg-opacity-30 bg-black items-center">
      {imageSrc && (
        <Image
          src={imageSrc}
          loading="eager"
          alt={imageDescription || ''}
          fill
          className="bg-purple-950 object-cover absolute top-0 -z-10"
        />
      )}
      <div className="h-full flex justify-center items-center">
        <div className="flex justify-center px-2 flex-col md:items-center max-w-screen-2xl mx-2 md:mx-auto py-5">
          {title && (
            <h1 className="text-left md:text-center text-white font-extrabold text-5xl sm:text-7xl md:text-8xl">
              {title}
            </h1>
          )}
          {description && (
            <p className="border-l-white border-l-8 ps-8 ml-2 my-6 text-white font-bold text-2xl md:text-3xl text-left md:text-center">
              <span>{description}</span>
            </p>
          )}
          {chevron && (
            <a href="#main-section" className="-ml-2 md:ml-0">
              <FaChevronDown className="animate-bounce text-white text-4xl" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default Hero
