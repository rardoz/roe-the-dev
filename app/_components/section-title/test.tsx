import { render } from '@testing-library/react'
import SectionTitle from '.'

describe('SectionTitle', () => {
  it('should render', () => {
    expect(
      render(<SectionTitle>Hello there!</SectionTitle>).container,
    ).toMatchSnapshot()
  })
})
