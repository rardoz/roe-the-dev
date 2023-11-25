import React from 'react'
import Link, { LinkProps } from 'next/link'

const LinkButton: React.FC<
  React.PropsWithChildren<LinkProps & { className?: string }>
> = ({ className, ...props }) => {
  return (
    <Link
      {...props}
      className={`inline-flex justify-center items-center bg-purple-700 text-white font-bold py-2 px-4 rounded-full hover:bg-pink-600 transition-all duration-500 ease-in-out ${
        className || ''
      }`}
    />
  )
}

export default LinkButton
