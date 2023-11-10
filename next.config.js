/** @type {import('next').NextConfig} */

const il8n = require('./il8n/config.js')

const nextConfig = {
  il8n,
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
