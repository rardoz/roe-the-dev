import { render } from '@testing-library/react'
import Hero from '.'

describe('Hero', () => {
  it('should render with default values', () => {
    expect(render(<Hero />).container).toMatchSnapshot()
  })
  it('should render with prop values set', () => {
    expect(
      render(
        <Hero
          description="This is a test description"
          title="this is a test title"
          imageDescription="this is an image test description"
          imageSrc="/test.png"
        />,
      ).container,
    ).toMatchSnapshot()
  })
  it('should render not have chevron', () => {
    expect(render(<Hero chevron={false} />).container).toMatchSnapshot()
  })
})
