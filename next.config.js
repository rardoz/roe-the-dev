/** @type {import('next').NextConfig} */

const i18n = require('./i18n/config.js')

const nextConfig = {
  i18n,
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/home',
      },
    ]
  },
}

module.exports = nextConfig
