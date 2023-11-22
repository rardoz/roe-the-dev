import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import { Flowbite } from 'flowbite-react'
import theme from '../_theme'
import { notFound } from 'next/navigation'
import config from '../../messages/config'
import { NextIntlClientProvider } from 'next-intl'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  openGraph: {
    images: ['/default-social-image.png'],
  },
}

export function generateStaticParams() {
  return config.locales.map((locale) => ({ locale }))
}

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  let messages
  try {
    messages = (await import(`../../messages/${locale}.json`)).default
  } catch (error) {
    notFound()
  }

  const isValidLocale = config.locales.some((cur) => cur === locale)
  if (!isValidLocale) notFound()

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <Flowbite theme={{ theme }}>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
          </NextIntlClientProvider>
        </Flowbite>
      </body>
    </html>
  )
}
