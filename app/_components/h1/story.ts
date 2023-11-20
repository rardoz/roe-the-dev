import type { Meta, StoryObj } from '@storybook/react'
import H1 from './'

const meta = {
  title: 'Components/Text/H1',
  component: H1,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
  },
} satisfies Meta<typeof H1>

export default meta
type Story = StoryObj<typeof meta>

export const H1Example: Story = {
  args: {
    children: 'Example',
  },
}
