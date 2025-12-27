import type { Meta, StoryObj } from '@storybook/react'
import { Card } from './Card'

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'bordered', 'interactive'],
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
    hoverable: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-semibold">Card Title</h3>
        <p className="mt-2 text-gray-600">This is a default card with some content.</p>
      </div>
    ),
  },
}

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: (
      <div>
        <h3 className="text-lg font-semibold">Elevated Card</h3>
        <p className="mt-2 text-gray-600">This card has a shadow elevation.</p>
      </div>
    ),
  },
}

export const Bordered: Story = {
  args: {
    variant: 'bordered',
    children: (
      <div>
        <h3 className="text-lg font-semibold">Bordered Card</h3>
        <p className="mt-2 text-gray-600">This card has a thicker border.</p>
      </div>
    ),
  },
}

export const Interactive: Story = {
  args: {
    variant: 'interactive',
    hoverable: true,
    children: (
      <div>
        <h3 className="text-lg font-semibold">Interactive Card</h3>
        <p className="mt-2 text-gray-600">Hover over this card to see the effect.</p>
      </div>
    ),
  },
}

export const WithHeader: Story = {
  args: {
    header: <h3 className="text-lg font-semibold">Card Header</h3>,
    children: <p className="text-gray-600">Card content goes here.</p>,
  },
}

export const WithFooter: Story = {
  args: {
    children: <p className="text-gray-600">Card content goes here.</p>,
    footer: (
      <div className="flex justify-end gap-2">
        <button className="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
          Cancel
        </button>
        <button className="rounded bg-primary-500 px-4 py-2 text-sm text-white hover:bg-primary-600">
          Save
        </button>
      </div>
    ),
  },
}

export const Loading: Story = {
  args: {
    loading: true,
  },
}
