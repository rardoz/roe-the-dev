import { render } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import messages from '../../../../../messages/en-US.json'
import AboutSection from '.'

describe('About Section', () => {
  it('should render with default locale set', () => {
    expect(
      render(
        <NextIntlClientProvider locale="en-US" messages={messages}>
          <AboutSection />
        </NextIntlClientProvider>,
      ).container,
    ).toMatchSnapshot()
  })
})
