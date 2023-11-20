/* eslint-disable @next/next/no-img-element */
import type { Meta, StoryObj } from '@storybook/react'
import Carousel from '.'

const meta = {
  title: 'Components/Carousels/Carousel',
  component: Carousel,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
  },
} satisfies Meta<typeof Carousel>

export default meta
type Story = StoryObj<typeof meta>

export const CarouselExample: Story = {
  args: {
    children: [
      <img
        key={1}
        src="https://flowbite.com/docs/images/carousel/carousel-1.svg"
        alt="..."
      />,
      <img
        key={2}
        src="https://flowbite.com/docs/images/carousel/carousel-2.svg"
        alt="..."
      />,
      <img
        key={3}
        src="https://flowbite.com/docs/images/carousel/carousel-3.svg"
        alt="..."
      />,
    ],
    className: 'w-56 h-56',
  },
}
