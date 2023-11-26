import { createLocalizedPathnamesNavigation } from 'next-intl/navigation'

import config from '../../../messages/config'

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createLocalizedPathnamesNavigation({
    locales: config.locales,
    pathnames: config.pathnames,
  })

import { ComponentProps } from 'react'
import type { AppPathnames } from '../../../messages/config'

export function UnstyledLink<Pathname extends AppPathnames>({
  href,
  ...rest
}: ComponentProps<typeof Link<Pathname | any>>) {
  return <Link href={href} {...rest} />
}

export function StyledLink<Pathname extends AppPathnames>({
  className,
  ...rest
}: ComponentProps<typeof Link<Pathname | any>>) {
  return (
    <UnstyledLink
      {...rest}
      className={`transition-colors duration-500 text-pink-500 hover:text-pink-400 ${
        className || ''
      }`}
    />
  )
}
