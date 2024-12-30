'use client'
import React, { useState, useEffect, useRef } from 'react'
import HTMLFlipBook from 'react-pageflip'
import styles from './style.module.css'
import Page from './page'
import PageCover from './page-cover'
import { Button } from 'flowbite-react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6'
import SketchBookProvider, { SketchWithHTML, PAGE_COUNT } from './context'
import LockIndicatorProvider from './lock/context/indicators'
import Pagination from './pagination'

const SketchBook: React.FC = () => {
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
        <Page number={i + 1} key={i + 1}>
          <SketchBookProvider page={i + 1}>
            <SketchWithHTML />
          </SketchBookProvider>
        </Page>,
      )
    }

    pagesArray.push(
      <PageCover key={PAGE_COUNT + 1} pos="bottom">
        {''}
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

  const onUpdate = (e: any) => {
    if (e.data === 'user_fold' || e.data === 'flipping') {
      // console.log('onUpdate', e)
    }
    //setPage(e.data)
  }

  return (
    <div>
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
          onChangeState={onUpdate}
          onFlip={onPage}
          className="book"
          style={{}}
          ref={flipBookRef}
        >
          {pages}
        </HTMLFlipBook>
      </div>

      <div className="w-100">
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
            &nbsp;&nbsp;&nbsp;
            <Button
              outline={page > totalPage}
              onClick={nextButtonClick}
              size={'sm'}
              color={'purple'}
            >
              <FaChevronRight />
            </Button>
          </div>
          <LockIndicatorProvider
            pageNumbers={page < 1 || page > totalPage ? [] : [page, page + 1]}
          >
            <Pagination page={page} totalPage={totalPage} />
          </LockIndicatorProvider>
        </div>
      </div>
    </div>
  )
}

export default SketchBook
