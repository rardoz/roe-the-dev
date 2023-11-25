import React, { AnchorHTMLAttributes } from 'react'
import NextlLink, { LinkProps } from 'next/link'

type AppLinkProps = LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>

const Link: React.FC<AppLinkProps> = ({
  className = 'ml-2 text-sm py-1',
  ...props
}) => {
  return (
    <NextlLink
      {...props}
      className={`transition-colors duration-500 text-pink-500 hover:text-pink-400 ${
        className || ''
      }`}
    />
  )
}

export default Link
