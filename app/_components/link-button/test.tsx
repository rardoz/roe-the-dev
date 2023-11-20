import LinkButton from '.'
import { render } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import messages from '../../../messages/en-US.json'

describe('LinkButton', () => {
  it('should render with default locale set', () => {
    expect(
      render(
        <NextIntlClientProvider locale="en-US" messages={messages}>
          <LinkButton href="#">Test 123</LinkButton>
        </NextIntlClientProvider>,
      ).container,
    ).toMatchSnapshot()
  })

  it('should include a className if set', () => {
    expect(
      render(
        <NextIntlClientProvider locale="en-US" messages={messages}>
          <LinkButton href="#" className="test">
            Test 123
          </LinkButton>
        </NextIntlClientProvider>,
      ).container,
    ).toMatchSnapshot()
  })
})
