import type { Meta, StoryObj } from '@storybook/react'
import { Toast } from './Toast'

const meta = {
  title: 'UI/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info'],
    },
    duration: {
      control: 'number',
    },
  },
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

export const Success: Story = {
  args: {
    type: 'success',
    title: 'Success!',
    message: 'Your changes have been saved successfully.',
    duration: 0, // Disable auto-dismiss for Storybook
  },
}

export const Error: Story = {
  args: {
    type: 'error',
    title: 'Error',
    message: 'Something went wrong. Please try again.',
    duration: 0,
  },
}

export const Warning: Story = {
  args: {
    type: 'warning',
    title: 'Warning',
    message: 'This action cannot be undone.',
    duration: 0,
  },
}

export const Info: Story = {
  args: {
    type: 'info',
    title: 'Information',
    message: 'New updates are available.',
    duration: 0,
  },
}

export const WithAction: Story = {
  args: {
    type: 'info',
    title: 'Update Available',
    message: 'A new version is ready to install.',
    duration: 0,
    action: {
      label: 'Update Now',
      onClick: () => alert('Update clicked'),
    },
  },
}
