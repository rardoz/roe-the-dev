'use server'

import { useTranslations } from 'next-intl'

const NavLinks = () => {
  const t = useTranslations('Nav')
  return (
    <>
      <ul className="w-56 flex flex-col font-medium mt-4 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
        <li>
          <a
            href="#"
            className="block py-2 px-3 text-white bg-blue-700 rounded dark:bg-blue-600"
            aria-current="page"
          >
            {t('portfolio')}
          </a>
        </li>
        <li>
          <a
            href="#"
            className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            {t('blog')}
          </a>
        </li>
        <li>
          <a
            href="#"
            className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white"
          >
            {t('experiments')}
          </a>
        </li>
      </ul>
    </>
  )
}

export default NavLinks
