import type { Meta, StoryObj } from '@storybook/react'
import Layout from '.'

const meta = {
  title: 'Components/Layouts/Base',
  component: Layout,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
  },
} satisfies Meta<typeof Layout>

export default meta
type Story = StoryObj<typeof meta>

export const LayoutExample: Story = {
  args: {
    children: <div>Hello</div>,
    navForcedInView: true,
  },
}
