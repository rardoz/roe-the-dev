import { useTranslations } from 'next-intl'
import Nav from '../_components/nav'
import NavLinks from '../_components/nav/nav-links'
import H1 from '../_components/h1'

export default function Home() {
  const homeTranslations = useTranslations('Home')
  const navTranslations = useTranslations('Nav')
  return (
    <>
      <Nav
        messages={{
          logoAltText: navTranslations('logoAltText'),
          menuIconAltText: navTranslations('menuIconAltText'),
        }}
      >
        <NavLinks>
          <a
            href="#"
            className="block py-2 px-3 text-white bg-blue-700 rounded dark:bg-blue-600"
            aria-current="page"
          >
            {navTranslations('portfolio')}
          </a>
          <a
            href="#"
            className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            {navTranslations('blog')}
          </a>
          <a
            href="#"
            className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white"
          >
            {navTranslations('experiments')}
          </a>
        </NavLinks>
      </Nav>
      <main className="h-100 flex flex-col items-center justify-between p-4">
        <H1>{homeTranslations('title')}</H1>
      </main>
    </>
  )
}
