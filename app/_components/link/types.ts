import React from 'react'

export type NextIntlLinkProps = Omit<
  Omit<
    Omit<
      Omit<
        React.AnchorHTMLAttributes<HTMLAnchorElement>,
        keyof {
          href: string | import('url').UrlObject
          as?: (string | import('url').UrlObject) | undefined
          replace?: boolean | undefined
          scroll?: boolean | undefined
          shallow?: boolean | undefined
          passHref?: boolean | undefined
          prefetch?: boolean | undefined
          locale?: string | false | undefined
          legacyBehavior?: boolean | undefined
          onMouseEnter?: React.MouseEventHandler<HTMLAnchorElement> | undefined
          onTouchStart?: React.TouchEventHandler<HTMLAnchorElement> | undefined
          onClick?: React.MouseEventHandler<HTMLAnchorElement> | undefined
        }
      > & {
        href: string | import('url').UrlObject
        as?: (string | import('url').UrlObject) | undefined
        replace?: boolean | undefined
        scroll?: boolean | undefined
        shallow?: boolean | undefined
        passHref?: boolean | undefined
        prefetch?: boolean | undefined
        locale?: string | false | undefined
        legacyBehavior?: boolean | undefined
        onMouseEnter?: React.MouseEventHandler<HTMLAnchorElement> | undefined
        onTouchStart?: React.TouchEventHandler<HTMLAnchorElement> | undefined
        onClick?: React.MouseEventHandler<HTMLAnchorElement> | undefined
      } & {
        children?: React.ReactNode
      } & React.RefAttributes<HTMLAnchorElement>,
      'locale'
    > & {
      locale: string
    },
    'ref'
  > &
    React.RefAttributes<HTMLAnchorElement>,
  'locale'
> & {
  locale?: any
} & {
  ref?: React.Ref<HTMLAnchorElement> | undefined
}

export default NextIntlLinkProps
