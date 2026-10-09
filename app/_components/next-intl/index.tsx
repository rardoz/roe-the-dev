import { createNavigation } from 'next-intl/navigation'

import config from '../../../messages/config'

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation({
    locales: config.locales,
  })

import { ComponentProps } from 'react'

export function UnstyledLink({ href, ...rest }: ComponentProps<typeof Link>) {
  return <Link href={href} {...rest} />
}

export function StyledLink({
  className,
  ...rest
}: ComponentProps<typeof Link>) {
  return (
    <UnstyledLink
      {...rest}
      className={`transition-colors duration-500 text-pink-500 hover:text-pink-400 ${
        className || ''
      }`}
    />
  )
}
