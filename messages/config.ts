import { Pathnames } from 'next-intl/navigation'

const localePrefix: 'as-needed' | 'always' | 'never' | undefined = 'as-needed'

export const locales = ['en-US', 'es-US']

export type AppPathname = Pathnames<typeof locales>

export const pathnames = {
  '/blog': '/blog',
  '/blog/[slug]': '/blog/[slug]',
  '/portfolio': '/portfolio',
  '/portfolio/[slug]': '/portfolio/[slug]',
  '/experiment': '/experiment',
  '/': { 'en-US': '/', 'es-US': '/' },
} satisfies AppPathname

export type AppPathnames = keyof typeof pathnames

const config = {
  locales,
  defaultLocale: 'en-US',
  localePrefix,
  pathnames,
}

export default config
