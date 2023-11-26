import React from 'react'
import { UnstyledLink } from '../next-intl'

const IconLinkButton: React.FC<
  React.PropsWithChildren<{
    href: typeof UnstyledLink | string
    className?: string
    altText: string
    rel?: HTMLAnchorElement['rel']
    target?: HTMLAnchorElement['target']
  }>
> = ({ className, children, altText, ...props }) => {
  return (
    <UnstyledLink
      {...props}
      className={`w-12 h-12 justify-center mx-1 my-1 flex items-center transition-colors duration-500 hover:bg-pink-600 text-white bg-purple-700 rounded-full dark:bg-blue-600 ${
        className || ''
      }`}
    >
      <div className="sr-only">{altText}</div>
      {children}
    </UnstyledLink>
  )
}

export default IconLinkButton
