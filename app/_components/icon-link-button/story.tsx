import type { Meta, StoryObj } from '@storybook/react'
import IconLinkButton from './'

const meta = {
  title: 'Components/Buttons/IconLinkButton',
  component: IconLinkButton,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
  },
} satisfies Meta<typeof IconLinkButton>

export default meta
type Story = StoryObj<typeof meta>

export const IconLinkButtonExample: Story = {
  args: {
    children: '🇲🇽',
    altText: 'Mexican flag',
    href: '/#',
  },
}
