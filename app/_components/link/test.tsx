import Link from '.'
import { render } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import messages from '../../../messages/en-US.json'

describe('Link', () => {
  it('should render with default locale set', () => {
    expect(
      render(
        <NextIntlClientProvider locale="en-US" messages={messages}>
          <Link href="#">Test 123</Link>
        </NextIntlClientProvider>,
      ).container,
    ).toMatchSnapshot()
  })

  it('should include a className if set', () => {
    expect(
      render(
        <NextIntlClientProvider locale="en-US" messages={messages}>
          <Link href="#" className="test">
            Test 123
          </Link>
        </NextIntlClientProvider>,
      ).container,
    ).toMatchSnapshot()
  })
})
