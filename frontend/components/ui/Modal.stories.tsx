import type { Meta, StoryObj } from '@storybook/react'
import { Modal } from './Modal'

const meta = {
  title: 'UI/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Modal component for displaying content in an overlay. Includes backdrop blur, focus trap, and keyboard navigation.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: true,
    onClose: () => {},
    title: 'Modal Title',
    children: (
      <p className="text-gray-600">
        This is the modal content. You can put any content here.
      </p>
    ),
  },
}

export const WithFooter: Story = {
  args: {
    open: true,
    onClose: () => {},
    title: 'Confirm Action',
    children: <p className="text-gray-600">Are you sure you want to proceed with this action?</p>,
    footer: (
      <div className="flex gap-2">
        <button className="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
          Cancel
        </button>
        <button className="rounded bg-primary-500 px-4 py-2 text-sm text-white hover:bg-primary-600">
          Confirm
        </button>
      </div>
    ),
  },
}

export const LargeModal: Story = {
  args: {
    open: true,
    onClose: () => {},
    title: 'Large Modal',
    size: 'lg',
    children: (
      <div className="space-y-4">
        <p className="text-gray-600">This is a large modal with more content.</p>
        <p className="text-gray-600">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua.
        </p>
      </div>
    ),
  },
}
