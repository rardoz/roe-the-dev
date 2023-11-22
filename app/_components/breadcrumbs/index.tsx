import { FC } from 'react'
import Link from '../link'
import { FaChevronRight, FaHouseChimney } from 'react-icons/fa6'

const BreadCrumbs: FC<{
  links: { label: string; href: string }[]
}> = ({ links }) => {
  return (
    <div className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
        <li className="inline-flex items-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium"
          >
            <FaHouseChimney className="w-3 h-3 me-2.5 text-pink-600" />
            Home
          </Link>
        </li>
        {links.map((link, i) => (
          <li className="inline-flex items-center" key={i}>
            <FaChevronRight className={`mx-1 w-3 h-3 text-pink-600`} />
            {i === links.length - 1 ? (
              <span className="ms-1 text-sm font-medium text-purple-600">
                {link.label}
              </span>
            ) : (
              <Link href={link.href} className="ms-1 text-sm font-medium">
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
