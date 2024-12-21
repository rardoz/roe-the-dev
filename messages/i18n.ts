import { getRequestConfig } from 'next-intl/server'
import { default as config, locales } from './config'

// export default getRequestConfig(async ({ requestLocale }) => ({
//   messages: (await import(`./${requestLocale}.json`)).default,
// }))

export default getRequestConfig(async ({ requestLocale }) => {
  let _locale = await requestLocale
  if (!_locale || locales.includes(_locale as any)) {
    _locale = config.defaultLocale
  }

  return {
    locale: _locale,
    messages: (await import(`./${_locale}.json`)).default,
  }
})
