import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { NormalizedBlogData } from '@/app/_services/contentful/types'

const CarouselSlide: React.FC<NormalizedBlogData> = ({
  title,
  featuredImage,
  description,
  slug,
  hardRoute,
}) => {
  return (
    <div className="h-full relative flex justify-center items-center">
      <div className="h-full w-full absolute -z-10">
        <Image
          src={featuredImage?.url || ''}
          alt={featuredImage?.description || featuredImage?.title || ''}
          quality={100}
          fill
          className="object-cover object-center"
        />
      </div>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
        <div>
          <Link target={hardRoute ? '_blank' : undefined} href={slug || ''}>
            See&nbsp;
            {title}
          </Link>
        </div>
      </div>
    </div>
  )
}
export default CarouselSlide
