import type { Meta, StoryObj } from '@storybook/react'
import Breadcrumbs from './'

const meta = {
  title: 'Components/App/Breadcrumbs',
  component: Breadcrumbs,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
  },
} satisfies Meta<typeof Breadcrumbs>

export default meta
type Story = StoryObj<typeof meta>

export const BreadcrumbsExample: Story = {
  args: {
    links: [
      { href: '/blog', label: 'Blog' },
      { href: '/blog/test', label: 'Test' },
    ],
  },
}
