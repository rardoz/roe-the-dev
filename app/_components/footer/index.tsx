import type { FC } from 'react'
import {
  FaEnvelope,
  FaGithub,
  FaLinkedin,
  FaTwitch,
  FaXTwitter,
} from 'react-icons/fa6'
import Link from '../link'
import IconLinkButton from '../icon-link-button'

const FOOTER_LINKS = [
  {
    icon: <FaGithub />,
    url: 'https://github.com/rardoz',
    alt: 'Github',
  },
  {
    icon: <FaLinkedin />,
    url: 'https://linkedin.com/in/rardoz',
    alt: 'Linkedin',
  },
  {
    icon: <FaXTwitter />,
    url: 'https://twitter.com/roe_the_dev',
    alt: 'X Twitter',
  },
  {
    icon: <FaTwitch />,
    url: 'https://twitch.tv/roe_the_dev',
    alt: 'Twitch',
  },
  {
    icon: <FaEnvelope />,
    url: 'mailto:roethedev@gmail.com',
    alt: 'Email',
  },
]

const Footer: FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-purple-900 text-white py-20">
      <div className="flex flex-col justify-center items-center max-w-screen-2xl px-4 mx-auto">
        <div className="flex justify-center items-center flex-wrap mb-4">
          {FOOTER_LINKS.map(({ icon, url, alt }, index) => {
            return (
              <IconLinkButton
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                altText={alt}
              >
                {icon}
              </IconLinkButton>
            )
          })}
        </div>
        <p className="text-sm py-1">
          &copy; {currentYear}&nbsp;
          <Link
            href="https://byrojo.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            byrojo.com
          </Link>
        </p>
      </div>
    </footer>
  )
}

export default Footer
