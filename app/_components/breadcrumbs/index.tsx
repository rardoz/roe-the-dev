import { FC } from 'react'
import Link from '../link'
import { FaChevronRight, FaHouseChimney } from 'react-icons/fa6'
import { UnstyledLink } from '../next-intl'

const BreadCrumbs: FC<{
  links: ({ href: typeof UnstyledLink | string } & { label: string })[]
}> = ({ links }) => {
  return (
    <div className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex flex-wrap items-start space-x-1 md:space-x-2 rtl:space-x-reverse">
        <li className="inline-flex items-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium"
          >
            <FaHouseChimney className="w-3 h-3 me-1 text-pink-500" />
            Home
          </Link>
        </li>
        {links.map((link, i) => (
          <li className="inline-flex items-center me-1" key={i}>
            <FaChevronRight className={`me-1 w-3 h-3 text-pink-500`} />
            {i === links.length - 1 ? (
              <span className="text-sm font-medium text-purple-500">
                {link.label}
              </span>
            ) : (
              <Link href={link.href} className="text-sm font-medium">
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}

export default BreadCrumbs
