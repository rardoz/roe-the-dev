import React from 'react'
import NextIntlLink from 'next-intl/link'
import type { NextIntlLinkProps } from './types'

const Link: React.FC<NextIntlLinkProps> = ({ className, ...props }) => {
  return (
    <NextIntlLink
      {...props}
      className={`ml-2 text-sm py-1 transition-colors duration-500 text-pink-500 hover:text-pink-400 ${
        className || ''
      }`}
    />
  )
}

export default Link
