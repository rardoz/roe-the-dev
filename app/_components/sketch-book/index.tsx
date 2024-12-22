'use client'
import React from 'react'
import HTMLFlipBook from 'react-pageflip'
import styles from './style.module.css'
const pageCount = 10
interface PageCoverProps {
  pos: string
  children: React.ReactNode
}

const PageCover = React.forwardRef<HTMLDivElement, PageCoverProps>(
  (props, ref) => {
    return (
      <div
        className={[
          styles.page,
          styles['page-cover'],
          styles['page-cover-' + props.pos],
        ].join(' ')}
        ref={ref}
        data-density="hard"
      >
        <div className={styles['page-content']}>
          <h2>{props.children}</h2>
        </div>
      </div>
    )
  },
)
PageCover.displayName = 'PageCover'

interface PageProps {
  density?: 'hard' | 'soft' | string
  number: number
  image: string
  children: React.ReactNode
}

const Page = React.forwardRef<HTMLDivElement, PageProps>((props, ref) => {
  return (
    <div
      className={styles.page}
      ref={ref as React.RefObject<HTMLDivElement>}
      data-density={props.density || 'soft'}
    >
      <div className={styles['page-content']}>
        <h2 className={styles['page-header']}>Page header - {props.number}</h2>
        <div
          className={styles['page-image']}
          style={{ backgroundImage: 'url(images/html/' + props.image + ')' }}
        ></div>
        <div className={styles['page-text']}>{props.children}</div>
        <div className={styles['page-footer']}>{props.number + 1}</div>
      </div>
    </div>
  )
})

Page.displayName = 'Page'

interface PassportState {
  page: number
  totalPage: number
  orientation: string
  state: string
  pages: React.ReactNode[]
}

export default class Passport extends React.Component<{}, PassportState> {
  flipBook: any
  constructor(props: {}) {
    super(props)

    const pages = [
      <PageCover key={0} pos="top">
        {''}
      </PageCover>,
    ]

    let pageNum = 0
    for (let i = 0; i < pageCount; i++) {
      pageNum++
      if (pageNum > 8) pageNum = 1
      pages.push(
        <Page key={i + 1} image={pageNum + '.jpg'} number={i + 1}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. In cursus
          mollis nibh, non convallis ex convallis eu. Suspendisse potenti.
          Aenean vitae pellentesque erat.
        </Page>,
      )
    }

    pages.push(
      <PageCover key={101} pos="bottom">
        THE END
      </PageCover>,
    )

    this.state = {
      page: 0,
      totalPage: 0,
      orientation: 'landscape',
      state: 'read',
      pages: pages,
    }
  }

  nextButtonClick = () => {
    this.flipBook.pageFlip().flipNext()
  }

  prevButtonClick = () => {
    this.flipBook.pageFlip().flipPrev()
  }

  onPage = (e: any) => {
    this.setState({
      page: e.data,
    })
  }

  onChangeOrientation = (e: any) => {
    this.setState({
      orientation: e.data,
    })
  }

  onChangeState = (e: any) => {
    this.setState({
      state: e.data,
    })
  }

  componentDidMount() {
    this.setState({
      totalPage: pageCount,
    })
  }

  render() {
    return (
      <div className="mt-14 flex flex-col items-center">
        <div
          className={styles['container-md']}
          style={{ position: 'relative' }}
        >
          <HTMLFlipBook
            width={550}
            height={733}
            size="stretch"
            minWidth={115}
            maxWidth={2000}
            minHeight={100}
            maxHeight={2533}
            maxShadowOpacity={0.5}
            showCover
            mobileScrollSupport
            startPage={0}
            drawShadow={true}
            flippingTime={1000}
            usePortrait={true}
            startZIndex={0}
            autoSize={true}
            clickEventForward={true}
            useMouseEvents={true}
            swipeDistance={30}
            showPageCorners={true}
            disableFlipByClick={false}
            onFlip={this.onPage}
            onChangeOrientation={this.onChangeOrientation}
            onChangeState={this.onChangeState}
            className={[
              styles['flip-book'],
              styles['html-book'],
              styles['demo-book'],
            ].join(' ')}
            style={{ backgroundImage: 'url(images/background.jpg)' }}
            ref={(el) => (this.flipBook = el)}
          >
            {this.state.pages}
          </HTMLFlipBook>
        </div>

        <div className="container mt-3">
          <div className="row">
            <div className="col-md-6">
              <button
                type="button"
                className="btn btn-info btn-sm btn-prev"
                onClick={this.prevButtonClick}
              >
                Previous page
              </button>
              [<span>{this.state.page + 1}</span> of{' '}
              <span>{this.state.totalPage}</span>]
              <button
                type="button"
                className="btn btn-info btn-sm btn-next"
                onClick={this.nextButtonClick}
              >
                Next page
              </button>
            </div>
            <div className="col-md-6">
              State: <i>{this.state.state}</i>, orientation:{' '}
              <i>{this.state.orientation}</i>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
