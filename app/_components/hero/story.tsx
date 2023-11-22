import type { Meta, StoryObj } from '@storybook/react'
import Hero from './'
const meta = {
  title: 'Components/App/Hero',
  component: Hero,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
  },
} satisfies Meta<typeof Hero>

export default meta
type Story = StoryObj<typeof meta>

export const HeroExample: Story = {
  args: {
    description: 'This is a description',
    title: 'This is a title',
    imageDescription: 'This is an image description',
    imageSrc: 'https://flowbite.com/docs/images/carousel/carousel-1.svg',
    chevron: true,
  },
}
