import { useTranslations } from 'next-intl'
import React from 'react'
import { FaPlay, FaTrash } from 'react-icons/fa6'

const CodeButtonGroup: React.FC<
  React.PropsWithChildren<{ onPlay: () => void; onReset: () => void }>
> = (props) => {
  const t = useTranslations('Blog')

  return (
    <div>
      <div className="mb-10 mt-4">
        <div className="">
          <button
            onClick={props?.onPlay}
            className="min-w-20 border inline-flex justify-center items-center border-purple-700 hover:border-pink-600 bg-purple-700 text-white font-bold py-1 px-4 rounded-full hover:bg-pink-600 transition-all duration-500 ease-in-out "
          >
            <span>
              <FaPlay />
            </span>
            <span className="ml-2">{t('run')}</span>
          </button>
          <button
            onClick={props?.onReset}
            className="min-w-20 mt-2 inline-flex justify-center items-center border-purple-700 border text-purple-700 font-bold py-1 ml-2 px-4 rounded-full hover:text-pink-600 hover:border-pink-600 transition-all duration-500 ease-in-out "
          >
            <span>
              <FaTrash />
            </span>
            <span className="ml-2">{t('clear')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CodeButtonGroup
