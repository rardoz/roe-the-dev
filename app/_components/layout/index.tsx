import React from 'react'
import { useTranslations } from 'next-intl'
import Nav from '../nav'
import NavLinks from '../nav/nav-links'
import { PiTelevisionBold } from 'react-icons/pi'
import { GiEvilBook } from 'react-icons/gi'
import { SiTestinglibrary } from 'react-icons/si'
import Link from 'next/link'
import { PropsWithChildren } from 'react'

const DefaultLayout: React.FC<
  PropsWithChildren<{ params?: { locale: string } }>
> = ({ params, children }) => {
  const navTranslations = useTranslations('Nav')
  const links = [
    {
      label: navTranslations('portfolio'),
      icon: <PiTelevisionBold className="mr-1.5" />,
      url: `/${params?.locale || ''}/portfolio`,
    },
    {
      label: navTranslations('blog'),
      icon: <GiEvilBook className="mr-1.5" />,
      url: `/${params?.locale || ''}/blog`,
    },
    {
      label: navTranslations('experiments'),
      icon: <SiTestinglibrary className="mr-1.5" />,
      url: `/${params?.locale || ''}/experiments`,
    },
  ]
  return (
    <>
      <Nav
        messages={{
          logoAltText: navTranslations('logoAltText'),
          menuIconAltText: navTranslations('menuIconAltText'),
        }}
      >
        <NavLinks>
          {links.map(({ url, label, icon }, index) => {
            return (
              <Link
                key={index}
                href={url}
                className="mx-4 mb-4 py-2 px-3 flex items-center transition-colors duration-500 hover:bg-pink-600 text-white bg-purple-700 rounded-full dark:bg-blue-600"
              >
                {icon}
                {label}
              </Link>
            )
          })}
        </NavLinks>
      </Nav>
      <main className="h-100 flex flex-col items-center justify-between py-2">
        {children}
      </main>
    </>
  )
}

export default DefaultLayout