import Carousel from '.'
import { render } from '@testing-library/react'

describe('Carousel', () => {
  it('should render', () => {
    expect(
      render(
        <Carousel>
          <div>TEST</div>
        </Carousel>,
      ).container,
    ).toMatchSnapshot()
  })

  it('should have title set to Test 123', () => {
    expect(
      render(
        <Carousel>
          <div>Test 123</div>
        </Carousel>,
      ).container.textContent,
    ).toBe('Test 123')
  })
})
