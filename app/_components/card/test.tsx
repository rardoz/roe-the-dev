import Card from '.'
import { render } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import messages from '../../../messages/en-US.json'
describe('Carousel', () => {
  it('should render', () => {
    expect(
      render(
        <NextIntlClientProvider locale="en-US" messages={messages}>
          <Card
            description="Test description goes here..."
            imageAlt="alt text goes here"
            imageSrc="https://flowbite.com/docs/images/carousel/carousel-1.svg"
            link="https://roethedev.com"
            title="Test title"
            hardRoute
          />
        </NextIntlClientProvider>,
      ).container,
    ).toMatchSnapshot()
  })

  it('should render the card with image but without a link and without an alt text', () => {
    expect(
      render(
        <NextIntlClientProvider locale="en-US" messages={messages}>
          <Card
            imageSrc="https://flowbite.com/docs/images/carousel/carousel-1.svg"
            description="Test description goes here..."
            title="Test title"
          />
        </NextIntlClientProvider>,
      ).container,
    ).toMatchSnapshot()
  })

  it('should not have a link or image set if not provided', () => {
    expect(
      render(
        <NextIntlClientProvider locale="en-US" messages={messages}>
          <Card
            description="Test description goes here..."
            title="Test title"
          />
        </NextIntlClientProvider>,
      ).container,
    ).toMatchSnapshot()
  })
})
