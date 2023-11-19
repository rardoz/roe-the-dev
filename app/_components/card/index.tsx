'use client'

import { Card as FCard } from 'flowbite-react'
import Image from 'next/image'

const Card = () => {
  return (
    <FCard
      className="max-w-sm overflow-hidden m-auto"
      renderImage={() => (
        <div className="relative min-h-96 min-h-[24rem]">
          <Image
            fill
            objectFit="cover"
            src="/roe-profile-pic.png"
            alt="Roe pr"
          />
        </div>
      )}
    >
      <div className="h-full">
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Noteworthy technology acquisitions 2021
        </h5>
        <p className="font-normal text-gray-700 dark:text-gray-400">
          Here are the biggest enterprise technology acquisitions of 2021 so
          far, in reverse chronological order.
        </p>
      </div>
    </FCard>
  )
}

export default Card
