import type { Meta, StoryObj } from '@storybook/react'
import Footer from '.'

const meta = {
  title: 'Components/App/Footer',
  component: Footer,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
  },
} satisfies Meta<typeof Footer>

export default meta
type Story = StoryObj<typeof meta>

export const FooterExample: Story = {}
