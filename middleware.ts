import createMiddleware from 'next-intl/middleware'
import messagesConfig from './messages/config'

export default createMiddleware({
  // A list of all locales that are supported
  locales: messagesConfig.locales,
  // Used when no locale matches
  defaultLocale: messagesConfig.defaultLocale,
  localePrefix: messagesConfig.localePrefix,
  pathnames: messagesConfig.pathnames,
})

export const config = {
  // Match only internationalized pathnames
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
