import React, { useContext } from 'react'
import { useTranslations } from 'next-intl'
import LinkButton from '../../link-button'
import { lockIndicatorsContext } from '../lock/context/indicators'
import { BsUnlock, BsLockFill } from 'react-icons/bs'

interface PaginationProps {
  page: number
  totalPage: number
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPage }) => {
  const translations = useTranslations('SketchBook')
  const lockIndicators = useContext(lockIndicatorsContext)

  return (
    <div className="col-md-6 flex justify-center items-center pb-10">
      {page < 1 || page > totalPage ? (
        <LinkButton className="opacity-35 mx-5" href="#">
          {page === 0 ? 'Front Cover' : `Back Cover`}
        </LinkButton>
      ) : (
        <div className="flex justify-center mx-5">
          {lockIndicators?.pageLockStatus?.map((lock) => {
            return (
              <LinkButton
                className="mx-1"
                key={lock.page_number}
                href={
                  lock.locked
                    ? `sketch-book/code-gate/${lock.id}`
                    : `sketch-book/page-number/${lock.page_number}`
                }
              >
                <>
                  {lock.locked ? <BsLockFill /> : <BsUnlock />}
                  &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                  {translations('cta')} {lock.page_number}
                </>
              </LinkButton>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Pagination
