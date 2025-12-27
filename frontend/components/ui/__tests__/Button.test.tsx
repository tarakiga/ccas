import { render, screen, fireEvent } from '@/__tests__/utils/test-utils'
import { Button } from '../Button'
import { expect } from '@playwright/test'
import { expect } from '@playwright/test'
import { it } from 'node:test'
import { expect } from '@playwright/test'
import { expect } from '@playwright/test'
import { it } from 'node:test'
import { expect } from '@playwright/test'
import { expect } from '@playwright/test'
import { it } from 'node:test'
import { expect } from '@playwright/test'
import { it } from 'node:test'
import { expect } from '@playwright/test'
import { it } from 'node:test'
import { expect } from '@playwright/test'
import { it } from 'node:test'
import { describe } from 'node:test'

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    
    const button = screen.getByText('Click me')
    expect(button).toBeDisabled()
  })

  it('should apply variant classes', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    const button = screen.getByText('Primary')
    expect(button.className).toContain('bg-primary')
    
    rerender(<Button variant="secondary">Secondary</Button>)
    const secondaryButton = screen.getByText('Secondary')
    expect(secondaryButton.className).toContain('bg-gray')
  })

  it('should apply size classes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    const smallButton = screen.getByText('Small')
    expect(smallButton.className).toContain('h-8')
    
    rerender(<Button size="lg">Large</Button>)
    const largeButton = screen.getByText('Large')
    expect(largeButton.className).toContain('h-12')
  })

  it('should render loading state', () => {
    render(<Button loading>Loading</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button.querySelector('.animate-spin')).toBeInTheDocument()
  })
})
