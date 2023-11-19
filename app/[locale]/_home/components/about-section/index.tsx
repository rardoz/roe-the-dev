import { useTranslations } from 'next-intl'
import Link from 'next-intl/link'
import Image from 'next/image'

const AboutSection = () => {
  const t = useTranslations('About')
  return (
    <div className="w-3/4 lg:w-1/2">
      <h2 className="text-center text-purple-700 text-4xl font-bold">
        {t('title')}
      </h2>
      <hr className="mt-5 mb-16 border-dotted border-spacing-8 border-8 border-t-0 border-purple-300" />
      <div className="flex justify-center items-start flex-wrap sm:flex-nowrap">
        <div className="flex-shrink-0 px-4 mb-4">
          <Image
            src="/roe-profile-pic.png"
            className="rounded-full border-8 border-white drop-shadow-lg hover:drop-shadow-xl hover:scale-105 transition-all duration-500 ease-in-out"
            alt="about"
            width={250}
            height={250}
          />
          <div className=" flex lg:hidden justify-center items-center mt-5">
            <Link
              href="/about"
              className="bg-purple-700 text-white font-bold py-2 px-4 rounded-full hover:bg-pink-600 transition-all duration-500 ease-in-out"
            >
              {t('cta')}
            </Link>
          </div>
        </div>
        <div className="flex-shrink flex-grow px-4 text-center sm:text-left">
          <h3 className="font-semibold pb-4 text-lg">{t('subtitle')}</h3>
          <p>{t('description1')}</p>
          <p className="my-4">{t('description2')}</p>
          <div className="hidden lg:block mt-8">
            <Link
              href="/about"
              className="bg-purple-700 text-white font-bold py-2 px-4 rounded-full hover:bg-pink-600 transition-all duration-500 ease-in-out"
            >
              {t('cta')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutSection
