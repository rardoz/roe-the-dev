import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Flowbite } from 'flowbite-react'
import theme from './_theme'
//import createTranslation from 'next-translate/createTranslation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Roe the Dev',
  description: '',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  //  const { lang } = createTranslation() // default namespace (optional)

  return (
    <html lang="en">
      <body className={inter.className}>
        <Flowbite theme={{ theme }}>{children}</Flowbite>
      </body>
    </html>
  )
}
