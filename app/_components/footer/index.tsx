import type { FC } from 'react'
import {
  FaEnvelope,
  FaGithub,
  FaLinkedin,
  FaTwitch,
  FaXTwitter,
} from 'react-icons/fa6'

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
      <div className="flex flex-col justify-center items-center max-w-screen-2xl px-4">
        <div className="flex justify-center items-center flex-wrap mb-4">
          {FOOTER_LINKS.map(({ icon, url, alt }, index) => {
            return (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mx-1 my-1 py-3 px-3 flex items-center transition-colors duration-500 hover:bg-pink-600 text-white bg-purple-700 rounded-full dark:bg-blue-600"
              >
                <div className="sr-only">{alt}</div>
                {icon}
              </a>
            )
          })}
        </div>
        <p className="text-sm py-1">
          &copy; {currentYear}
          <a
            href="https://byrojo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-sm py-1 transition-colors duration-500 text-pink-500 hover:text-pink-400"
          >
            byrojo.com
          </a>
        </p>
      </div>
    </footer>
  )
}

export default Footer
