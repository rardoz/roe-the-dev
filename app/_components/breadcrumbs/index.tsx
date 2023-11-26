import { FC } from 'react'
import Link from '../link'
import { FaChevronRight, FaHouseChimney } from 'react-icons/fa6'
import { UnstyledLink } from '../next-intl'

const BreadCrumbs: FC<{
  links: ({ href: typeof UnstyledLink | string } & { label: string })[]
}> = ({ links }) => {
  return (
    <div className="flex" aria-label="Breadcrumb">
      <ol
        className="inline-flex flex-wrap items-start space-x-1 md:space-x-2 rtl:space-x-reverse"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        <li
          className="inline-flex items-center"
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
        >
          <Link
            href="/"
            itemProp="item"
            className="inline-flex items-center text-sm font-medium"
          >
            <FaHouseChimney className="w-3 h-3 me-1 text-pink-500" />
            <span itemProp="name">Home</span>
          </Link>

          <meta itemProp="position" content="1" />
        </li>
        {links.map((link, i) => (
          <li
            className="inline-flex items-center me-1"
            key={i}
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            <FaChevronRight className={`me-1 w-3 h-3 text-pink-500`} />
            {i === links.length - 1 ? (
              <span
                itemProp="name"
                className="text-sm font-medium text-purple-500"
              >
                {link.label}
              </span>
            ) : (
              <Link
                itemProp="item"
                href={link.href}
                className="text-sm font-medium"
              >
                <span itemProp="name">{link.label}</span>
              </Link>
            )}

            <meta itemProp="position" content={`${i + 2}`} />
          </li>
        ))}
      </ol>
    </div>
  )
}

export default BreadCrumbs
