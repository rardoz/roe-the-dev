import React from 'react'
import Link from 'next-intl/link'
import { NextIntlLinkProps } from '../link/types'
1
const IconLinkButton: React.FC<NextIntlLinkProps & { altText: string }> = ({
  className,
  children,
  altText,
  ...props
}) => {
  return (
    <Link
      {...props}
      className={`w-12 h-12 justify-center mx-1 my-1 flex items-center transition-colors duration-500 hover:bg-pink-600 text-white bg-purple-700 rounded-full dark:bg-blue-600 ${
        className || ''
      }`}
    >
      <div className="sr-only">{altText}</div>
      {children}
    </Link>
  )
}

export default IconLinkButton