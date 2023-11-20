import type { Meta, StoryObj } from '@storybook/react'
import Link from './'

const meta = {
  title: 'Components/Buttons/Link',
  component: Link,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
  },
} satisfies Meta<typeof Link>

export default meta
type Story = StoryObj<typeof meta>

export const LinkExample: Story = {
  args: {
    children: 'Example',
    href: '#',
  },
}
