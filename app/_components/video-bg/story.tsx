import type { Meta, StoryObj } from '@storybook/react'
import VideoBG from './'

const meta = {
  title: 'Components/Layouts/Video Background',
  component: VideoBG,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
  },
} satisfies Meta<typeof VideoBG>

export default meta
type Story = StoryObj<typeof meta>

export const VideoBGExample: Story = {
  args: {
    fixed: false,
    videoSrc: '/portfolio-video-720.mp4',
  },
  decorators: [(story) => <div className="h-screen">{story()}</div>],
}
