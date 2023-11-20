import type { Meta, StoryObj } from '@storybook/react'
import HR from './'

const meta = {
  title: 'Components/Text/HR',
  component: HR,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
  },
} satisfies Meta<typeof HR>

export default meta
type Story = StoryObj<typeof meta>

export const HRExample: Story = {}
