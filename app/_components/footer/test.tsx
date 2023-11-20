import Footer from '.'
import { render } from '@testing-library/react'

import { mockIntersectionObserver } from 'jsdom-testing-mocks'
mockIntersectionObserver()

describe('Footer', () => {
  it('should render', () => {
    expect(render(<Footer />).container).toMatchSnapshot()
  })
})
