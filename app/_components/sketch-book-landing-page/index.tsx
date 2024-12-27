import React from 'react'
import SketchBook from '../sketch-book'
import HR from '../hr'
import Link from 'next/link'
import Discussion from '../discussion'
import { useTranslations } from 'next-intl'
import LinkButton from '../link-button'

const SketchBookLandingPage: React.FC<{ locale: string }> = ({ locale }) => {
  const translations = useTranslations('SketchBook')

  return (
    <>
      <SketchBook />
      <div className="flex justify-center">
        <LinkButton href="sketch-book-playground">
          {translations('cta')}
        </LinkButton>
      </div>
      <div className="flex justify-center  px-4">
        <p className="max-w-lg text-center text-xs mt-5">
          {translations('cta-notice')}
        </p>
      </div>

      <div className="flex justify-center  px-4">
        <p className="max-w-lg text-center text-xs my-5">
          <strong>{translations('eta')}</strong> {0} {translations('minutes')}
        </p>
      </div>
      <div className="max-w-4xl mx-auto px-4">
        <HR />
        <h2 className="text-2xl -mt-4 underline">
          {translations('faq-title')}
        </h2>
        <p className="mt-8">{translations('faq-1')}</p>
        <br />
        <p>{translations('faq-2')}</p>
        <br />
        <p>{translations('faq-3')}</p>
        <br />
        <p>{translations('faq-4')}</p>
        <br />
        <br />
        <p>
          {translations('sta')}{' '}
          <Link href="/experiment/sketchbook-experiment">
            {translations('sta-link')}
          </Link>{' '}
          {translations('farewell')}
        </p>
      </div>
      <div className="px-4 py-10 max-w-4xl mx-auto">
        <HR />
        <Discussion
          slug="sketch-book-vol-1"
          title={translations('discussion-title')}
          contentType="experiment"
          locale={locale}
        />
      </div>
    </>
  )
}

export default SketchBookLandingPage
