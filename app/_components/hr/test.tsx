import { render } from '@testing-library/react'
import HR from '.'

describe('HR', () => {
  it('should render', () => {
    expect(render(<HR />).container).toMatchSnapshot()
  })
})
