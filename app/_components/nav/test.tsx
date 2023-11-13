import Nav from '.'
import { render } from '@testing-library/react'
import NavLinks from './nav-links'

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
