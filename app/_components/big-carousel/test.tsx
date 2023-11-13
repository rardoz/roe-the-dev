import BigCarousel from '.'
import { render } from '@testing-library/react'

describe('Big Carousel', () => {
  it('should render', () => {
    expect(
      render(
        <BigCarousel>
          <div>TEST</div>
        </BigCarousel>,
      ).container,
    ).toMatchSnapshot()
  })
  it('should have title set to Test 123', () => {
    expect(
      render(
        <BigCarousel>
          <div>Test 123</div>
        </BigCarousel>,
      ).container.textContent,
    ).toBe('Test 123')
  })
})
