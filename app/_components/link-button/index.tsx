import React from 'react'
import { UnstyledLink } from '../next-intl'

const LinkButton: React.FC<
  React.PropsWithChildren<{
    className?: string
    href: typeof UnstyledLink | string
    target?: string
    rel?: string
  }>
> = ({ className, href, ...props }) => {
  return (
    <UnstyledLink
      href={href}
      {...props}
      className={`inline-flex justify-center items-center bg-purple-700 text-white font-bold py-2 px-4 rounded-full hover:bg-pink-600 transition-all duration-500 ease-in-out ${
        className || ''
      }`}
    />
  )
}

export default LinkButton
