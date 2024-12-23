import React from 'react'
import styles from './style.module.css'

interface PageCoverProps {
  pos: string
  children: React.ReactNode
}

const PageCover = React.forwardRef<HTMLDivElement, PageCoverProps>(
  (props, ref) => {
    return (
      <div
        className={[styles.page, styles.cover, styles[props.pos]].join(' ')}
        ref={ref}
        data-density="hard"
      >
        <div>
          <h2>{props.children}</h2>
        </div>
      </div>
    )
  },
)

PageCover.displayName = 'PageCover'
export default PageCover
