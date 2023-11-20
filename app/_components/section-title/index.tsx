import HR from '../hr'
import { FC, PropsWithChildren } from 'react'

const SectionTitle: FC<PropsWithChildren<{ light?: boolean }>> = ({
  children,
  light,
}) => {
  return (
    <div className="w-3/4 lg:w-1/2 mx-auto mt-8 -mb-4">
      <h2
        className={`text-center text-4xl font-bold ${
          light ? 'text-slate-50' : 'text-purple-700'
        }`}
      >
        {children}
      </h2>
      <HR />
    </div>
  )
}

export default SectionTitle
