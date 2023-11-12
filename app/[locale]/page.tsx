import { useTranslations } from 'next-intl'
import Nav from '../_components/nav'
import NavLinks from '../_components/nav/nav-links'
import H1 from '../_components/h1'

export default function Home() {
  const homeTranslations = useTranslations('Home')
  const commonTranslations = useTranslations('Nav')
  return (
    <>
      <Nav
        messages={{
          logoAltText: commonTranslations('logoAltText'),
          menuIconAltText: commonTranslations('menuIconAltText'),
        }}
      >
        <NavLinks />
      </Nav>
      <main className="h-100 flex flex-col items-center justify-between p-4">
        <H1>{homeTranslations('title')}</H1>
      </main>
    </>
  )
}
