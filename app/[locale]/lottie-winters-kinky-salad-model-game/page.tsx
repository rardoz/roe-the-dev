'use client'
import { unstable_setRequestLocale } from 'next-intl/server'
import LottieGame from '../../_components/lottie-game'
import './styles.css'

export default async function LWKSMG() {
  unstable_setRequestLocale('en-US')
  return (
    <div className="lottie-layout">
      <LottieGame />
    </div>
  )
}
