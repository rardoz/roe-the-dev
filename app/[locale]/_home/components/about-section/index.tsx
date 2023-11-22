import LinkButton from '../../../../_components/link-button'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import SectionTitle from '../../../../_components/section-title'
import { FaEnvelope } from 'react-icons/fa6'

const AboutSection = () => {
  const t = useTranslations('About')
  return (
    <>
      <SectionTitle>{t('title')}</SectionTitle>
      <div className="w-3/4 lg:w-1/2">
        <div className="flex justify-center items-start flex-wrap sm:flex-nowrap">
          <div className="flex-shrink-0 px-4 mb-4">
            <Image
              src="/roe-profile-pic.png"
              className="rounded-full border-8 border-white drop-shadow-lg hover:drop-shadow-xl hover:scale-105 transition-all duration-500 ease-in-out"
              alt="about"
              width={250}
              height={250}
            />
            <div className="flex lg:hidden justify-center items-center mt-5">
              <LinkButton
                href="mailto:roethedev@gmail.com"
                className=" py-2 px-4"
              >
                <FaEnvelope className="inline-block mr-2" />
                {t('cta')}
              </LinkButton>
            </div>
          </div>
          <div className="flex-shrink flex-grow px-4 text-center sm:text-left">
            <h3 className="font-semibold pb-4 text-lg">{t('subtitle')}</h3>
            <p>{t('description1')}</p>
            <p className="my-4">{t('description2')}</p>
            <div className="hidden lg:block mt-8">
              <LinkButton href="mailto:roethedev@gmail.com">
                <FaEnvelope className="inline-block mr-2" />
                {t('cta')}
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AboutSection
