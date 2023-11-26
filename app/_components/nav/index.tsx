'use client'
import { useTransition } from 'react-transition-state'
import React, { PropsWithChildren, useEffect, useState } from 'react'
import Image from 'next/image'
import { UnstyledLink } from '../next-intl'
import Link from 'next/link'
import { FaBars, FaX } from 'react-icons/fa6'
import { Badge } from 'flowbite-react'
import config from '../../../messages/config'
import localeIcons from './locale-icons.json'
import { useInView } from 'react-intersection-observer'

const Nav: React.FC<
  PropsWithChildren<{
    messages: {
      logoAltText: string
      menuIconAltText: string
    }
    forceInView?: boolean
  }>
> = ({ children, messages, forceInView }) => {
  const { ref, inView } = useInView({
    threshold: 1,
  })

  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    if (!inView || forceInView) {
      setIsSticky(true)
    } else {
      setIsSticky(false)
    }
  }, [inView, forceInView])

  const [{ status, isMounted: isMenuActive }, setMenuActive] = useTransition({
    timeout: 300,
    mountOnEnter: true,
    unmountOnExit: true,
    preEnter: true,
    preExit: true,
  })
  const isExiting =
    status === 'preExit' || status === 'exiting' || !isMenuActive
  return (
    <>
      <span ref={ref} className="nav-observer" />
      <nav
        className={`${
          !isSticky ? '' : 'bg-white '
        }z-20 border-gray-200 bg-transparent fixed top-0 w-full transition-color duration-500`}
      >
        <div className="flex flex-wrap items-center justify-between mx-auto p-4 relative">
          <UnstyledLink
            href="/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <Image
              src="/logo.svg"
              width="60"
              height="60"
              loading="eager"
              style={{
                transition: 'transform 0.25s ease-in-out',
                transform: !isSticky ? 'scale(1.5)' : '',
                filter: !isSticky ? 'brightness(100)' : '',
              }}
              alt={messages.logoAltText}
            />
          </UnstyledLink>
          <div className="flex-grow flex justify-end mx-3">
            <Badge color="light" className="p-1.5 rounded-full">
              {config.locales.map((locale, index) => {
                return (
                  <span key={locale}>
                    {index > 0 && ' | '}
                    <Link href={`/${locale}`} hrefLang={locale}>
                      <span className="sr-only">{locale}</span>
                      {(localeIcons as Record<string, string>)[locale]}
                    </Link>
                  </span>
                )
              })}
            </Badge>
          </div>
          <button
            onClick={() => setMenuActive(!isMenuActive)}
            type="button"
            className={`${
              !isSticky ? 'text-white hover:text-gray-500' : 'text-gray-500'
            } transition-all duration-500 inline-flex items-center justify-center p-2 w-10 h-10 text-sm  rounded-lg  hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600`}
            aria-expanded={isMenuActive}
          >
            <span className="sr-only">{messages.menuIconAltText}</span>
            <FaBars className="w-12 h-12" />
          </button>
          <div
            onClick={() => {
              setMenuActive(!isMenuActive)
            }}
            className={`${
              isMenuActive ? 'visible' : 'hidden'
            } fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-40`}
          >
            <ul
              className={`
          ${
            isExiting
              ? 'animate-out slide-out-from-right -right-56'
              : 'animate-in slide-in-from-right right-0'
          }
          duration-300
          w-56 absolute
          h-full
          flex
          flex-col
          font-medium
        bg-gray-50
        dark:bg-gray-800
        dark:border-gray-700
      `}
            >
              <li className="flex items-center justify-end p-4">
                <button
                  onClick={() => setMenuActive(!isMenuActive)}
                  type="button"
                  className="inline-flex items-center justify-center p-2 w-10 h-10 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                  aria-expanded={isMenuActive}
                >
                  <span className="sr-only">{messages.menuIconAltText}</span>
                  <FaX className="h-12 w-12" />
                </button>
              </li>
              {children}
            </ul>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Nav
