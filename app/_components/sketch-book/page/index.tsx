'use client'
import React from 'react'
import styles from './style.module.css'

interface PageProps {
  density?: 'hard' | 'soft' | string
  number: number
  image: string
  children: React.ReactNode
}

function intToRoman(num: number): string {
  const values: { value: number; symbol: string }[] = [
    { value: 1000, symbol: 'M' },
    { value: 900, symbol: 'CM' },
    { value: 500, symbol: 'D' },
    { value: 400, symbol: 'CD' },
    { value: 100, symbol: 'C' },
    { value: 90, symbol: 'XC' },
    { value: 50, symbol: 'L' },
    { value: 40, symbol: 'XL' },
    { value: 10, symbol: 'X' },
    { value: 9, symbol: 'IX' },
    { value: 5, symbol: 'V' },
    { value: 4, symbol: 'IV' },
    { value: 1, symbol: 'I' },
  ]

  let roman: string = ''

  for (const { value, symbol } of values) {
    while (num >= value) {
      roman += symbol
      num -= value
    }
  }

  return roman
}

const Page = React.forwardRef<HTMLDivElement, PageProps>((props, ref) => {
  return (
    <div
      className={[styles.page].join('h-full')}
      ref={ref as React.RefObject<HTMLDivElement>}
      data-density={props.density || 'soft'}
    >
      <div className="h-full">{props.children}</div>
      <div className="text-center text-xs w-full absolute bottom-0 text-gray-500">
        {intToRoman(props.number)}
      </div>
    </div>
  )
})

Page.displayName = 'Page'

export default Page
