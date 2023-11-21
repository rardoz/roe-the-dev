import { render } from '@testing-library/react'
import VideoBG from '.'

describe('VideoBG', () => {
  it('should render with absolute position', () => {
    expect(render(<VideoBG videoSrc="test.mp4" />).container).toMatchSnapshot()
  })

  it('should render with fixed position', () => {
    expect(
      render(<VideoBG videoSrc="test.mp4" fixed />).container,
    ).toMatchSnapshot()
  })
})
