import type { Meta, StoryObj } from '@storybook/react'
import Card from '.'

const meta = {
  title: 'Components/Card',
  component: Card,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const CardExample: Story = {
  args: {
    imageSrc: 'https://flowbite.com/docs/images/carousel/carousel-1.svg',
    imageAlt: 'alt text goes here',
    title: 'Test title',
    description: 'Test description goes here...',
    link: '#',
    hardRoute: false,
  },
}
