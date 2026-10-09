import Layout from '.'
import { render } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import messages from '../../../messages/en-US.json'

import { mockIntersectionObserver } from 'jsdom-testing-mocks'
mockIntersectionObserver()

describe('Layout', () => {
  beforeAll(() => {
    jest.useFakeTimers({ doNotFake: ['requestAnimationFrame', 'performance'] })
    jest.setSystemTime(new Date('2025-01-01T12:00:00Z'))
  })

  afterAll(() => jest.useRealTimers())

  it('should render with default locale set', () => {
    expect(
      render(
        <NextIntlClientProvider locale="en-US" messages={messages}>
          <Layout params={{ locale: 'en-US' }} />
        </NextIntlClientProvider>,
      ).container,
    ).toMatchSnapshot()
  })

  it('should render with no locale set', () => {
    expect(
      render(
        <NextIntlClientProvider locale="en-US" messages={messages}>
          <Layout />
        </NextIntlClientProvider>,
      ).container,
    ).toMatchSnapshot()
  })
})
