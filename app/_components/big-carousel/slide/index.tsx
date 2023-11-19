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
      <div className="h-full w-full absolute -z-10 top-0 left-0">
        <Image
          src={featuredImage?.url || ''}
          alt={featuredImage?.description || featuredImage?.title || ''}
          quality={100}
          fill
          className="object-cover object-center"
        />
      </div>
      <div className="h-full w-full absolute top-0 left-0  bg-gradient-to-t from-slate-900 bg-opacity-20 z-0"></div>
      <div className="z-10 mx-5">
        <h2 className="text-5xl font-extrabold text-pink-500">{title}</h2>
        <p className="text-4xl mt-2 text-slate-50">{description}</p>
        <div className="mt-4 text-right underline underline-offset-4 font-bold ">
          <Link
            className="text-xl text-pink-500 hover:bg-pink-500 duration-500 transition-colors p-2 hover:text-slate-50"
            target={hardRoute ? '_blank' : undefined}
            href={slug || ''}
          >
            See&nbsp;
            {title}
          </Link>
        </div>
      </div>
    </div>
  )
}
export default CarouselSlide
