import H1 from '.'
import { render } from '@testing-library/react'

describe('H1', () => {
  it('should render', () => {
    expect(render(<H1>TEST</H1>).container).toMatchSnapshot()
  })
  it('should have title set to Test 123', () => {
    expect(render(<H1>Test 123</H1>).container.textContent).toBe('Test 123')
  })
})
