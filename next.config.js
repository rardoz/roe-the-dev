/** @type {import('next').NextConfig} */
const nextTranslate = require('next-translate-plugin')
const i18n = require("./i18n")

const nextConfig = {
  i18n: {
    locales: i18n.locales,
    defaultLocale: i18n.defaultLocale,
  },
  async rewrites() {
    
    return [
      {
        source: '/',
        destination: '/home',
      }
    ]
  },
}

module.exports = nextTranslate(nextConfig)
