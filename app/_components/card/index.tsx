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
}> = ({ imageSrc, imageAlt, title, description, link }) => {
  return (
    <Link href={link || ''}>
      <FCard
        className="max-w-sm overflow-hidden m-auto w-full h-full"
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
