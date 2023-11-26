import IconLinkButton from '.'
import { render } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import messages from '../../../messages/en-US.json'

describe('IconLinkButton', () => {
  it('should render with default locale set', () => {
    expect(
      render(
        <NextIntlClientProvider locale="en-US" messages={messages}>
          <IconLinkButton href="/blog" altText="blog">
            Blog
          </IconLinkButton>
        </NextIntlClientProvider>,
      ).container,
    ).toMatchSnapshot()
  })

  it('should include a className if set', () => {
    expect(
      render(
        <NextIntlClientProvider locale="en-US" messages={messages}>
          <IconLinkButton href="/blog" altText="blog" className="test">
            Blog
          </IconLinkButton>
        </NextIntlClientProvider>,
      ).container,
    ).toMatchSnapshot()
  })
})
