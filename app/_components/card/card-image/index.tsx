import Image from 'next/image'
import { FC } from 'react'

const CardImage: FC<{ src: string; alt: string }> = ({ src, alt }) => {
  return (
    <div className="relative min-h-96 min-h-[24rem]">
      <Image fill objectFit="cover" src={src} alt={alt} />
    </div>
  )
}

export default CardImage
