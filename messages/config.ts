import { Pathnames } from 'next-intl/navigation'

const localePrefix: 'as-needed' | 'always' | 'never' | undefined = 'as-needed'

export const locales = ['en-US', 'es-US']
//test

export type AppPathname = Pathnames<typeof locales>

export const pathnames = {
  '/blog': '/blog',
  '/blog/[slug]': '/blog/[slug]',
  '/portfolio': '/portfolio',
  '/portfolio/[slug]': '/portfolio/[slug]',
  '/experiment': '/experiment',
  '/experiment/[slug]': '/experiment/[slug]',
  '/experiment/[slug]/sketch-book-vol-1-playground':
    '/experiment/[slug]/sketch-book-vol-1-playground',
  '/lottie-winters-kinky-salad-model-game':
    '/lottie-winters-kinky-salad-model-game',
} satisfies AppPathname

export type AppPathnames = keyof typeof pathnames

const config = {
  locales,
  defaultLocale: 'en-US',
  localePrefix,
  pathnames,
}

export default config
