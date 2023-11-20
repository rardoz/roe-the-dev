import React from 'react'
import styles from './style.module.css'

const Code: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div>
      <div className={styles.code}>{children}</div>
      <div className={styles.playground}>
        <div className={styles.btn}>
          <button>run</button>
          <button>reset</button>
        </div>
        <iframe className={styles.iframe1} />
      </div>
    </div>
  )
}

export default Code
