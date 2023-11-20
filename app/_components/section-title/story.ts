import type { Meta, StoryObj } from '@storybook/react'
import SectionTitle from './'

const meta = {
  title: 'Components/Text/Section Title',
  component: SectionTitle,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
  },
} satisfies Meta<typeof SectionTitle>

export default meta
type Story = StoryObj<typeof meta>

export const SectionTitleExample: Story = {
  args: {
    children: "I'm a section title",
    light: false,
  },
}
