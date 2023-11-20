import Nav from '.'
import { render } from '@testing-library/react'
import NavLinks from './nav-links'
import { mockIntersectionObserver } from 'jsdom-testing-mocks'
mockIntersectionObserver()

describe('Nav', () => {
  it('should render', () => {
    expect(
      render(
        <Nav messages={{ menuIconAltText: 'menu icon', logoAltText: 'logo' }}>
          <NavLinks>
            <a href="#">test</a>
          </NavLinks>
        </Nav>,
      ).container,
    ).toMatchSnapshot()
  })
})
