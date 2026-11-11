import Image from 'next/image'
import { UnstyledLink } from '../next-intl'
import type { EditorialItem } from './content'
import styles from './style.module.css'

export function OrbitalFeaturettes({ items }: { items: EditorialItem[] }) {
  const wake = () => window.dispatchEvent(new Event('film-card-input'))
  return (
    <div className={styles['orbital-stage']}>
      {items.slice(0, 3).map((item, index) => (
        <UnstyledLink
          key={item.href}
          href={item.href}
          target={item.external ? '_blank' : undefined}
          rel={item.external ? 'noopener noreferrer' : undefined}
          className={styles['orbital-fragment']}
          data-fragment={index}
          data-spatial-card={`posts-${index}`}
          aria-label={item.title}
          onPointerEnter={wake}
          onPointerLeave={wake}
          onFocus={wake}
          onBlur={wake}
        >
          <span className={styles['fragment-surface']} data-fragment-surface>
            <Image
              src={item.image}
              alt={item.imageAlt}
              fill
              sizes="(max-width: 1000px) 85vw, 30vw"
              unoptimized
            />
          </span>
          <span className={styles['fragment-caption']}>
            <span className={styles['fragment-number']} aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <svg
              className={styles['fragment-leader']}
              viewBox="0 0 200 30"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M0 1 H154 L196 26" />
              <path d="m196 22 4 4-4 4-4-4Z" />
            </svg>
            <strong>{item.title}</strong>
          </span>
        </UnstyledLink>
      ))}
    </div>
  )
}
