import Footer from '.'
import { render } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import messages from '../../../messages/en-US.json'
import { mockIntersectionObserver } from 'jsdom-testing-mocks'
mockIntersectionObserver()

describe('Footer', () => {
  it('should render', () => {
    expect(
      render(
        <NextIntlClientProvider locale="en-US" messages={messages}>
          <Footer />
        </NextIntlClientProvider>,
      ).container,
    ).toMatchSnapshot()
  })
})
