import Nav from '.'
import { render } from '@testing-library/react'
import NavLinks from './nav-links'
import { mockIntersectionObserver } from 'jsdom-testing-mocks'
import messages from '../../../messages/en-US.json'
import { NextIntlClientProvider } from 'next-intl'
mockIntersectionObserver()

describe('Nav', () => {
  it('should render', () => {
    expect(
      render(
        <NextIntlClientProvider locale="en-US" messages={messages}>
          <Nav messages={{ menuIconAltText: 'menu icon', logoAltText: 'logo' }}>
            <NavLinks>
              <a href="#">test</a>
            </NavLinks>
          </Nav>
        </NextIntlClientProvider>,
      ).container,
    ).toMatchSnapshot()
  })
})
