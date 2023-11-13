import type { Meta, StoryObj } from '@storybook/react'
import Nav from '.'
import NavLinks from './nav-links'

const meta = {
  title: 'Components/Nav',
  component: Nav,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
  },
} satisfies Meta<typeof Nav>

export default meta
type Story = StoryObj<typeof meta>

export const NavExample: Story = {
  args: {
    children: (
      <NavLinks>
        <a href="#">Link #1</a>
      </NavLinks>
    ),
    messages: { logoAltText: 'Logo', menuIconAltText: 'Menu Icon' },
  },
}
