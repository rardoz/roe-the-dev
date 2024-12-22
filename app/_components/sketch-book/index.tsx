'use client'
import React, { useState, useEffect, useRef } from 'react'
import HTMLFlipBook from 'react-pageflip'
import styles from './style.module.css'
import Page from './page'
import PageCover from './page-cover'
import { Button } from 'flowbite-react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6'
const PAGE_COUNT = 10

const Passport: React.FC = () => {
  const [page, setPage] = useState(0)
  const [totalPage, setTotalPage] = useState(0)
  const [pages, setPages] = useState<React.ReactNode[]>([])

  const flipBookRef = useRef<any>(null)

  useEffect(() => {
    const pagesArray = [
      <PageCover key={0} pos="top">
        {''}
      </PageCover>,
    ]

    let pageNum = 0
    for (let i = 0; i < PAGE_COUNT; i++) {
      pageNum++
      if (pageNum > 8) pageNum = 1
      pagesArray.push(
        <Page key={i + 1} image={`${pageNum}.jpg`} number={i + 1}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. In cursus
          mollis nibh, non convallis ex convallis eu. Suspendisse potenti.
          Aenean vitae pellentesque erat.
        </Page>,
      )
    }

    pagesArray.push(
      <PageCover key={101} pos="bottom">
        THE END
      </PageCover>,
    )

    setPages(pagesArray)
    setTotalPage(PAGE_COUNT)
  }, [])

  const nextButtonClick = () => {
    flipBookRef.current.pageFlip().flipNext()
  }

  const prevButtonClick = () => {
    flipBookRef.current.pageFlip().flipPrev()
  }

  const onPage = (e: any) => {
    setPage(e.data)
  }

  return (
    <div className="mt-14 flex flex-col items-center">
      <div className={styles['container-md']} style={{ position: 'relative' }}>
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
          onFlip={onPage}
          className="book"
          style={{}}
          ref={flipBookRef}
        >
          {pages}
        </HTMLFlipBook>
      </div>

      <div className="container mt-3">
        <div className="row">
          <div className="col-md-6 flex justify-center items-center py-10">
            <Button
              outline={page < 1}
              onClick={prevButtonClick}
              size={'sm'}
              color={'purple'}
            >
              <FaChevronLeft />
            </Button>
            <div className="mx-3 text-sm">
              <span>{page < totalPage ? page : totalPage}</span> of{' '}
              <span>{totalPage}</span>
            </div>
            <Button
              outline={page > totalPage}
              onClick={nextButtonClick}
              size={'sm'}
              color={'purple'}
            >
              <FaChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Passport
