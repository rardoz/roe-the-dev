import React from 'react'
import { PropsWithChildren } from 'react'

const NavLinks: React.FC<PropsWithChildren<{}>> = ({ children = [] }) => {
  return (
    <>
      {Array.isArray(children) ? (
        children.map((child, index) => <li key={index}>{child}</li>)
      ) : (
        <li>{children}</li>
      )}
    </>
  )
}

export default NavLinks
