'use client'

import { Card as FCard } from 'flowbite-react'
import { FC } from 'react'
import CardImage from './card-image'
import Link from 'next-intl/link'

const Card: FC<{
  imageSrc?: string
  imageAlt?: string
  title?: string
  description?: string
  link?: string
  hardRoute?: boolean
}> = ({ imageSrc, imageAlt, title, description, link, hardRoute }) => {
  return (
    <Link href={link || ''} target={hardRoute ? '_blank' : undefined}>
      <FCard
        className="hover:scale-105 relative hover:z-10 transition-all duration-500 overflow-hidden m-auto w-full h-full"
        renderImage={
          imageSrc
            ? () => <CardImage src={imageSrc} alt={imageAlt || ''} />
            : undefined
        }
      >
        <div className="h-full">
          <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h5>
          <p className="font-normal text-gray-700 dark:text-gray-400">
            {description}
          </p>
        </div>
      </FCard>
    </Link>
  )
}

export default Card
