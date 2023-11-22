import Breadcrumbs from '.'
import { render } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import messages from '../../../messages/en-US.json'
import { mockIntersectionObserver } from 'jsdom-testing-mocks'
mockIntersectionObserver()

describe('Breadcrumbs', () => {
  it('should render 1 crumb', () => {
    expect(
      render(
        <NextIntlClientProvider locale="en-US" messages={messages}>
          <Breadcrumbs links={[{ href: '#test1', label: 'test1' }]} />
        </NextIntlClientProvider>,
      ).container,
    ).toMatchSnapshot()
  })

  it('should render 2 crumb', () => {
    expect(
      render(
        <NextIntlClientProvider locale="en-US" messages={messages}>
          <Breadcrumbs
            links={[
              { href: '#test1', label: 'test1' },
              { href: '#test2', label: 'test2' },
            ]}
          />
        </NextIntlClientProvider>,
      ).container,
    ).toMatchSnapshot()
  })
})
