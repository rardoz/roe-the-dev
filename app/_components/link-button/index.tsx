import React from 'react'
import Link from 'next-intl/link'
import { NextIntlLinkProps } from '../link/types'
1
const LinkButton: React.FC<NextIntlLinkProps> = ({ className, ...props }) => {
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
