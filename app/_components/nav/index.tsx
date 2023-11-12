'use client'

import React, { PropsWithChildren, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FaBars } from 'react-icons/fa'

const Nav: React.FC<
  PropsWithChildren<{
    messages: { logoAltText: string; menuIconAltText: string }
  }>
> = ({ children, messages }) => {
  const [isMenuActive, setMenuActive] = useState(false)

  return (
    <nav className="border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 sticky top-0">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4 relative">
        <Link
          href="/"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <Image
            src="/logo.svg"
            width="60"
            height="60"
            loading="eager"
            alt={messages.logoAltText}
          />
        </Link>
        <button
          onClick={() => setMenuActive(!isMenuActive)}
          type="button"
          className="inline-flex items-center justify-center p-2 w-10 h-10 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          aria-controls="navbar-hamburger"
          aria-expanded={isMenuActive}
        >
          <span className="sr-only">{messages.menuIconAltText}</span>
          <FaBars className="w-5 h-5" />
        </button>
        <div className={`${isMenuActive ? 'visible' : 'hidden'}  w-screen`}>
          {children}
        </div>
      </div>
    </nav>
  )
}

export default Nav
