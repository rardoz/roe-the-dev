import styles from './style.module.css'

export function SoundIcon() {
  return (
    <svg
      viewBox="0 0 1000 1000"
      fill="none"
      aria-hidden="true"
      className={styles['sound-icon']}
    >
      <g
        fill="currentColor"
        stroke="currentColor"
        strokeLinejoin="miter"
        strokeLinecap="square"
      >
        <path
          className={styles['sound-wave-outer']}
          d="M350 171 C272 223 259 351 342 390"
          strokeWidth="37"
          fill="none"
        />
        <path
          className={styles['sound-wave-middle']}
          d="M401 222 C351 268 344 332 364 355"
          strokeWidth="33"
          fill="none"
        />
        <path
          className={styles['sound-wave-inner']}
          d="M445 264 C417 292 411 328 429 344"
          strokeWidth="29"
          fill="none"
        />
        <path
          className={styles['sound-wave-outer']}
          d="M650 171 C728 223 741 351 658 390"
          strokeWidth="37"
          fill="none"
        />
        <path
          className={styles['sound-wave-middle']}
          d="M599 222 C649 268 656 332 636 355"
          strokeWidth="33"
          fill="none"
        />
        <path
          className={styles['sound-wave-inner']}
          d="M555 264 C583 292 589 328 571 344"
          strokeWidth="29"
          fill="none"
        />
        <path d="M500 48 L485 252 H515 Z" stroke="none" />
        <circle cx="500" cy="297" r="51" stroke="none" />
        <path d="M483 346 L322 834" strokeWidth="26" />
        <path d="M517 346 L678 834" strokeWidth="26" />
        <path d="M500 362 V836" strokeWidth="30" />
        <path d="M468 836 V503 L500 483 L532 503 V836" strokeWidth="23" />
        <path d="M402 596 L470 533 M598 596 L530 533" strokeWidth="24" />
        <path d="M374 694 L468 616 M626 694 L532 616" strokeWidth="24" />
        <path
          d="M342 793 L418 727 H466 M658 793 L582 727 H534"
          strokeWidth="25"
        />
        <path d="M290 859 H435 M565 859 H710" strokeWidth="27" />
        <path d="M247 898 H753" strokeWidth="31" />
      </g>
    </svg>
  )
}
